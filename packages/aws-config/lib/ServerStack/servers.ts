import * as path from 'path';

import * as ec2 from 'aws-cdk-lib/aws-ec2';

import * as packages from './packages';
import { expectEnv } from '../util';

export enum ServerKind {
  BIRDPACK,
  TNP_LIMITLESS_6,
}

export const pathOf = (kind: ServerKind) => {
  switch (kind) {
  case ServerKind.BIRDPACK:
    return expectEnv('SERVERPATH_BIRDPACK');
  case ServerKind.TNP_LIMITLESS_6:
    return path.join(__dirname, './tnp_limitless_6');
  }
};

export const packagesOf = (kind: ServerKind) => {
  switch (kind) {
  case ServerKind.BIRDPACK:
    return [
      packages.common(),
      packages.java17(),
      packages.mcrcon(),
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
  case ServerKind.BIRDPACK:
  case ServerKind.TNP_LIMITLESS_6:
    return [
      ec2.Port.tcp(25565), // game & query port
    ];
  }
};

