import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { Construct } from 'constructs';
export interface CloudWatchConstructProps {
    lambdaFunction: lambda.Function;
    apiGateway: apigatewayv2.HttpApi;
    environment: string;
}
export declare class CloudWatchConstruct extends Construct {
    readonly dashboard: cloudwatch.Dashboard;
    constructor(scope: Construct, id: string, props: CloudWatchConstructProps);
}
