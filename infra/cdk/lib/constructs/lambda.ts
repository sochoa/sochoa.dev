import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export interface LambdaConstructProps {
  vpc: ec2.Vpc;
  lambdaRole: iam.Role;
  dbEndpoint: string;
  dbPort: string;
  dbName: string;
  dbSecretArn: string;
  apiKeysSecretArn: string;
  encryptionKey: kms.IKey;
  environment: string;
}

export class LambdaConstruct extends Construct {
  public readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // CloudWatch log group for Lambda
    const logGroup = new logs.LogGroup(this, 'LambdaLogs', {
      logGroupName: '/aws/lambda/sochoa-api',
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryptionKey: props.encryptionKey,
    });

    // Lambda function using Docker image
    // This allows us to use the Go binary with custom runtime
    this.function = new lambda.DockerImageFunction(
      this,
      'ApiFunction',
      {
        code: lambda.DockerImageCode.fromImageAsset(
          '../../../api', // Path to Go API directory
          {
            file: 'Dockerfile.lambda',
            buildArgs: {
              GOOS: 'linux',
              GOARCH: 'arm64', // Use ARM64 for better Lambda performance
            },
          }
        ),
        functionName: 'sochoa-api',
        description: 'sochoa.dev API Lambda function',
        role: props.lambdaRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 512, // Adjust based on workload
        architecture: lambda.Architecture.ARM_64,
        vpc: props.vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        environment: {
          DEV_MODE: props.environment === 'dev' ? 'false' : 'false',
          LOG_LEVEL: 'info',
          DB_HOST: props.dbEndpoint,
          DB_PORT: props.dbPort,
          DB_NAME: props.dbName,
          DB_USER: 'postgres',
          DB_SECRET_ARN: props.dbSecretArn,
          API_KEYS_SECRET_ARN: props.apiKeysSecretArn,
          ENVIRONMENT: props.environment,
        },
        logGroup: logGroup,
        tracing: lambda.Tracing.ACTIVE, // Enable X-Ray tracing
      }
    );

    // Outputs
    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: this.function.functionName,
      exportName: 'LambdaFunctionName',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: this.function.functionArn,
      exportName: 'LambdaFunctionArn',
    });
  }
}
