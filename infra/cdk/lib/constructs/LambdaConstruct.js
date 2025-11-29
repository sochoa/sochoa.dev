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
exports.LambdaConstruct = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const constructs_1 = require("constructs");
class LambdaConstruct extends constructs_1.Construct {
    function;
    constructor(scope, id, props) {
        super(scope, id);
        // CloudWatch log group for Lambda
        const logGroup = new logs.LogGroup(this, 'LambdaLogs', {
            logGroupName: '/aws/lambda/sochoa-api',
            retention: logs.RetentionDays.TWO_WEEKS,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // Lambda function using Docker image
        // This allows us to use the Go binary with custom runtime
        this.function = new lambda.DockerImageFunction(this, 'ApiFunction', {
            code: lambda.DockerImageCode.fromImageAsset('../../../api', // Path to Go API directory
            {
                file: 'Dockerfile.lambda',
                buildArgs: {
                    GOOS: 'linux',
                    GOARCH: 'arm64', // Use ARM64 for better Lambda performance
                },
            }),
            functionName: 'sochoa-api',
            description: 'sochoa.dev API Lambda function',
            role: props.lambdaRole,
            timeout: cdk.Duration.seconds(30),
            memorySize: 512, // Adjust based on workload
            architecture: lambda.Architecture.ARM_64,
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            environment: {
                DEV_MODE: props.environment === 'dev' ? 'false' : 'false',
                LOG_LEVEL: 'info',
                DB_HOST: props.dbEndpoint,
                DB_PORT: props.dbPort,
                DB_NAME: props.dbName,
                DB_USER: 'postgres',
                DB_SECRET_ARN: props.dbSecretArn,
                API_KEYS_SECRET_ARN: props.apiKeysSecretArn,
                ENVIRONMENT: props.environment,
            },
            logGroup: logGroup,
            tracing: lambda.Tracing.ACTIVE, // Enable X-Ray tracing
        });
        // Outputs
        new cdk.CfnOutput(this, 'LambdaFunctionName', {
            value: this.function.functionName,
            exportName: 'LambdaFunctionName',
        });
        new cdk.CfnOutput(this, 'LambdaFunctionArn', {
            value: this.function.functionArn,
            exportName: 'LambdaFunctionArn',
        });
    }
}
exports.LambdaConstruct = LambdaConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGFtYmRhQ29uc3RydWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTGFtYmRhQ29uc3RydWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQywrREFBaUQ7QUFDakQseURBQTJDO0FBQzNDLDJEQUE2QztBQUU3QywyQ0FBdUM7QUFhdkMsTUFBYSxlQUFnQixTQUFRLHNCQUFTO0lBQzVCLFFBQVEsQ0FBa0I7SUFFMUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUEyQjtRQUNuRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLGtDQUFrQztRQUNsQyxNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNyRCxZQUFZLEVBQUUsd0JBQXdCO1lBQ3RDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVM7WUFDdkMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTztTQUN6QyxDQUFDLENBQUM7UUFFSCxxQ0FBcUM7UUFDckMsMERBQTBEO1FBQzFELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsbUJBQW1CLENBQzVDLElBQUksRUFDSixhQUFhLEVBQ2I7WUFDRSxJQUFJLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQ3pDLGNBQWMsRUFBRSwyQkFBMkI7WUFDM0M7Z0JBQ0UsSUFBSSxFQUFFLG1CQUFtQjtnQkFDekIsU0FBUyxFQUFFO29CQUNULElBQUksRUFBRSxPQUFPO29CQUNiLE1BQU0sRUFBRSxPQUFPLEVBQUUsMENBQTBDO2lCQUM1RDthQUNGLENBQ0Y7WUFDRCxZQUFZLEVBQUUsWUFBWTtZQUMxQixXQUFXLEVBQUUsZ0NBQWdDO1lBQzdDLElBQUksRUFBRSxLQUFLLENBQUMsVUFBVTtZQUN0QixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2pDLFVBQVUsRUFBRSxHQUFHLEVBQUUsMkJBQTJCO1lBQzVDLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU07WUFDeEMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ2QsVUFBVSxFQUFFO2dCQUNWLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLG1CQUFtQjthQUMvQztZQUNELFdBQVcsRUFBRTtnQkFDWCxRQUFRLEVBQUUsS0FBSyxDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTztnQkFDekQsU0FBUyxFQUFFLE1BQU07Z0JBQ2pCLE9BQU8sRUFBRSxLQUFLLENBQUMsVUFBVTtnQkFDekIsT0FBTyxFQUFFLEtBQUssQ0FBQyxNQUFNO2dCQUNyQixPQUFPLEVBQUUsS0FBSyxDQUFDLE1BQU07Z0JBQ3JCLE9BQU8sRUFBRSxVQUFVO2dCQUNuQixhQUFhLEVBQUUsS0FBSyxDQUFDLFdBQVc7Z0JBQ2hDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0I7Z0JBQzNDLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVzthQUMvQjtZQUNELFFBQVEsRUFBRSxRQUFRO1lBQ2xCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSx1QkFBdUI7U0FDeEQsQ0FDRixDQUFDO1FBRUYsVUFBVTtRQUNWLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDNUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWTtZQUNqQyxVQUFVLEVBQUUsb0JBQW9CO1NBQ2pDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDM0MsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVztZQUNoQyxVQUFVLEVBQUUsbUJBQW1CO1NBQ2hDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQWxFRCwwQ0FrRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGludGVyZmFjZSBMYW1iZGFDb25zdHJ1Y3RQcm9wcyB7XG4gIHZwYzogZWMyLlZwYztcbiAgbGFtYmRhUm9sZTogaWFtLlJvbGU7XG4gIGRiRW5kcG9pbnQ6IHN0cmluZztcbiAgZGJQb3J0OiBzdHJpbmc7XG4gIGRiTmFtZTogc3RyaW5nO1xuICBkYlNlY3JldEFybjogc3RyaW5nO1xuICBhcGlLZXlzU2VjcmV0QXJuOiBzdHJpbmc7XG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBMYW1iZGFDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgZnVuY3Rpb246IGxhbWJkYS5GdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogTGFtYmRhQ29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgLy8gQ2xvdWRXYXRjaCBsb2cgZ3JvdXAgZm9yIExhbWJkYVxuICAgIGNvbnN0IGxvZ0dyb3VwID0gbmV3IGxvZ3MuTG9nR3JvdXAodGhpcywgJ0xhbWJkYUxvZ3MnLCB7XG4gICAgICBsb2dHcm91cE5hbWU6ICcvYXdzL2xhbWJkYS9zb2Nob2EtYXBpJyxcbiAgICAgIHJldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLlRXT19XRUVLUyxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG5cbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gdXNpbmcgRG9ja2VyIGltYWdlXG4gICAgLy8gVGhpcyBhbGxvd3MgdXMgdG8gdXNlIHRoZSBHbyBiaW5hcnkgd2l0aCBjdXN0b20gcnVudGltZVxuICAgIHRoaXMuZnVuY3Rpb24gPSBuZXcgbGFtYmRhLkRvY2tlckltYWdlRnVuY3Rpb24oXG4gICAgICB0aGlzLFxuICAgICAgJ0FwaUZ1bmN0aW9uJyxcbiAgICAgIHtcbiAgICAgICAgY29kZTogbGFtYmRhLkRvY2tlckltYWdlQ29kZS5mcm9tSW1hZ2VBc3NldChcbiAgICAgICAgICAnLi4vLi4vLi4vYXBpJywgLy8gUGF0aCB0byBHbyBBUEkgZGlyZWN0b3J5XG4gICAgICAgICAge1xuICAgICAgICAgICAgZmlsZTogJ0RvY2tlcmZpbGUubGFtYmRhJyxcbiAgICAgICAgICAgIGJ1aWxkQXJnczoge1xuICAgICAgICAgICAgICBHT09TOiAnbGludXgnLFxuICAgICAgICAgICAgICBHT0FSQ0g6ICdhcm02NCcsIC8vIFVzZSBBUk02NCBmb3IgYmV0dGVyIExhbWJkYSBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgICksXG4gICAgICAgIGZ1bmN0aW9uTmFtZTogJ3NvY2hvYS1hcGknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ3NvY2hvYS5kZXYgQVBJIExhbWJkYSBmdW5jdGlvbicsXG4gICAgICAgIHJvbGU6IHByb3BzLmxhbWJkYVJvbGUsXG4gICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgICAgbWVtb3J5U2l6ZTogNTEyLCAvLyBBZGp1c3QgYmFzZWQgb24gd29ya2xvYWRcbiAgICAgICAgYXJjaGl0ZWN0dXJlOiBsYW1iZGEuQXJjaGl0ZWN0dXJlLkFSTV82NCxcbiAgICAgICAgdnBjOiBwcm9wcy52cGMsXG4gICAgICAgIHZwY1N1Ym5ldHM6IHtcbiAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfRUdSRVNTLFxuICAgICAgICB9LFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIERFVl9NT0RFOiBwcm9wcy5lbnZpcm9ubWVudCA9PT0gJ2RldicgPyAnZmFsc2UnIDogJ2ZhbHNlJyxcbiAgICAgICAgICBMT0dfTEVWRUw6ICdpbmZvJyxcbiAgICAgICAgICBEQl9IT1NUOiBwcm9wcy5kYkVuZHBvaW50LFxuICAgICAgICAgIERCX1BPUlQ6IHByb3BzLmRiUG9ydCxcbiAgICAgICAgICBEQl9OQU1FOiBwcm9wcy5kYk5hbWUsXG4gICAgICAgICAgREJfVVNFUjogJ3Bvc3RncmVzJyxcbiAgICAgICAgICBEQl9TRUNSRVRfQVJOOiBwcm9wcy5kYlNlY3JldEFybixcbiAgICAgICAgICBBUElfS0VZU19TRUNSRVRfQVJOOiBwcm9wcy5hcGlLZXlzU2VjcmV0QXJuLFxuICAgICAgICAgIEVOVklST05NRU5UOiBwcm9wcy5lbnZpcm9ubWVudCxcbiAgICAgICAgfSxcbiAgICAgICAgbG9nR3JvdXA6IGxvZ0dyb3VwLFxuICAgICAgICB0cmFjaW5nOiBsYW1iZGEuVHJhY2luZy5BQ1RJVkUsIC8vIEVuYWJsZSBYLVJheSB0cmFjaW5nXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTGFtYmRhRnVuY3Rpb25OYW1lJywge1xuICAgICAgdmFsdWU6IHRoaXMuZnVuY3Rpb24uZnVuY3Rpb25OYW1lLFxuICAgICAgZXhwb3J0TmFtZTogJ0xhbWJkYUZ1bmN0aW9uTmFtZScsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTGFtYmRhRnVuY3Rpb25Bcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5mdW5jdGlvbi5mdW5jdGlvbkFybixcbiAgICAgIGV4cG9ydE5hbWU6ICdMYW1iZGFGdW5jdGlvbkFybicsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==