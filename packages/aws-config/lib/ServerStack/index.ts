import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import {
  ServerKind,
  customPackagesOf,
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
  runScriptName?:    'run.sh'    | string;
  statusScriptName?: 'status.sh' | string;
}

export default class ServerStack extends cdk.Stack {
  public readonly instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: ServerProps) {
    super(scope, id, props);

    const runScript = props.runScriptName ?? 'run.sh';
    const statusScript = props.statusScriptName ?? 'status.sh';

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
        [packagesOf(server), (props.extraPackages ?? [])].flat()
          .map(p => ec2.InitPackage.apt(p)),

        customPackagesOf(server),

        // init user
        ec2.InitGroup.fromName('gamernetes'),
        ec2.InitUser.fromName('gamernetes', {
          groups: ['gamernetes'],
        }),

        // install server assets
        ec2.InitSource.fromAsset('/srv', pathOf(server)),
        ec2.InitCommand.argvCommand([
          'chown', '-R', 'gamernetes:gamernetes', '/srv',
        ]),
        ec2.InitCommand.argvCommand([
          'chmod', '-R', '774', '/srv', // rwxrwxr--
        ]),
        ec2.InitCommand.argvCommand([
          'chmod', '+t', '/srv', // add sticky
        ]),

        // install server service
        ec2.InitService.systemdConfigFile('gamernetesServer', {
          command: `/srv/${runScript}`,
          afterNetwork: true,
          cwd: '/srv',
          description: 'Content server for ' + server,
          group: 'gamernetes',
          user: 'gamernetes',
          keepRunning: true,
        }),

        // install watchdog
        ec2.InitFile.fromString('/etc/cron.d/gamernetesServerWatchdog', [
          '# Gamernetes server watchdog',
          '# Checks for activity in server every 15m',
          '0,15,30,45 * * * *  ' +
            `[ $(/srv/${statusScript}) = "idle" ] && shutdown now -h`,
          '',
          '# Existence of /var/g.reboot indicates that server just started',
          '# Intended to be deleted at first status check',
          '@reboot touch /var/g.reboot && chmod 777 /var/g.reboot',
        ].join('\n')),

        // run extra commands
        [props.extraCommands ?? []]
          .flat().map(c => ec2.InitCommand.shellCommand(c)),

        // start server
        ec2.InitService.enable('gamernetesServer'),
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

