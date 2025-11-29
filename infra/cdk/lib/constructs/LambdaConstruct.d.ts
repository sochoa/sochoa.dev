import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
export interface LambdaConstructProps {
    vpc: ec2.Vpc;
    lambdaRole: iam.Role;
    dbEndpoint: string;
    dbPort: string;
    dbName: string;
    dbSecretArn: string;
    apiKeysSecretArn: string;
    environment: string;
}
export declare class LambdaConstruct extends Construct {
    readonly function: lambda.Function;
    constructor(scope: Construct, id: string, props: LambdaConstructProps);
}
