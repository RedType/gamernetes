import * as path from 'path';

import * as ec2 from 'aws-cdk-lib/aws-ec2';

import * as packages from './packages';
import { expectEnv } from '../util';

export enum ServerKind {
  ALL_THE_DRAGONS_7,
  ALL_OF_FABRICMON_6,
  COBBLEMON,
  TNP_LIMITLESS_6,
}

export const pathOf = (kind: ServerKind) => {
  switch (kind) {
  case ServerKind.ALL_THE_DRAGONS_7:
    return expectEnv('SERVERPATH_ATD7');
  case ServerKind.ALL_OF_FABRICMON_6:
    return expectEnv('SERVERPATH_AOF6');
  case ServerKind.COBBLEMON:
    return path.join(__dirname, './cobblemon');
  case ServerKind.TNP_LIMITLESS_6:
    return path.join(__dirname, './tnp_limitless_6');
  }
};

export const packagesOf = (kind: ServerKind) => {
  switch (kind) {
  case ServerKind.ALL_THE_DRAGONS_7:
    return [
      packages.common(),
      packages.java17(),
      packages.mcrcon(),
    ].flat();
  case ServerKind.ALL_OF_FABRICMON_6:
    return [
      packages.common(),
      packages.java17(),
      packages.mcrcon(),
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
  case ServerKind.ALL_THE_DRAGONS_7:
  case ServerKind.ALL_OF_FABRICMON_6:
  case ServerKind.COBBLEMON:
  case ServerKind.TNP_LIMITLESS_6:
    return [
      ec2.Port.tcp(25565), // game & query port
    ];
  }
};

