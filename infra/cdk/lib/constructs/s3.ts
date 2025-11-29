import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface S3ConstructProps {
  environment: string;
  bucketName?: string;
}

export class S3Construct extends Construct {
  public readonly uiBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: S3ConstructProps) {
    super(scope, id);

    // S3 bucket for UI assets
    this.uiBucket = new s3.Bucket(this, 'UiBucket', {
      bucketName:
        props.bucketName ||
        `sochoa-dev-ui-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}`,
      versioned: true, // Enable versioning for rollback capability
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Never allow public access directly
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true, // Require HTTPS for all requests
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep bucket on stack deletion
    });

    // Enable public read access only through CloudFront OAC
    // (we'll configure this in CloudFrontConstruct)

    // Add lifecycle policy: transition old versions to cheaper storage
    this.uiBucket.addLifecycleRule({
      noncurrentVersionTransitions: [
        {
          storageClass: s3.StorageClass.INTELLIGENT_TIERING,
          transitionAfter: cdk.Duration.days(30),
        },
        {
          storageClass: s3.StorageClass.GLACIER,
          transitionAfter: cdk.Duration.days(90),
        },
      ],
      noncurrentVersionExpiration: cdk.Duration.days(180), // Delete old versions after 6 months
    });

    // Outputs
    new cdk.CfnOutput(this, 'UiBucketName', {
      value: this.uiBucket.bucketName,
      exportName: 'UiBucketName',
    });

    new cdk.CfnOutput(this, 'UiBucketArn', {
      value: this.uiBucket.bucketArn,
      exportName: 'UiBucketArn',
    });
  }
}
