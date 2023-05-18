import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { lazy } from '../util';

export const common = lazy(() => [
  'tar', 'unzip',
].map(p => ec2.InitPackage.yum(p)));

export const java17 = lazy(() => [
  ec2.InitPackage.yum('java-17-amazon-corretto'),
]);

export const mcrcon = () => [
  ec2.InitPackage.rpm([
    'https://kojipkgs.fedoraproject.org//packages/mcrcon/0.7.2',
    '/4.fc39/aarch64/mcrcon-0.7.2-4.fc39.aarch64.rpm',
  ].join('')),
];

export const tnpLimitless6 = lazy(() => [
  ec2.InitSource.fromUrl('/srv', [
    'https://mediafilez.forgecdn.net/files/4526/912',
    '/LL6+Full+Server+Files+v1.24.0.zip',
  ].join('')),
  ec2.InitCommand.shellCommand([
    'echo "Installing TNP Limitless 6 server"',
    'cd /srv',
    'java -jar forge*.jar --installServer >/dev/null',
  ].join(' && ')),
]);

