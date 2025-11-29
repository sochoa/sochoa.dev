import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
export interface S3ConstructProps {
    environment: string;
    bucketName?: string;
}
export declare class S3Construct extends Construct {
    readonly uiBucket: s3.Bucket;
    constructor(scope: Construct, id: string, props: S3ConstructProps);
}
