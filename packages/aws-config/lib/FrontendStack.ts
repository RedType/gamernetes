import * as fs from 'fs';
import * as path from 'path';
import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as cf from 'aws-cdk-lib/aws-cloudfront';
import * as cfo from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3d from 'aws-cdk-lib/aws-s3-deployment';

const CODE_PATH = path.join(__dirname, '../../frontend-app/build');

export interface FrontendStackProps extends cdk.StackProps {
  apiURL: string;
  authURL: string;
}

export default class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    if (!fs.existsSync(CODE_PATH)) {
      throw new Error([
        'You need to build frontend-app!',
        'Missing file:',
        CODE_PATH,
      ].join(' '));
    }

    const oai = new cf.OriginAccessIdentity(this, 'OAI', {
      comment: 'Gamernetes OAI',
    });

    const bucket = new s3.Bucket(this, 'AppBucket');
    bucket.grantRead(oai);

    const cdn = new cf.Distribution(this, 'CDN', {
      comment: 'Gamernetes app distribution',
      defaultBehavior: {
        origin: new cfo.S3Origin(bucket, { originAccessIdentity: oai }),
      },
      priceClass: cf.PriceClass.PRICE_CLASS_100,
    });

    new s3d.BucketDeployment(this, 'AppDeployment', {
      distribution: cdn,
      destinationBucket: bucket,
      sources: [
        s3d.Source.asset(CODE_PATH),
        s3d.Source.jsonData('configs.json', {
          apiURL: props.apiURL,
          authURL: props.authURL,
        }),
      ],
    });
  }
}

