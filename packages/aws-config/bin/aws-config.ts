#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { expectEnv } from '../lib/util';

import ServerStack from '../lib/ServerStack';

const env: cdk.Environment = {
  account: expectEnv('AWS_ACCOUNT'),
  region: expectEnv('AWS_REGION'),
};

const app = new cdk.App();

/*
new ServerStack(app, 'TnpLimitless6', {
  env,
  server: ServerStack.Kind.TNP_LIMITLESS_6,
});
*/

app.synth();

