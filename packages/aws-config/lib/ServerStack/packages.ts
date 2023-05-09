import * as ec2 from 'aws-cdk-lib/aws-ec2';

const lazy = <T>(init: () => T) => {
  let t: T | undefined;

  return () => {
    if (t === undefined) {
      t = init();
    }

    return t;
  };
};

export const mcrcon = lazy(() => [
  ec2.InitCommand.argvCommand(['mkdir', '/tmp/mcrcon']),
  ec2.InitSource.fromUrl('/tmp/mcrcon/mcrcon.tgz', [
    'https://github.com/Tiiffi/mcrcon/releases',
    '/download/v0.7.2/mcrcon-0.7.2-linux-x86-64.tar.gz',
  ].join('')),
  ec2.InitCommand.argvCommand(['tar', 'xzf', '/tmp/mcrcon/mcrcon.tgz']),
  ec2.InitCommand.argvCommand(['mv', '/tmp/mcrcon/mcrcon', '/usr/local/bin/mcrcon']),
  ec2.InitCommand.argvCommand(['rm', '-rf', '/tmp/mcrcon']),
  ec2.InitCommand.argvCommand(['chmod', '555', '/usr/local/bin/mcrcon']),
]);

