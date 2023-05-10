import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import {
  ServerKind,
  packagesOf,
  pathOf,
  publicPortsOf,
} from './servers';

export interface ServerProps extends cdk.StackProps {
  server: ServerKind;
  vpc: ec2.IVpc;
  extraCommands?: Array<string> | string;
  extraPackages?: Array<string> | string;
  extraPorts?: ec2.Port | Array<ec2.Port>;
  name?: string;
  shutdownTimer?: number; // minutes, default 0
}

/**
 * Expected control scripts
 *
 * - init.sh: runs once on server initialization
 * - run.sh: runs on startup
 * - status.sh: runs every 15m to check if server should shut down
 * - shutdown.sh: runs before shutdown
 *
 * status.sh may check to see if the server was just started by
 * checking /var/g.reboot, and print a status other than "idle", which
 * signals the server to shut down. If you use this mechanism, be sure
 * to delete /var/g.reboot. It will be recreated on reboot.
 */
export default class ServerStack extends cdk.Stack {
  public static readonly Kind = ServerKind;

  public readonly instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: ServerProps) {
    super(scope, id, props);

    const { server } = props;

    this.instance = new ec2.Instance(this, 'Server', {
      vpc: props.vpc,
      instanceType: new ec2.InstanceType('t4g.xlarge'),
      machineImage: ec2.MachineImage.genericLinux({
        'us-east-1': 'ami-0044130ca185d0880',
        'us-west-2': 'ami-0d9fad4f90eb14fc3',
      }),
      instanceName: props.name || id,
      keyName: id + 'SSHKey',
      init: ec2.CloudFormationInit.fromElements(...[
        // install packages
        [(props.extraPackages ?? [])].flat()
          .map(p => ec2.InitPackage.apt(p)),

        packagesOf(server),

        // init user
        ec2.InitGroup.fromName('gamernetes'),
        ec2.InitUser.fromName('gamernetes', {
          groups: ['gamernetes'],
        }),

        // install server assets
        ec2.InitSource.fromAsset('/srv', pathOf(server)),
        ec2.InitCommand.shellCommand([
          'cd /srv',
          './init.sh',
          'chown -R gamernetes:gamernetes /srv',
          'chmod -R 774 /srv', // rwxrwxr--
          'chmod +t /srv', // add sticky
        ].join(' && ')),

        // install server service
        ec2.InitFile.fromString('/etc/systemd/system/gamernetes.service', [
          '[Unit]',
          'Description=Content server for ' + server,
          'Wants=network.target',
          'After=network.target',
          '',
          '[Service]',
          'Type=simple',
          'User=gamernetes',
          'Group=gamernetes',
          'WorkingDirectory=/srv',
          'ExecStart=/srv/run.sh',
          'ExecStop=/srv/shutdown.sh',
          'Restart=on-failure',
          '',
          '[Install]',
          'WantedBy=multi-user.target',
        ].join('\n')),

        // install watchdog
        ec2.InitFile.fromString('/etc/cron.d/gamernetesServerWatchdog', [
          '# Gamernetes server watchdog',
          '# Checks for activity in server every 15m',
          '0,15,30,45 * * * *  ' +
            'if /srv/status.sh | grep -q "idle"; then ' +
              'systemctl stop gamernetes; ' +
              `shutdown -h +${props.shutdownTimer ?? 0}; ` +
            'fi',
          '',
          '# Existence of /var/g.coldstart indicates that server just started',
          '# Intended to be deleted at first status check',
          '@reboot touch /var/g.coldstart && chmod 777 /var/g.coldstart',
        ].join('\n')),

        // run extra commands
        [props.extraCommands ?? []].flat()
          .map(c => ec2.InitCommand.shellCommand(c)),

        // start server
        ec2.InitService.enable('gamernetes'),
      ].flat()),
    });

    // configure firewall
    this.instance.connections.allowFromAnyIpv4(ec2.Port.tcp(22)); // ssh
    for (const port of [
      publicPortsOf(server),
      (props.extraPorts ?? [])
    ].flat()) {
      this.instance.connections.allowFromAnyIpv4(port);
    }

    // create public ip
    new ec2.CfnEIP(this, 'ElasticIP', {
      domain: props.vpc.vpcId,
      instanceId: this.instance.instanceId,
    });

    // tag for iam
    cdk.Tags.of(this.instance).add('AccessCategory', 'gamernetesServer');
  }
}

