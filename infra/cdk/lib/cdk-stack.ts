import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcConstruct } from './constructs/vpc';
import { SecretsConstruct } from './constructs/secrets';
import { RdsConstruct } from './constructs/rds';
import { S3Construct } from './constructs/s3';
import { CloudFrontConstruct } from './constructs/cloudfront';
import { CognitoConstruct } from './constructs/cognito';
import { IamConstruct } from './constructs/iam';
import { LambdaConstruct } from './constructs/lambda';
import { ApiGatewayConstruct } from './constructs/api_gateway';
import { CloudWatchConstruct } from './constructs/cloudwatch';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get environment from context or default to 'dev'
    const environment = this.node.tryGetContext('environment') || 'dev';
    const uiDomain = this.node.tryGetContext('uiDomain') || 'https://sochoa.dev';

    // 1. Create VPC (foundation for Lambda and RDS)
    const vpc = new VpcConstruct(this, 'VpcConstruct', {
      cidr: '10.0.0.0/16',
      maxAzs: 2,
    });

    // 2. Create Secrets Manager for sensitive data
    const secrets = new SecretsConstruct(this, 'SecretsConstruct', {
      environment,
    });

    // 3. Create RDS PostgreSQL database
    const rds = new RdsConstruct(this, 'RdsConstruct', {
      vpc: vpc.vpc,
      masterUserPassword: secrets.dbPasswordSecret,
      environment,
    });

    // 4. Create S3 bucket for UI
    const s3 = new S3Construct(this, 'S3Construct', {
      environment,
      bucketName: `sochoa-ui-${this.account}-${this.region}`,
    });

    // 5. Create IAM roles (needed before Lambda)
    const iam = new IamConstruct(this, 'IamConstruct', {
      dbSecurityGroupId: rds.securityGroup.securityGroupId,
      dbSecretArn: secrets.dbPasswordSecret.secretArn,
      cognitoSecretArn: secrets.cognitoSecrets.secretArn,
      apiKeysSecretArn: secrets.apiKeysSecret.secretArn,
      environment,
    });

    // 6. Create Lambda function for API
    const lambda = new LambdaConstruct(this, 'LambdaConstruct', {
      vpc: vpc.vpc,
      lambdaRole: iam.lambdaRole,
      dbEndpoint: rds.database.dbInstanceEndpointAddress,
      dbPort: rds.database.dbInstanceEndpointPort,
      dbName: 'sochoa',
      dbSecretArn: secrets.dbPasswordSecret.secretArn,
      apiKeysSecretArn: secrets.apiKeysSecret.secretArn,
      environment,
    });

    // 7. Allow Lambda to connect to RDS
    rds.securityGroup.addIngressRule(
      cdk.aws_ec2.Peer.securityGroupId(
        lambda.function.connections.securityGroups[0].securityGroupId
      ),
      cdk.aws_ec2.Port.tcp(5432),
      'Allow PostgreSQL from Lambda'
    );

    // 8. Create API Gateway
    const apiGateway = new ApiGatewayConstruct(
      this,
      'ApiGatewayConstruct',
      {
        lambdaFunction: lambda.function,
        environment,
        uiDomain,
      }
    );

    // 9. Create Cognito for authentication
    const cognito = new CognitoConstruct(this, 'CognitoConstruct', {
      cognitoSecrets: secrets.cognitoSecrets,
      uiDomain,
      environment,
    });

    // 10. Create CloudFront distribution for UI
    const cloudfront = new CloudFrontConstruct(
      this,
      'CloudFrontConstruct',
      {
        uiBucket: s3.uiBucket,
        apiGatewayUrl: apiGateway.apiUrl || 'https://api.example.com',
        environment,
        domainName: uiDomain,
      }
    );

    // 11. Create CloudWatch monitoring
    const monitoring = new CloudWatchConstruct(
      this,
      'CloudWatchConstruct',
      {
        lambdaFunction: lambda.function,
        apiGateway: apiGateway.api,
        environment,
      }
    );

    // Stack outputs
    new cdk.CfnOutput(this, 'StackName', {
      value: this.stackName,
      description: 'Stack name',
    });

    new cdk.CfnOutput(this, 'Environment', {
      value: environment,
      description: 'Deployment environment',
    });

    new cdk.CfnOutput(this, 'UiUrl', {
      value: `https://${cloudfront.distribution.domainName}`,
      description: 'CloudFront UI URL',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: apiGateway.apiUrl,
      description: 'API Gateway URL',
    });
  }
}
