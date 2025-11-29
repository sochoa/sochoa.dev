import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface IamConstructProps {
  dbSecurityGroupId: string;
  dbSecretArn: string;
  cognitoSecretArn: string;
  apiKeysSecretArn: string;
  kmsKeyArn: string;
  environment: string;
}

export class IamConstruct extends Construct {
  public readonly lambdaRole: iam.Role;
  public readonly apiGatewayRole: iam.Role;

  constructor(scope: Construct, id: string, props: IamConstructProps) {
    super(scope, id);

    // Lambda execution role with minimal permissions
    this.lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for sochoa API Lambda functions',
      maxSessionDuration: cdk.Duration.hours(1),
    });

    // Allow Lambda to write logs to CloudWatch
    this.lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaBasicExecutionRole'
      )
    );

    // Allow Lambda to access VPC (for RDS connection)
    this.lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaVPCAccessExecutionRole'
      )
    );

    // Allow Lambda to read database password from Secrets Manager
    this.lambdaRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'secretsmanager:GetSecretValue',
          'secretsmanager:DescribeSecret',
        ],
        resources: [props.dbSecretArn],
        conditions: {
          StringEquals: {
            'secretsmanager:VersionStage': 'AWSCURRENT',
          },
        },
      })
    );

    // Allow Lambda to read API keys from Secrets Manager
    this.lambdaRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue'],
        resources: [props.apiKeysSecretArn],
      })
    );

    // Allow Lambda to read Cognito secrets for verification
    this.lambdaRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue'],
        resources: [props.cognitoSecretArn],
      })
    );

    // Allow Lambda to push metrics to CloudWatch
    this.lambdaRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['cloudwatch:PutMetricData'],
        resources: ['*'],
        conditions: {
          StringEquals: {
            'cloudwatch:namespace': 'sochoa',
          },
        },
      })
    );

    // CloudWatch Logs permissions
    this.lambdaRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: [
          `arn:aws:logs:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:log-group:/aws/lambda/sochoa-*`,
        ],
      })
    );

    // KMS permissions for decrypting secrets and logs
    this.lambdaRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'kms:Decrypt',
          'kms:DescribeKey',
        ],
        resources: [props.kmsKeyArn],
      })
    );

    // X-Ray write permissions for tracing
    this.lambdaRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'xray:PutTraceSegments',
          'xray:PutTelemetryRecords',
        ],
        resources: ['*'],
      })
    );

    // API Gateway role
    this.apiGatewayRole = new iam.Role(this, 'ApiGatewayRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      description: 'Role for API Gateway',
    });

    // Allow API Gateway to invoke Lambda
    this.apiGatewayRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: [
          `arn:aws:lambda:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:function:sochoa-api`,
        ],
      })
    );

    // Allow API Gateway to write logs
    this.apiGatewayRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: [
          `arn:aws:logs:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:log-group:/aws/apigateway/*`,
        ],
      })
    );

    // Allow API Gateway to decrypt KMS-encrypted logs
    this.apiGatewayRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'kms:Decrypt',
          'kms:DescribeKey',
        ],
        resources: [props.kmsKeyArn],
      })
    );

    // Outputs
    new cdk.CfnOutput(this, 'LambdaRoleArn', {
      value: this.lambdaRole.roleArn,
      exportName: 'LambdaRoleArn',
    });

    new cdk.CfnOutput(this, 'ApiGatewayRoleArn', {
      value: this.apiGatewayRole.roleArn,
      exportName: 'ApiGatewayRoleArn',
    });
  }
}
