import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface VpcConstructProps {
  cidr?: string;
  maxAzs?: number;
}

export class VpcConstruct extends Construct {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: VpcConstructProps) {
    super(scope, id);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      cidr: props?.cidr || '10.0.0.0/16',
      maxAzs: props?.maxAzs || 2,
      natGateways: 1, // Cost-effective for low-traffic apps
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: 'Public',
          cidrMask: 24,
        },
        {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          name: 'Private',
          cidrMask: 24,
        },
      ],
    });

    // Export VPC ID for reference
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      exportName: 'VpcId',
    });
  }
}
