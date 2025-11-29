import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
export interface SecretsConstructProps {
    environment: string;
}
export declare class SecretsConstruct extends Construct {
    readonly dbPasswordSecret: secretsmanager.Secret;
    readonly cognitoSecrets: secretsmanager.Secret;
    readonly apiKeysSecret: secretsmanager.Secret;
    constructor(scope: Construct, id: string, props: SecretsConstructProps);
}
