import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface ApiGatewayConstructProps {
  lambdaFunction: lambda.Function;
  environment: string;
  uiDomain: string;
}

export class ApiGatewayConstructConstruct extends Construct {
  public readonly api: apigatewayv2.HttpApi;
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);

    // CloudWatch log group for API Gateway access logs
    const accessLogGroup = new logs.LogGroup(this, 'ApiAccessLogs', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create HTTP API (modern, lightweight alternative to REST API)
    this.api = new apigatewayv2.HttpApi(this, 'HttpApi', {
      apiName: `sochoa-${props.environment}`,
      description: 'sochoa.dev API Gateway',
      corsPreflight: {
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.PUT,
          apigatewayv2.CorsHttpMethod.DELETE,
          apigatewayv2.CorsHttpMethod.PATCH,
        ],
        allowOrigins: [props.uiDomain, 'http://localhost:5173'], // Local dev
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Amz-Date',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
        allowCredentials: true,
        maxAge: cdk.Duration.hours(24),
      },
    });

    // Add Lambda integration
    const lambdaIntegration = new apigatewayv2_integrations.HttpLambdaIntegration(
      'LambdaIntegration',
      props.lambdaFunction,
      {
        payloadFormatVersion: apigatewayv2.PayloadFormatVersion.VERSION_2_0,
      }
    );

    // Route all requests to Lambda
    this.api.addRoutes({
      path: '/{proxy+}',
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: lambdaIntegration,
    });

    // Root path
    this.api.addRoutes({
      path: '/',
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: lambdaIntegration,
    });

    // Note: Access logs for HTTP API need to be configured separately
    // This can be done via the AWS console or additional CDK patterns

    // API Gateway must have permission to invoke Lambda
    props.lambdaFunction.grantInvoke(
      new cdk.aws_iam.ServicePrincipal('apigateway.amazonaws.com')
    );

    this.apiUrl = this.api.url || '';

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.apiUrl,
      exportName: 'ApiGatewayUrl',
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.httpApiId,
      exportName: 'ApiGatewayId',
    });
  }
}
