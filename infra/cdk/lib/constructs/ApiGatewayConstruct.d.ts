import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
export interface ApiGatewayConstructProps {
    lambdaFunction: lambda.Function;
    environment: string;
    uiDomain: string;
}
export declare class ApiGatewayConstructConstruct extends Construct {
    readonly api: apigatewayv2.HttpApi;
    readonly apiUrl: string;
    constructor(scope: Construct, id: string, props: ApiGatewayConstructProps);
}
