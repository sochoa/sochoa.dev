import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
export interface VpcConstructProps {
    cidr?: string;
    maxAzs?: number;
}
export declare class VpcConstruct extends Construct {
    readonly vpc: ec2.Vpc;
    constructor(scope: Construct, id: string, props?: VpcConstructProps);
}
