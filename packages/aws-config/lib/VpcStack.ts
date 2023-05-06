import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface VpcProps extends cdk.StackProps {
}

export default class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: VpcProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'Vpc');
  }
}

