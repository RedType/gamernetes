import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export const cfnUserData = (
  stack: cdk.Stack,
  instanceId: string,
) => {
  const data = ec2.UserData.forLinux({ shebang: '#!/bin/bash -xe' });
  data.addCommands(
    '#!/bin/bash -xe',
    'apt-get update -y',
    'apt-get -y install python3-pip',
    'mkdir -p /opt/aws',
    'pip3 install https://s3.amazonaws.com/cloudformation-examples' +
      '/aws-cfn-bootstrap-py3-latest.tar.gz',
    'ln -s /usr/local/init/ubuntu/cfn-hup /etc/init.d/cfn-hup',
    '/usr/local/bin/cfn-init -v \\',
      `--stack ${stack.stackName} \\`,
      `--resource ${instanceId} \\`,
      `--region ${stack.region}`,
    '/usr/local/bin/cfn-signal -e $? \\',
      `--stack ${stack.stackName} \\`,
      `--resource ${instanceId} \\`,
      `--region ${stack.region}`,
  );
  return data;
};

export const cfnInit = (
  stack: cdk.Stack,
  instanceId: string,
) => [
  ec2.InitFile.fromString('/etc/cfn/cfn-hup.conf', [
    '[main]',
    'stack=' + stack.stackId,
    'region=' + stack.region,
  ].join('\n'), {
    mode: '000400',
    owner: 'root',
    group: 'root',
  }),

  ec2.InitFile.fromString('/etc/cfn/hooks.d/cfn-auto-reloader.conf', [
    '[cfn-auto-reloader-hook]',
    'triggers=post.update',
    'path=Resources.WebServerInstance.Metadata.' +
      'AWS::CloudFormation::Init',
    'action=/opt/aws/bin/cfn-init -v ' +
      `--stack ${stack.stackName} ` +
      `--resource ${instanceId} ` +
      `--region ${stack.region}`,
    'runas=root',
  ].join('\n'), {
    mode: '000400',
    owner: 'root',
    group: 'root',
  }),

  ec2.InitFile.fromString('/lib/systemd/system/cfn-hup.service', [
    '[Unit]',
    'Description=cfn-hup daemon',
    '',
    '[Service]',
    'Type=simple',
    'ExecStart=/usr/local/bin/cfn-hup',
    'Restart=always',
    '',
    '[Install]',
    'WantedBy=multi-user.target',
  ].join('\n')),
  ec2.InitService.enable('cfn-hup'),
];

