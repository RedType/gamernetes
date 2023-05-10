#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import ServerStack from '../lib/ServerStack';
import VpcStack from '../lib/VpcStack';

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'VpcStack');

new ServerStack(app, 'TnpLimitless6', {
  server: ServerStack.Kind.TNP_LIMITLESS_6,
  vpc: vpcStack.vpc,
});

app.synth();

