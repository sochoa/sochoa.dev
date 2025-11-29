import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface KmsConstructProps {
  environment: string;
}

export class KmsConstruct extends Construct {
  public readonly encryptionKey: kms.Key;

  constructor(scope: Construct, id: string, props: KmsConstructProps) {
    super(scope, id);

    // Create customer-managed KMS key for encrypting sensitive data
    this.encryptionKey = new kms.Key(this, 'EncryptionKey', {
      description: 'KMS key for sochoa.dev encryption (RDS, S3, Logs, Secrets)',
      enableKeyRotation: true, // Automatic annual key rotation
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep key on stack deletion
      pendingWindow: cdk.Duration.days(7), // 7-day waiting period before deletion
    });

    // Add an alias for easier reference
    this.encryptionKey.addAlias(`alias/sochoa-${props.environment}`);

    // Allow CloudWatch Logs to use the key
    this.encryptionKey.grantEncryptDecrypt(
      new iam.ServicePrincipal(`logs.${cdk.Stack.of(this).region}.amazonaws.com`)
    );

    // Allow RDS to use the key
    this.encryptionKey.grantEncryptDecrypt(
      new iam.ServicePrincipal('rds.amazonaws.com')
    );

    // Allow S3 to use the key
    this.encryptionKey.grantEncryptDecrypt(
      new iam.ServicePrincipal('s3.amazonaws.com')
    );

    // Allow Secrets Manager to use the key
    this.encryptionKey.grantEncryptDecrypt(
      new iam.ServicePrincipal('secretsmanager.amazonaws.com')
    );

    // Outputs
    new cdk.CfnOutput(this, 'KmsKeyId', {
      value: this.encryptionKey.keyId,
      exportName: 'EncryptionKeyId',
      description: 'KMS Key ID for encryption',
    });

    new cdk.CfnOutput(this, 'KmsKeyArn', {
      value: this.encryptionKey.keyArn,
      exportName: 'EncryptionKeyArn',
      description: 'KMS Key ARN for encryption',
    });
  }
}
