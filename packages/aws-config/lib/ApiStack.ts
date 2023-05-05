import * as fs from 'fs';
import * as path from 'path';
import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apiv2auth from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import * as apiv2int from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

const CODE_PATH = path.join(__dirname, '../../api-handler/dist');

export interface ApiStackProps extends cdk.StackProps {
  authorizer: apiv2auth.HttpUserPoolAuthorizer;
  userPool: cognito.IUserPool;
}

export default class ApiStack extends cdk.Stack {
  public readonly api: apiv2.HttpApi;
  public readonly handler: lambda.Function;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    if (!fs.existsSync(CODE_PATH)) {
      throw new Error([
        'You need to build api-handler!',
        'Missing file:',
        CODE_PATH,
      ].join(' '));
    }

    this.handler = new lambda.Function(this, 'Handler', {
      description: 'Handler for Gamernetes API',
      code: lambda.Code.fromAsset(CODE_PATH),
      handler: 'index.default',
      runtime: lambda.Runtime.NODEJS_18_X,
    });
      
    this.api = new apiv2.HttpApi(this, 'HttpApi', {
      description: 'Gamernetes API',
      defaultAuthorizer: props.authorizer,
      defaultIntegration: new apiv2int.HttpLambdaIntegration('HandlerInt', this.handler, {
      }),
    });
  }
}

