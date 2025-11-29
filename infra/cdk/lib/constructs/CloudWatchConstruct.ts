import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface CloudWatchConstructProps {
  lambdaFunction: lambda.Function;
  apiGateway: apigatewayv2.HttpApi;
  environment: string;
}

export class CloudWatchConstruct extends Construct {
  public readonly dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props: CloudWatchConstructProps) {
    super(scope, id);

    // Create custom namespace for application metrics
    const namespace = 'sochoa';

    // Dashboard for monitoring
    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `sochoa-${props.environment}`,
    });

    // Lambda metrics
    const lambdaDurationMetric = props.lambdaFunction.metricDuration({
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const lambdaErrorsMetric = props.lambdaFunction.metricErrors({
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const lambdaInvocationsMetric = props.lambdaFunction.metricInvocations({
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const lambdaThrottlesMetric = props.lambdaFunction.metricThrottles({
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    // API Gateway metrics
    const apiErrorsMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: '4XXError',
      dimensionsMap: {
        ApiId: props.apiGateway.httpApiId,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const api5xxErrorsMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: '5XXError',
      dimensionsMap: {
        ApiId: props.apiGateway.httpApiId,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const apiLatencyMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: 'Latency',
      dimensionsMap: {
        ApiId: props.apiGateway.httpApiId,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    // Add widgets to dashboard
    this.dashboard.addWidgets(
      // Lambda performance
      new cloudwatch.GraphWidget({
        title: 'Lambda Duration (ms)',
        left: [lambdaDurationMetric],
        height: 6,
      }),

      new cloudwatch.GraphWidget({
        title: 'Lambda Errors',
        left: [lambdaErrorsMetric],
        height: 6,
      }),

      // API Gateway performance
      new cloudwatch.GraphWidget({
        title: 'API Latency (ms)',
        left: [apiLatencyMetric],
        height: 6,
      }),

      new cloudwatch.GraphWidget({
        title: 'API Errors (4xx/5xx)',
        left: [apiErrorsMetric, api5xxErrorsMetric],
        height: 6,
      })
    );

    // Add second row with additional metrics
    this.dashboard.addWidgets(
      new cloudwatch.SingleValueWidget({
        title: 'Lambda Invocations (5m)',
        metrics: [lambdaInvocationsMetric],
        height: 6,
      }),

      new cloudwatch.SingleValueWidget({
        title: 'Lambda Throttles',
        metrics: [lambdaThrottlesMetric],
        height: 6,
      })
    );

    // Create alarms for critical issues
    const lambdaErrorAlarm = new cloudwatch.Alarm(
      this,
      'LambdaErrorAlarm',
      {
        alarmName: `sochoa-${props.environment}-lambda-errors`,
        metric: lambdaErrorsMetric,
        threshold: 5, // Alert if >5 errors in 5 minutes
        evaluationPeriods: 1,
        alarmDescription:
          'Alert when Lambda function has errors',
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }
    );

    const lambda5xxErrorAlarm = new cloudwatch.Alarm(
      this,
      'Api5xxErrorAlarm',
      {
        alarmName: `sochoa-${props.environment}-api-5xx-errors`,
        metric: api5xxErrorsMetric,
        threshold: 10, // Alert if >10 5xx errors in 5 minutes
        evaluationPeriods: 2,
        alarmDescription: 'Alert when API returns 5xx errors',
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }
    );

    const apiLatencyAlarm = new cloudwatch.Alarm(
      this,
      'ApiLatencyAlarm',
      {
        alarmName: `sochoa-${props.environment}-api-high-latency`,
        metric: apiLatencyMetric,
        threshold: 2000, // Alert if average latency > 2 seconds
        evaluationPeriods: 2,
        alarmDescription:
          'Alert when API latency is abnormally high',
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }
    );

    // Outputs
    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${cdk.Stack.of(this).region}#dashboards:name=${this.dashboard.dashboardName}`,
      exportName: 'CloudWatchDashboardUrl',
    });

    new cdk.CfnOutput(this, 'LambdaErrorAlarmName', {
      value: lambdaErrorAlarm.alarmName,
      exportName: 'LambdaErrorAlarmName',
    });
  }
}
