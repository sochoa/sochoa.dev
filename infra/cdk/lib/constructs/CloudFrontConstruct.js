"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudFrontConstruct = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const cloudfront = __importStar(require("aws-cdk-lib/aws-cloudfront"));
const origins = __importStar(require("aws-cdk-lib/aws-cloudfront-origins"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const constructs_1 = require("constructs");
class CloudFrontConstruct extends constructs_1.Construct {
    distribution;
    constructor(scope, id, props) {
        super(scope, id);
        // Create the CloudFront distribution
        this.distribution = new cloudfront.Distribution(this, 'Distribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(props.uiBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                compress: true,
            },
            additionalBehaviors: {
                // API endpoints - no caching, pass auth headers
                '/api/*': {
                    origin: new origins.HttpOrigin(props.apiGatewayUrl, {
                        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
                    }),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
                },
                // Swagger UI - no caching
                '/swagger/*': {
                    origin: new origins.HttpOrigin(props.apiGatewayUrl, {
                        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
                    }),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                },
                // Health check endpoint - no caching
                '/api/health': {
                    origin: new origins.HttpOrigin(props.apiGatewayUrl, {
                        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
                    }),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                },
            },
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.minutes(0),
                },
            ],
            defaultRootObject: 'index.html',
            httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
            enableLogging: true,
            logBucket: new s3.Bucket(this, 'LogBucket', {
                blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
                encryption: s3.BucketEncryption.S3_MANAGED,
                removalPolicy: cdk.RemovalPolicy.RETAIN,
                lifecycleRules: [
                    {
                        expiration: cdk.Duration.days(90),
                    },
                ],
            }),
            logFilePrefix: 'cloudfront-logs/',
        });
        // Update S3 bucket policy to allow CloudFront OAC access
        props.uiBucket.addToResourcePolicy(new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            principals: [new cdk.aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
            actions: ['s3:GetObject'],
            resources: [props.uiBucket.arnForObjects('*')],
            conditions: {
                StringEquals: {
                    'AWS:SourceArn': `arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/${this.distribution.distributionId}`,
                },
            },
        }));
        // Update S3 bucket policy to allow public read through CloudFront
        // (CloudFront's default behavior provides OAC protection)
        // Outputs
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: this.distribution.domainName,
            exportName: 'CloudFrontDomainName',
        });
        new cdk.CfnOutput(this, 'DistributionId', {
            value: this.distribution.distributionId,
            exportName: 'CloudFrontDistributionId',
        });
    }
}
exports.CloudFrontConstruct = CloudFrontConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xvdWRGcm9udENvbnN0cnVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNsb3VkRnJvbnRDb25zdHJ1Y3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBQ25DLHVFQUF5RDtBQUN6RCw0RUFBOEQ7QUFDOUQsdURBQXlDO0FBQ3pDLDJDQUF1QztBQVN2QyxNQUFhLG1CQUFvQixTQUFRLHNCQUFTO0lBQ2hDLFlBQVksQ0FBMEI7SUFFdEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUErQjtRQUN2RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLHFDQUFxQztRQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3BFLGVBQWUsRUFBRTtnQkFDZixNQUFNLEVBQUUsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7Z0JBQzVDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUI7Z0JBQ3ZFLFdBQVcsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLGlCQUFpQjtnQkFDckQsUUFBUSxFQUFFLElBQUk7YUFDZjtZQUNELG1CQUFtQixFQUFFO2dCQUNuQixnREFBZ0Q7Z0JBQ2hELFFBQVEsRUFBRTtvQkFDUixNQUFNLEVBQUUsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUU7d0JBQ2xELGNBQWMsRUFBRSxVQUFVLENBQUMsb0JBQW9CLENBQUMsVUFBVTtxQkFDM0QsQ0FBQztvQkFDRixvQkFBb0IsRUFBRSxVQUFVLENBQUMsb0JBQW9CLENBQUMsVUFBVTtvQkFDaEUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCO29CQUNwRCxjQUFjLEVBQUUsVUFB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QUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3hDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWM7WUFDdkMsVUFBVSxFQUFFLDBCQUEwQjtTQUN2QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUEvRkQsa0RBK0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQnO1xuaW1wb3J0ICogYXMgb3JpZ2lucyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udC1vcmlnaW5zJztcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGludGVyZmFjZSBDbG91ZEZyb250Q29uc3RydWN0UHJvcHMge1xuICB1aUJ1Y2tldDogczMuQnVja2V0O1xuICBhcGlHYXRld2F5VXJsOiBzdHJpbmc7XG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIGRvbWFpbk5hbWU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBDbG91ZEZyb250Q29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHVibGljIHJlYWRvbmx5IGRpc3RyaWJ1dGlvbjogY2xvdWRmcm9udC5EaXN0cmlidXRpb247XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IENsb3VkRnJvbnRDb25zdHJ1Y3RQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uXG4gICAgdGhpcy5kaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5EaXN0cmlidXRpb24odGhpcywgJ0Rpc3RyaWJ1dGlvbicsIHtcbiAgICAgIGRlZmF1bHRCZWhhdmlvcjoge1xuICAgICAgICBvcmlnaW46IG5ldyBvcmlnaW5zLlMzT3JpZ2luKHByb3BzLnVpQnVja2V0KSxcbiAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgICAgIGNhY2hlUG9saWN5OiBjbG91ZGZyb250LkNhY2hlUG9saWN5LkNBQ0hJTkdfT1BUSU1JWkVELFxuICAgICAgICBjb21wcmVzczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBhZGRpdGlvbmFsQmVoYXZpb3JzOiB7XG4gICAgICAgIC8vIEFQSSBlbmRwb2ludHMgLSBubyBjYWNoaW5nLCBwYXNzIGF1dGggaGVhZGVyc1xuICAgICAgICAnL2FwaS8qJzoge1xuICAgICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuSHR0cE9yaWdpbihwcm9wcy5hcGlHYXRld2F5VXJsLCB7XG4gICAgICAgICAgICBwcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5PcmlnaW5Qcm90b2NvbFBvbGljeS5IVFRQU19PTkxZLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LkhUVFBTX09OTFksXG4gICAgICAgICAgY2FjaGVQb2xpY3k6IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kuQ0FDSElOR19ESVNBQkxFRCxcbiAgICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19BTEwsXG4gICAgICAgICAgY2FjaGVkTWV0aG9kczogY2xvdWRmcm9udC5DYWNoZWRNZXRob2RzLkNBQ0hFX0dFVF9IRUFELFxuICAgICAgICB9LFxuICAgICAgICAvLyBTd2FnZ2VyIFVJIC0gbm8gY2FjaGluZ1xuICAgICAgICAnL3N3YWdnZXIvKic6IHtcbiAgICAgICAgICBvcmlnaW46IG5ldyBvcmlnaW5zLkh0dHBPcmlnaW4ocHJvcHMuYXBpR2F0ZXdheVVybCwge1xuICAgICAgICAgICAgcHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuT3JpZ2luUHJvdG9jb2xQb2xpY3kuSFRUUFNfT05MWSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5IVFRQU19PTkxZLFxuICAgICAgICAgIGNhY2hlUG9saWN5OiBjbG91ZGZyb250LkNhY2hlUG9saWN5LkNBQ0hJTkdfRElTQUJMRUQsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIEhlYWx0aCBjaGVjayBlbmRwb2ludCAtIG5vIGNhY2hpbmdcbiAgICAgICAgJy9hcGkvaGVhbHRoJzoge1xuICAgICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuSHR0cE9yaWdpbihwcm9wcy5hcGlHYXRld2F5VXJsLCB7XG4gICAgICAgICAgICBwcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5PcmlnaW5Qcm90b2NvbFBvbGljeS5IVFRQU19PTkxZLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LkhUVFBTX09OTFksXG4gICAgICAgICAgY2FjaGVQb2xpY3k6IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kuQ0FDSElOR19ESVNBQkxFRCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBlcnJvclJlc3BvbnNlczogW1xuICAgICAgICB7XG4gICAgICAgICAgaHR0cFN0YXR1czogNDA0LFxuICAgICAgICAgIHJlc3BvbnNlSHR0cFN0YXR1czogMjAwLFxuICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG4gICAgICAgICAgdHRsOiBjZGsuRHVyYXRpb24ubWludXRlcygwKSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBkZWZhdWx0Um9vdE9iamVjdDogJ2luZGV4Lmh0bWwnLFxuICAgICAgaHR0cFZlcnNpb246IGNsb3VkZnJvbnQuSHR0cFZlcnNpb24uSFRUUDJfQU5EXzMsXG4gICAgICBlbmFibGVMb2dnaW5nOiB0cnVlLFxuICAgICAgbG9nQnVja2V0OiBuZXcgczMuQnVja2V0KHRoaXMsICdMb2dCdWNrZXQnLCB7XG4gICAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgICAgIGVuY3J5cHRpb246IHMzLkJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcbiAgICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgICAgICBsaWZlY3ljbGVSdWxlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGV4cGlyYXRpb246IGNkay5EdXJhdGlvbi5kYXlzKDkwKSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSksXG4gICAgICBsb2dGaWxlUHJlZml4OiAnY2xvdWRmcm9udC1sb2dzLycsXG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgUzMgYnVja2V0IHBvbGljeSB0byBhbGxvdyBDbG91ZEZyb250IE9BQyBhY2Nlc3NcbiAgICBwcm9wcy51aUJ1Y2tldC5hZGRUb1Jlc291cmNlUG9saWN5KFxuICAgICAgbmV3IGNkay5hd3NfaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIGVmZmVjdDogY2RrLmF3c19pYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICBwcmluY2lwYWxzOiBbbmV3IGNkay5hd3NfaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2Nsb3VkZnJvbnQuYW1hem9uYXdzLmNvbScpXSxcbiAgICAgICAgYWN0aW9uczogWydzMzpHZXRPYmplY3QnXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbcHJvcHMudWlCdWNrZXQuYXJuRm9yT2JqZWN0cygnKicpXSxcbiAgICAgICAgY29uZGl0aW9uczoge1xuICAgICAgICAgIFN0cmluZ0VxdWFsczoge1xuICAgICAgICAgICAgJ0FXUzpTb3VyY2VBcm4nOiBgYXJuOmF3czpjbG91ZGZyb250Ojoke2Nkay5TdGFjay5vZih0aGlzKS5hY2NvdW50fTpkaXN0cmlidXRpb24vJHt0aGlzLmRpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25JZH1gLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBVcGRhdGUgUzMgYnVja2V0IHBvbGljeSB0byBhbGxvdyBwdWJsaWMgcmVhZCB0aHJvdWdoIENsb3VkRnJvbnRcbiAgICAvLyAoQ2xvdWRGcm9udCdzIGRlZmF1bHQgYmVoYXZpb3IgcHJvdmlkZXMgT0FDIHByb3RlY3Rpb24pXG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Rpc3RyaWJ1dGlvbkRvbWFpbk5hbWUnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5kaXN0cmlidXRpb24uZG9tYWluTmFtZSxcbiAgICAgIGV4cG9ydE5hbWU6ICdDbG91ZEZyb250RG9tYWluTmFtZScsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRGlzdHJpYnV0aW9uSWQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5kaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uSWQsXG4gICAgICBleHBvcnROYW1lOiAnQ2xvdWRGcm9udERpc3RyaWJ1dGlvbklkJyxcbiAgICB9KTtcbiAgfVxufVxuIl19