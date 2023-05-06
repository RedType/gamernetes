#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import ServerStack, { ServerKind } from '../lib/ServerStack';
import VpcStack from '../lib/VpcStack';

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'VpcStack');

new ServerStack(app, 'Cobblemon', {
  server: ServerKind.COBBLEMON,
  vpc: vpcStack.vpc,
});

app.synth();

