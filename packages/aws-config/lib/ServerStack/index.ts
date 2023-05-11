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

    const sshKey = new ec2.CfnKeyPair(this, 'SSHKey', {
      keyName: id + 'SSHKey',
      keyType: 'ed25519',
    });

    this.instance = new ec2.Instance(this, 'Server', {
      vpc: props.vpc,
      instanceType: new ec2.InstanceType('t4g.xlarge'),
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      instanceName: props.name || id,
      keyName: sshKey.keyName,
      initOptions: {
        configSets: ['default'],
      },
      init: ec2.CloudFormationInit.fromConfigSets({
        configSets: {
          default: ['install', 'configure', 'services'],
        },
        configs: {
          install: new ec2.InitConfig([
            // add user
            ec2.InitUser.fromName('gamernetes'), // also adds group

            // install packages
            packagesOf(server),
          ].flat()),
          configure: new ec2.InitConfig([
            // install server assets
            ec2.InitSource.fromAsset('/srv', pathOf(server)),
            ec2.InitCommand.shellCommand([
              'echo "Configuring..."',
              'ls -alh /srv',
              'chown -R gamernetes:gamernetes /srv',
              'chmod -R 774 /srv', // rwxrwxr--
              'chmod +t /srv', // add sticky
              'cd /srv',
              './init.sh',
            ].join(' && ')),
          ].flat()),
          services: new ec2.InitConfig([
            // systemd unit
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

            // watchdog script
            ec2.InitFile.fromString('/usr/local/lib/gamernetes/watchdog.sh', [
              'if /srv/status.sh | grep -q "idle"; then ' +
                'systemctl stop gamernetes; ' +
                `shutdown -h +${props.shutdownTimer ?? 0}; ` +
              'fi',
            ].join('\n')),

            // watchdog unit
            ec2.InitFile.fromString('/etc/systemd/system/gamernetesWatchdog.timer', [
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

            // status file unit
            ec2.InitFile.fromString('/etc/systemd/system/gamernetesStatus.timer', [
              '[Unit]',
              'Description=Gamernetes status file toucher',
              '',
              '[Timer]',
              'OnBootSec=0',
              '',
              '[Install]',
              'WantedBy=timers.target',
            ].join('\n')),

            // start server
            ec2.InitService.enable('crond'),
            ec2.InitService.enable('gamernetes'),
          ].flat()),
        },
      }),
    });

    // configure firewall
    this.instance.connections.allowFromAnyIpv4(ec2.Port.tcp(22)); // ssh
    for (const port of publicPortsOf(server)) {
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

