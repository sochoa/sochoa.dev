import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface SecretsConstructProps {
  environment: string;
}

export class SecretsConstruct extends Construct {
  public readonly dbPasswordSecret: secretsmanager.Secret;
  public readonly cognitoSecrets: secretsmanager.Secret;
  public readonly apiKeysSecret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props: SecretsConstructProps) {
    super(scope, id);

    // RDS database password
    this.dbPasswordSecret = new secretsmanager.Secret(this, 'DbPassword', {
      description: 'RDS PostgreSQL master password',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres',
        }),
        generateStringKey: 'password',
        passwordLength: 32,
        excludeCharacters: '"@/\\',
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Cognito OAuth credentials (Google, LinkedIn)
    this.cognitoSecrets = new secretsmanager.Secret(
      this,
      'CognitoSecrets',
      {
        description: 'Cognito OAuth provider credentials',
        secretObjectValue: {
          googleClientId: cdk.SecretValue.unsafePlainText(''),
          googleClientSecret: cdk.SecretValue.unsafePlainText(''),
          linkedinClientId: cdk.SecretValue.unsafePlainText(''),
          linkedinClientSecret: cdk.SecretValue.unsafePlainText(''),
        },
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      }
    );

    // API signing keys and misc credentials
    this.apiKeysSecret = new secretsmanager.Secret(this, 'ApiKeys', {
      description: 'API signing keys and credentials',
      secretObjectValue: {
        metricsSigningKey: cdk.SecretValue.unsafePlainText(''),
        corsOrigins: cdk.SecretValue.unsafePlainText('https://sochoa.dev'),
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Outputs for reference
    new cdk.CfnOutput(this, 'DbPasswordSecretArn', {
      value: this.dbPasswordSecret.secretArn,
      exportName: 'DbPasswordSecretArn',
    });

    new cdk.CfnOutput(this, 'CognitoSecretsArn', {
      value: this.cognitoSecrets.secretArn,
      exportName: 'CognitoSecretsArn',
    });

    new cdk.CfnOutput(this, 'ApiKeysSecretArn', {
      value: this.apiKeysSecret.secretArn,
      exportName: 'ApiKeysSecretArn',
    });
  }
}
