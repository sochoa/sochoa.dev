import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
export interface RdsConstructProps {
    vpc: ec2.Vpc;
    masterUserPassword: secretsmanager.Secret;
    environment: string;
}
export declare class RdsConstruct extends Construct {
    readonly database: rds.DatabaseInstance;
    readonly securityGroup: ec2.SecurityGroup;
    constructor(scope: Construct, id: string, props: RdsConstructProps);
}
