import * as path from 'path';
import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export enum ServerKind {
  COBBLEMON,
}

const pathOf = (kind: ServerKind) => {
  switch (kind) {
  case ServerKind.COBBLEMON:
    return path.join(__dirname, './cobblemon');
  }
}

const packagesOf = (kind: ServerKind) => {
  switch (kind) {
  case ServerKind.COBBLEMON:
    return ['openjdk-17-jre-headless'];
  }
}

export interface ServerProps extends cdk.StackProps {
  server: ServerKind;
  vpc: ec2.IVpc;
  extraCommands?: Array<string> | string;
  extraPackages?: Array<string> | string;
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

    this.instance = new ec2.Instance(this, 'Server', {
      vpc: props.vpc,
      instanceType: new ec2.InstanceType('t4g.xlarge'),
      machineImage: ec2.MachineImage.genericLinux({
        'us-east-1': 'ami-0044130ca185d0880',
        'us-west-2': 'ami-0d9fad4f90eb14fc3',
      }),
      instanceName: props.name || id,
      init: ec2.CloudFormationInit.fromElements(...[
        // install packages
        [...packagesOf(props.server), ...(props.extraPackages ?? [])]
          .flat().map(p => ec2.InitPackage.apt(p)),

        // init user
        ec2.InitGroup.fromName('gamernetes'),
        ec2.InitUser.fromName('gamernetes', {
          groups: ['gamernetes'],
        }),

        // install server assets
        ec2.InitSource.fromAsset('/srv', pathOf(props.server)),
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
          description: 'Content server',
          group: 'gamernetes',
          user: 'gamernetes',
          keepRunning: true,
        }),

        // install watchdog
        ec2.InitFile.fromString('/etc/cron.d/gamernetesServerWatchdog', [
          '# Gamernetes server watchdog',
          '# Checks for activity in server every 15m',
          '0,15,30,45 * * * *  ' +
            `[ $(/srv/${statusScript}) = "shutdown" ] && shutdown now -h`,
        ].join('\n')),

        // run extra commands
        [props.extraCommands ?? []]
          .flat().map(c => ec2.InitCommand.shellCommand(c)),

        // start server
        ec2.InitService.enable('gamernetesServer'),
      ].flat()),
    });

    cdk.Tags.of(this.instance).add('AccessCategory', 'gamernetesServer');
  }
}

