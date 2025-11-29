import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
export interface CloudFrontConstructProps {
    uiBucket: s3.Bucket;
    apiGatewayUrl: string;
    environment: string;
    domainName?: string;
}
export declare class CloudFrontConstruct extends Construct {
    readonly distribution: cloudfront.Distribution;
    constructor(scope: Construct, id: string, props: CloudFrontConstructProps);
}
