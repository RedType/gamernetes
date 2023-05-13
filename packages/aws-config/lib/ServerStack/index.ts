import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import systemdServices from './services';
import {
  ServerKind,
  packagesOf,
  pathOf,
  publicPortsOf,
} from './servers';

type InstanceSize =
  | 'nano'
  | 'micro'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge'
  | '2xlarge'
  ;

export interface ServerProps extends cdk.StackProps {
  server: ServerKind;
  name?: string;
  size?: InstanceSize;
  shutdownTimer?: number; // minutes, default 0
  vpc?: ec2.IVpc;
}

/**
 * Expected control scripts
 *
 * - init.sh: runs once on server initialization
 * - run.sh: runs on startup
 * - status.sh: runs every 15m to check if server should shut down
 * - shutdown.sh: runs to initiate shutdown
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

    const instanceType = `t4g.${props.size || 'large'}`;
    const vpc = props.vpc ?? ec2.Vpc.fromLookup(this, 'DefaultVPC', { isDefault: true });

    const sshKey = new ec2.CfnKeyPair(this, 'SSHKey', {
      keyName: id + 'SSHKey',
      keyType: 'ed25519',
    });

    this.instance = new ec2.Instance(this, 'Server', {
      vpc,
      instanceType: new ec2.InstanceType(instanceType),
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      instanceName: props.name || id,
      keyName: sshKey.keyName,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
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
            // patch server assets
            ec2.InitSource.fromAsset('/srv', pathOf(server)),
            // configure
            ec2.InitCommand.shellCommand([
              'echo "Configuring..."',
              'ls -alh /srv',
              'chown -R gamernetes:gamernetes /srv',
              'chmod -R 1775 /srv', // drwxrwxr-t
              'cd /srv',
              './init.sh',
            ].join(' && ')),
          ].flat()),
          services: systemdServices(props.shutdownTimer),
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
      domain: vpc.vpcId,
      instanceId: this.instance.instanceId,
    });

    // tag for iam
    cdk.Tags.of(this.instance).add('AccessCategory', 'gamernetesServer');
  }
}

