import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
export interface CognitoConstructProps {
    cognitoSecrets: secretsmanager.Secret;
    uiDomain: string;
    environment: string;
}
export declare class CognitoConstruct extends Construct {
    readonly userPool: cognito.UserPool;
    readonly userPoolClient: cognito.UserPoolClient;
    readonly identityProvider: cognito.UserPoolIdentityProviderGoogle;
    constructor(scope: Construct, id: string, props: CognitoConstructProps);
}
