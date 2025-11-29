import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
export interface IamConstructProps {
    dbSecurityGroupId: string;
    dbSecretArn: string;
    cognitoSecretArn: string;
    apiKeysSecretArn: string;
    environment: string;
}
export declare class IamConstruct extends Construct {
    readonly lambdaRole: iam.Role;
    readonly apiGatewayRole: iam.Role;
    constructor(scope: Construct, id: string, props: IamConstructProps);
}
