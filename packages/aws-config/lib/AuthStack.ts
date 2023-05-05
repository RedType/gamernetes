import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apiv2auth from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';

export interface AuthProps extends cdk.StackProps {
  callbackURL: Array<string> | string;
  redirectURL: string;
}

export default class AuthStack extends cdk.Stack {
  public readonly pool: cognito.UserPool;
  public readonly signInUrl: string;
  public readonly authorizer: apiv2auth.HttpUserPoolAuthorizer;

  constructor(scope: Construct, id: string, props: AuthProps) {
    super(scope, id, props);

    this.pool = new cognito.UserPool(this, 'UserPool', {
      accountRecovery: cognito.AccountRecovery.NONE,
      signInCaseSensitive: false,
    });

    const client = this.pool.addClient('GamernetesAdmin', {
      authFlows: {
        userPassword: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        callbackUrls: [props.callbackURL].flat(),
      },
      refreshTokenValidity: cdk.Duration.days(365 * 10),
    });

    const domain = this.pool.addDomain('GamernetesAuth', {
      cognitoDomain: {
        domainPrefix: 'gamernetes',
      },
    });

    this.signInUrl = domain.signInUrl(client, {
      redirectUri: props.redirectURL,
    });

    this.authorizer = new apiv2auth.HttpUserPoolAuthorizer(
      'HttpAuthorizer',
      this.pool,
      { userPoolClients: [client] },
    );
  }
}

