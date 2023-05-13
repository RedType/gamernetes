import * as path from 'path';

import { Port } from 'aws-cdk-lib/aws-ec2';

import * as packages from './packages';

export enum ServerKind {
  ALL_THE_MODS_7,
  COBBLEMON,
  TNP_LIMITLESS_6,
}

export const pathOf = (kind: ServerKind) => {
  let sPath: string;

  switch (kind) {
  case ServerKind.ALL_THE_MODS_7:
    sPath = './atm7'; break;
  case ServerKind.COBBLEMON:
    sPath = './cobblemon'; break;
  case ServerKind.TNP_LIMITLESS_6:
    sPath = './tnp_limitless_6'; break;
  }

  return path.join(__dirname, sPath);
};

export const packagesOf = (kind: ServerKind) => {
  switch (kind) {
  case ServerKind.ALL_THE_MODS_7:
    return [
      packages.common(),
      packages.java17(),
      packages.mcrcon(),
      packages.atm7(),
    ].flat();
  case ServerKind.COBBLEMON:
    return [
      packages.common(),
      packages.java17(),
      packages.mcrcon(),
      packages.cobblemon(),
    ].flat();
  case ServerKind.TNP_LIMITLESS_6:
    return [
      packages.common(),
      packages.java17(),
      packages.mcrcon(),
      packages.tnpLimitless6(),
    ].flat();
  }
};

export const publicPortsOf = (kind: ServerKind) => {
  switch (kind) {
  case ServerKind.ALL_THE_MODS_7:
  case ServerKind.COBBLEMON:
  case ServerKind.TNP_LIMITLESS_6:
    return [
      Port.tcp(25565), // game & query port
    ];
  }
};

