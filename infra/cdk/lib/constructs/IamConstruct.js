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
exports.IamConstruct = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const constructs_1 = require("constructs");
class IamConstruct extends constructs_1.Construct {
    lambdaRole;
    apiGatewayRole;
    constructor(scope, id, props) {
        super(scope, id);
        // Lambda execution role with minimal permissions
        this.lambdaRole = new iam.Role(this, 'LambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Role for sochoa API Lambda functions',
            maxSessionDuration: cdk.Duration.hours(1),
        });
        // Allow Lambda to write logs to CloudWatch
        this.lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));
        // Allow Lambda to access VPC (for RDS connection)
        this.lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'));
        // Allow Lambda to read database password from Secrets Manager
        this.lambdaRole.addToPrincipalPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'secretsmanager:GetSecretValue',
                'secretsmanager:DescribeSecret',
            ],
            resources: [props.dbSecretArn],
            conditions: {
                StringEquals: {
                    'secretsmanager:VersionStage': 'AWSCURRENT',
                },
            },
        }));
        // Allow Lambda to read API keys from Secrets Manager
        this.lambdaRole.addToPrincipalPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['secretsmanager:GetSecretValue'],
            resources: [props.apiKeysSecretArn],
        }));
        // Allow Lambda to read Cognito secrets for verification
        this.lambdaRole.addToPrincipalPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['secretsmanager:GetSecretValue'],
            resources: [props.cognitoSecretArn],
        }));
        // Allow Lambda to push metrics to CloudWatch
        this.lambdaRole.addToPrincipalPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['cloudwatch:PutMetricData'],
            resources: ['*'],
            conditions: {
                StringEquals: {
                    'cloudwatch:namespace': 'sochoa',
                },
            },
        }));
        // CloudWatch Logs permissions
        this.lambdaRole.addToPrincipalPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
            ],
            resources: [
                `arn:aws:logs:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:log-group:/aws/lambda/sochoa-*`,
            ],
        }));
        // API Gateway role
        this.apiGatewayRole = new iam.Role(this, 'ApiGatewayRole', {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            description: 'Role for API Gateway',
        });
        // Allow API Gateway to invoke Lambda
        this.apiGatewayRole.addToPrincipalPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['lambda:InvokeFunction'],
            resources: [
                `arn:aws:lambda:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:function:sochoa-api`,
            ],
        }));
        // Allow API Gateway to write logs
        this.apiGatewayRole.addToPrincipalPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
            ],
            resources: [
                `arn:aws:logs:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:log-group:/aws/apigateway/*`,
            ],
        }));
        // Outputs
        new cdk.CfnOutput(this, 'LambdaRoleArn', {
            value: this.lambdaRole.roleArn,
            exportName: 'LambdaRoleArn',
        });
        new cdk.CfnOutput(this, 'ApiGatewayRoleArn', {
            value: this.apiGatewayRole.roleArn,
            exportName: 'ApiGatewayRoleArn',
        });
    }
}
exports.IamConstruct = IamConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWFtQ29uc3RydWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSWFtQ29uc3RydWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyx5REFBMkM7QUFHM0MsMkNBQXVDO0FBVXZDLE1BQWEsWUFBYSxTQUFRLHNCQUFTO0lBQ3pCLFVBQVUsQ0FBVztJQUNyQixjQUFjLENBQVc7SUFFekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF3QjtRQUNoRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLGlEQUFpRDtRQUNqRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ2pELFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztZQUMzRCxXQUFXLEVBQUUsc0NBQXNDO1lBQ25ELGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUMxQyxDQUFDLENBQUM7UUFFSCwyQ0FBMkM7UUFDM0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FDOUIsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FDeEMsMENBQTBDLENBQzNDLENBQ0YsQ0FBQztRQUVGLGtEQUFrRDtRQUNsRCxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUM5QixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUN4Qyw4Q0FBOEMsQ0FDL0MsQ0FDRixDQUFDO1FBRUYsOERBQThEO1FBQzlELElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQ2xDLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLE9BQU8sRUFB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QyxNQUFNLENBQUMsS0FBSztZQUN4QixPQUFPLEVBQUU7Z0JBQ1AscUJBQXFCO2dCQUNyQixzQkFBc0I7Z0JBQ3RCLG1CQUFtQjthQUNwQjtZQUNELFNBQVMsRUFBRTtnQkFDVCxnQkFBZ0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sOEJBQThCO2FBQ3RHO1NBQ0YsQ0FBQyxDQUNILENBQUM7UUFFRixVQUFVO1FBQ1YsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTztZQUM5QixVQUFVLEVBQUUsZUFBZTtTQUM1QixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQzNDLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU87WUFDbEMsVUFBVSxFQUFFLG1CQUFtQjtTQUNoQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF2SUQsb0NBdUlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIHJkcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtcmRzJztcbmltcG9ydCAqIGFzIHNlY3JldHNtYW5hZ2VyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zZWNyZXRzbWFuYWdlcic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGludGVyZmFjZSBJYW1Db25zdHJ1Y3RQcm9wcyB7XG4gIGRiU2VjdXJpdHlHcm91cElkOiBzdHJpbmc7XG4gIGRiU2VjcmV0QXJuOiBzdHJpbmc7XG4gIGNvZ25pdG9TZWNyZXRBcm46IHN0cmluZztcbiAgYXBpS2V5c1NlY3JldEFybjogc3RyaW5nO1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgSWFtQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHVibGljIHJlYWRvbmx5IGxhbWJkYVJvbGU6IGlhbS5Sb2xlO1xuICBwdWJsaWMgcmVhZG9ubHkgYXBpR2F0ZXdheVJvbGU6IGlhbS5Sb2xlO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBJYW1Db25zdHJ1Y3RQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICAvLyBMYW1iZGEgZXhlY3V0aW9uIHJvbGUgd2l0aCBtaW5pbWFsIHBlcm1pc3Npb25zXG4gICAgdGhpcy5sYW1iZGFSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdMYW1iZGFSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICBkZXNjcmlwdGlvbjogJ1JvbGUgZm9yIHNvY2hvYSBBUEkgTGFtYmRhIGZ1bmN0aW9ucycsXG4gICAgICBtYXhTZXNzaW9uRHVyYXRpb246IGNkay5EdXJhdGlvbi5ob3VycygxKSxcbiAgICB9KTtcblxuICAgIC8vIEFsbG93IExhbWJkYSB0byB3cml0ZSBsb2dzIHRvIENsb3VkV2F0Y2hcbiAgICB0aGlzLmxhbWJkYVJvbGUuYWRkTWFuYWdlZFBvbGljeShcbiAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcbiAgICAgICAgJ3NlcnZpY2Utcm9sZS9BV1NMYW1iZGFCYXNpY0V4ZWN1dGlvblJvbGUnXG4gICAgICApXG4gICAgKTtcblxuICAgIC8vIEFsbG93IExhbWJkYSB0byBhY2Nlc3MgVlBDIChmb3IgUkRTIGNvbm5lY3Rpb24pXG4gICAgdGhpcy5sYW1iZGFSb2xlLmFkZE1hbmFnZWRQb2xpY3koXG4gICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXG4gICAgICAgICdzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhVlBDQWNjZXNzRXhlY3V0aW9uUm9sZSdcbiAgICAgIClcbiAgICApO1xuXG4gICAgLy8gQWxsb3cgTGFtYmRhIHRvIHJlYWQgZGF0YWJhc2UgcGFzc3dvcmQgZnJvbSBTZWNyZXRzIE1hbmFnZXJcbiAgICB0aGlzLmxhbWJkYVJvbGUuYWRkVG9QcmluY2lwYWxQb2xpY3koXG4gICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICdzZWNyZXRzbWFuYWdlcjpHZXRTZWNyZXRWYWx1ZScsXG4gICAgICAgICAgJ3NlY3JldHNtYW5hZ2VyOkRlc2NyaWJlU2VjcmV0JyxcbiAgICAgICAgXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbcHJvcHMuZGJTZWNyZXRBcm5dLFxuICAgICAgICBjb25kaXRpb25zOiB7XG4gICAgICAgICAgU3RyaW5nRXF1YWxzOiB7XG4gICAgICAgICAgICAnc2VjcmV0c21hbmFnZXI6VmVyc2lvblN0YWdlJzogJ0FXU0NVUlJFTlQnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBBbGxvdyBMYW1iZGEgdG8gcmVhZCBBUEkga2V5cyBmcm9tIFNlY3JldHMgTWFuYWdlclxuICAgIHRoaXMubGFtYmRhUm9sZS5hZGRUb1ByaW5jaXBhbFBvbGljeShcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICBhY3Rpb25zOiBbJ3NlY3JldHNtYW5hZ2VyOkdldFNlY3JldFZhbHVlJ10sXG4gICAgICAgIHJlc291cmNlczogW3Byb3BzLmFwaUtleXNTZWNyZXRBcm5dLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gQWxsb3cgTGFtYmRhIHRvIHJlYWQgQ29nbml0byBzZWNyZXRzIGZvciB2ZXJpZmljYXRpb25cbiAgICB0aGlzLmxhbWJkYVJvbGUuYWRkVG9QcmluY2lwYWxQb2xpY3koXG4gICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgYWN0aW9uczogWydzZWNyZXRzbWFuYWdlcjpHZXRTZWNyZXRWYWx1ZSddLFxuICAgICAgICByZXNvdXJjZXM6IFtwcm9wcy5jb2duaXRvU2VjcmV0QXJuXSxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIEFsbG93IExhbWJkYSB0byBwdXNoIG1ldHJpY3MgdG8gQ2xvdWRXYXRjaFxuICAgIHRoaXMubGFtYmRhUm9sZS5hZGRUb1ByaW5jaXBhbFBvbGljeShcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICBhY3Rpb25zOiBbJ2Nsb3Vkd2F0Y2g6UHV0TWV0cmljRGF0YSddLFxuICAgICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgICAgICBjb25kaXRpb25zOiB7XG4gICAgICAgICAgU3RyaW5nRXF1YWxzOiB7XG4gICAgICAgICAgICAnY2xvdWR3YXRjaDpuYW1lc3BhY2UnOiAnc29jaG9hJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gQ2xvdWRXYXRjaCBMb2dzIHBlcm1pc3Npb25zXG4gICAgdGhpcy5sYW1iZGFSb2xlLmFkZFRvUHJpbmNpcGFsUG9saWN5KFxuICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAnbG9nczpDcmVhdGVMb2dHcm91cCcsXG4gICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnLFxuICAgICAgICBdLFxuICAgICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgICBgYXJuOmF3czpsb2dzOiR7Y2RrLlN0YWNrLm9mKHRoaXMpLnJlZ2lvbn06JHtjZGsuU3RhY2sub2YodGhpcykuYWNjb3VudH06bG9nLWdyb3VwOi9hd3MvbGFtYmRhL3NvY2hvYS0qYCxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIEFQSSBHYXRld2F5IHJvbGVcbiAgICB0aGlzLmFwaUdhdGV3YXlSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdBcGlHYXRld2F5Um9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdhcGlnYXRld2F5LmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUm9sZSBmb3IgQVBJIEdhdGV3YXknLFxuICAgIH0pO1xuXG4gICAgLy8gQWxsb3cgQVBJIEdhdGV3YXkgdG8gaW52b2tlIExhbWJkYVxuICAgIHRoaXMuYXBpR2F0ZXdheVJvbGUuYWRkVG9QcmluY2lwYWxQb2xpY3koXG4gICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgYWN0aW9uczogWydsYW1iZGE6SW52b2tlRnVuY3Rpb24nXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgICAgYGFybjphd3M6bGFtYmRhOiR7Y2RrLlN0YWNrLm9mKHRoaXMpLnJlZ2lvbn06JHtjZGsuU3RhY2sub2YodGhpcykuYWNjb3VudH06ZnVuY3Rpb246c29jaG9hLWFwaWAsXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBBbGxvdyBBUEkgR2F0ZXdheSB0byB3cml0ZSBsb2dzXG4gICAgdGhpcy5hcGlHYXRld2F5Um9sZS5hZGRUb1ByaW5jaXBhbFBvbGljeShcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAgICdsb2dzOkNyZWF0ZUxvZ1N0cmVhbScsXG4gICAgICAgICAgJ2xvZ3M6UHV0TG9nRXZlbnRzJyxcbiAgICAgICAgXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgICAgYGFybjphd3M6bG9nczoke2Nkay5TdGFjay5vZih0aGlzKS5yZWdpb259OiR7Y2RrLlN0YWNrLm9mKHRoaXMpLmFjY291bnR9OmxvZy1ncm91cDovYXdzL2FwaWdhdGV3YXkvKmAsXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xhbWJkYVJvbGVBcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5sYW1iZGFSb2xlLnJvbGVBcm4sXG4gICAgICBleHBvcnROYW1lOiAnTGFtYmRhUm9sZUFybicsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpR2F0ZXdheVJvbGVBcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5hcGlHYXRld2F5Um9sZS5yb2xlQXJuLFxuICAgICAgZXhwb3J0TmFtZTogJ0FwaUdhdGV3YXlSb2xlQXJuJyxcbiAgICB9KTtcbiAgfVxufVxuIl19