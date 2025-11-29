import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export interface S3ConstructProps {
  environment: string;
  bucketName?: string;
  encryptionKey: kms.IKey;
}

export class S3Construct extends Construct {
  public readonly uiBucket: s3.Bucket;
  public readonly logsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: S3ConstructProps) {
    super(scope, id);

    // S3 bucket for access logs (separate from UI bucket)
    this.logsBucket = new s3.Bucket(this, 'LogsBucket', {
      bucketName:
        `sochoa-ui-logs-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: props.encryptionKey,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: false, // Logs don't need versioning
    });

    // S3 bucket for UI assets
    this.uiBucket = new s3.Bucket(this, 'UiBucket', {
      bucketName:
        props.bucketName ||
        `sochoa-dev-ui-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}`,
      versioned: true, // Enable versioning for rollback capability
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Never allow public access directly
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: props.encryptionKey, // Use customer-managed KMS key
      enforceSSL: true, // Require HTTPS for all requests
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep bucket on stack deletion
      serverAccessLogsBucket: this.logsBucket, // Enable access logging to separate bucket
      serverAccessLogsPrefix: 'ui-bucket-logs/',
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

    new cdk.CfnOutput(this, 'LogsBucketName', {
      value: this.logsBucket.bucketName,
      exportName: 'UiLogsBucketName',
    });

    new cdk.CfnOutput(this, 'LogsBucketArn', {
      value: this.logsBucket.bucketArn,
      exportName: 'UiLogsBucketArn',
    });
  }
}
