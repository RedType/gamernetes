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

export const common = lazy(() => [
  'tar', 'unzip',
].map(p => ec2.InitPackage.apt(p)));

export const java17 = lazy(() => [
  ec2.InitPackage.apt('openjdk-17-jre-headless'),
]);

export const rcon = (pass: string = 'uwu', port: number = 25575) => [
  ec2.InitPackage.apt('rcon'),
  ec2.InitFile.fromString('/etc/rcon.conf', [
    '[default]',
    'host = localhost',
    'port = ' + port,
    'passwd = ' + pass,
  ].join('\n')),
];

export const tnpLimitless6 = lazy(() => [
  ec2.InitSource.fromUrl('/srv/LL6.zip', [
    'https://mediafilez.forgecdn.net/files/4526/912',
    '/LL6+Full+Server+Files+v1.24.0.zip',
  ].join('')),
  ec2.InitCommand.argvCommand(['unzip', 'srv/LL6.zip']),
  ec2.InitCommand.shellCommand([
    'cd /srv',
    'unzip LL6.zip',
    'java -jar forge*.jar --installServer',
  ].join(' && ')),
]);

export const cobblemon = () => { throw new Error('Cobblemon is NYI') };

