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

export const atm7 = lazy(() => [
  ec2.InitSource.fromUrl('/srv', [
    'https://mediafilez.forgecdn.net/files/4034/8',
    '/ATM7-0.4.34-server.zip',
  ].join('')),

  // updates
  ec2.InitFile.fromUrl('/srv/mods/geckolib-forge-1.18-3.0.57.jar', [
    'https://mediafilez.forgecdn.net/files/4181/370',
    '/geckolib-forge-1.18-3.0.57.jar',
  ].join('')),
  ec2.InitCommand.argvCommand([
    'rm', '/src/mods/geckolib-forge-1.18-3.0.45.jar',
  ]),

  ec2.InitFile.fromUrl('/srv/mods/creeperoverhaul-1.3.1-forge.jar', [
    'https://mediafilez.forgecdn.net/files/4063/132',
    '/creeperoverhaul-1.3.1-forge.jar',
  ].join('')),
  ec2.InitCommand.argvCommand([
    'rm', '/src/mods/creeperoverhaul-1.18.2-1.3.0-forge.jar',
  ]),

  ec2.InitFile.fromUrl('/srv/mods/create-1.18.2-0.5.0.i.jar', [
    'https://mediafilez.forgecdn.net/files/4371/807',
    '/create-1.18.2-0.5.0.i.jar',
  ].join('')),
  ec2.InitCommand.argvCommand([
    'rm', '/src/mods/create-1.18.2-0.5.0.e.jar',
  ]),

  ec2.InitFile.fromUrl('/srv/mods/createaddition-1.18.2-20230507a.jar', [
    'https://mediafilez.forgecdn.net/files/4526/962',
    '/createaddition-1.18.2-20230507a.jar',
  ].join('')),
  ec2.InitCommand.argvCommand([
    'rm', '/srv/mods/createaddition-1.18.2-20220914a.jar',
  ]),

  // new packages
  ec2.InitFile.fromUrl('/srv/mods/DragonSurvival-1.18.2-1.5.42.jar', [
    'https://mediafilez.forgecdn.net/files/4509/338',
    '/DragonSurvival-1.18.2-1.5.42.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/supersaturation-1.18.2-3.0.3.jar', [
    'https://mediafilez.forgecdn.net/files/3874/507',
    '/supersaturation-1.18.2-3.0.3.jar'
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/pamhc2foodcore-1.18.2-1.0.3.jar', [
    'https://mediafilez.forgecdn.net/files/3951/938',
    '/pamhc2foodcore-1.18.2-1.0.3.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/pamhc2crops-1.18.2-1.0.5.jar', [
    'https://mediafilez.forgecdn.net/files/4050/832',
    '/pamhc2crops-1.18.2-1.0.5.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/pamhc2trees-1.18.2-1.0.4.jar', [
    'https://mediafilez.forgecdn.net/files/4360/314',
    '/pamhc2trees-1.18.2-1.0.4.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/pamhc2foodextended-1.18.2-1.0.5.jar', [
    'https://mediafilez.forgecdn.net/files/3998/848',
    '/pamhc2foodextended-1.18.2-1.0.5.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/NethersDelight-1.18.2-2.2.0.jar', [
    'https://mediafilez.forgecdn.net/files/3756/127',
    '/NethersDelight-1.18.2-2.2.0.jar'
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/Tinkers+Reforged+1.18.2-2.0.6.jar', [
    'https://mediafilez.forgecdn.net/files/4494/766',
    '/Tinkers+Reforged+1.18.2-2.0.6.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/TCIntegrations-1.18.2-2.0.15.0.jar', [
    'https://mediafilez.forgecdn.net/files/4095/272',
    '/TCIntegrations-1.18.2-2.0.15.0.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/createdeco-1.3.2-1.18.2.jar', [
    'https://mediafilez.forgecdn.net/files/4519/293',
    '/createdeco-1.3.2-1.18.2.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/Steam_Rails-1.2.6-forge-mc1.18.2.jar', [
    'https://mediafilez.forgecdn.net/files/4512/536',
    '/Steam_Rails-1.2.6%2Bforge-mc1.18.2.jar'
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/Steam_Rails-1.2.6-forge-mc1.18.2.jar', [
    'https://mediafilez.forgecdn.net/files/4512/536',
    '/Steam_Rails-1.2.6%2Bforge-mc1.18.2.jar'
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/extendedgears.jar', [
    'https://mediafilez.forgecdn.net/files/4459/65',
    '/extendedgears-2.0.2-1.18.2-0.5.0.iforge-1.18.2.jar'
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/createoreexcavation-1.0.3.jar', [
    'https://mediafilez.forgecdn.net/files/4519/861',
    '/createoreexcavation-1.0.3.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/ChiselsBits.jar', [
    'https://mediafilez.forgecdn.net/files/4119/191',
    '/ChiselsBits-forge-1.18.2-1.2.116-universal.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/mcw-furniture-3.1.0-mc1.18.2forge.jar', [
    'https://mediafilez.forgecdn.net/files/4419/7',
    '/mcw-furniture-3.1.0-mc1.18.2forge.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/mcwfurnituresbyg-1.18.2-1.1.jar', [
    'https://mediafilez.forgecdn.net/files/4426/313',
    '/mcwfurnituresbyg-1.18.2-1.1.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/macawsbridgesbyg-fabric-1.18.2-1.4.jar', [
    'https://mediafilez.forgecdn.net/files/4473/694',
    '/macawsbridgesbyg-fabric-1.18.2-1.4.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/macawsroofsbyg-fabric-1.18.2-1.3.jar', [
    'https://mediafilez.forgecdn.net/files/4474/769',
    '/macawsroofsbyg-fabric-1.18.2-1.3.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/mcwfencesbyg-1.18.2-1.3.jar', [
    'https://mediafilez.forgecdn.net/files/3926/837',
    '/mcwfencesbyg-1.18.2-1.3.jar',
  ].join('')),
  ec2.InitFile.fromUrl('/srv/mods/thedragonsays-1.3.0.jar', [
    'https://mediafilez.forgecdn.net/files/4492/534',
    '/thedragonsays-1.3.0.jar',
  ].join('')),
  ec2.InitCommand.shellCommand([
    'echo "Installing All the Mods 7 server"',
    'cd /srv',
    'chmod +x startserver.sh',
    'ATM7_INSTALL_ONLY=true ./startserver.sh >/dev/null',
  ].join(' && ')),
]);

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

export const cobblemon = () => { throw new Error('Cobblemon is NYI') };

