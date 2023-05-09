import * as path from 'path';

import { Port } from 'aws-cdk-lib/aws-ec2';

import * as packages from './packages';

export enum ServerKind {
  COBBLEMON,
  TNP_LIMITLESS_6,
}

export const pathOf = (kind: ServerKind) => {
  let sPath: string;

  switch (kind) {
  case ServerKind.COBBLEMON:
    throw new Error('Cobblemon is NYI');
    //sPath = './cobblemon'; break;
  case ServerKind.TNP_LIMITLESS_6:
    sPath = './tnp_limitless_6'; break;
  }

  return path.join(__dirname, sPath);
};

export const packagesOf = (kind: ServerKind) => {
  switch (kind) {
  case ServerKind.COBBLEMON:
  case ServerKind.TNP_LIMITLESS_6:
    return ['openjdk-17-jre-headless'];
  }
};

export const customPackagesOf = (kind: ServerKind) => {
  switch (kind) {
  case ServerKind.COBBLEMON:
  case ServerKind.TNP_LIMITLESS_6:
    return [
      packages.mcrcon(),
    ].flat();
  }
}

export const publicPortsOf = (kind: ServerKind) => {
  switch (kind) {
  case ServerKind.COBBLEMON:
  case ServerKind.TNP_LIMITLESS_6:
    return [
      Port.tcp(25565), // game port
      Port.tcp(25566), // query port
    ];
  }
};

