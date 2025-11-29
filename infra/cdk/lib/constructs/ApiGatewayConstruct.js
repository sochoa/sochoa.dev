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
exports.ApiGatewayConstructConstruct = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const apigatewayv2 = __importStar(require("aws-cdk-lib/aws-apigatewayv2"));
const apigatewayv2_integrations = __importStar(require("aws-cdk-lib/aws-apigatewayv2-integrations"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const constructs_1 = require("constructs");
class ApiGatewayConstructConstruct extends constructs_1.Construct {
    api;
    apiUrl;
    constructor(scope, id, props) {
        super(scope, id);
        // CloudWatch log group for API Gateway access logs
        const accessLogGroup = new logs.LogGroup(this, 'ApiAccessLogs', {
            retention: logs.RetentionDays.ONE_MONTH,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // Create HTTP API (modern, lightweight alternative to REST API)
        this.api = new apigatewayv2.HttpApi(this, 'HttpApi', {
            apiName: `sochoa-${props.environment}`,
            description: 'sochoa.dev API Gateway',
            corsPreflight: {
                allowMethods: [
                    apigatewayv2.CorsHttpMethod.GET,
                    apigatewayv2.CorsHttpMethod.POST,
                    apigatewayv2.CorsHttpMethod.PUT,
                    apigatewayv2.CorsHttpMethod.DELETE,
                    apigatewayv2.CorsHttpMethod.PATCH,
                ],
                allowOrigins: [props.uiDomain, 'http://localhost:5173'], // Local dev
                allowHeaders: [
                    'Content-Type',
                    'Authorization',
                    'X-Amz-Date',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                    'X-Amz-User-Agent',
                ],
                allowCredentials: true,
                maxAge: cdk.Duration.hours(24),
            },
        });
        // Add Lambda integration
        const lambdaIntegration = new apigatewayv2_integrations.HttpLambdaIntegration('LambdaIntegration', props.lambdaFunction, {
            payloadFormatVersion: apigatewayv2.PayloadFormatVersion.VERSION_2_0,
        });
        // Route all requests to Lambda
        this.api.addRoutes({
            path: '/{proxy+}',
            methods: [apigatewayv2.HttpMethod.ANY],
            integration: lambdaIntegration,
        });
        // Root path
        this.api.addRoutes({
            path: '/',
            methods: [apigatewayv2.HttpMethod.ANY],
            integration: lambdaIntegration,
        });
        // Note: Access logs for HTTP API need to be configured separately
        // This can be done via the AWS console or additional CDK patterns
        // API Gateway must have permission to invoke Lambda
        props.lambdaFunction.grantInvoke(new cdk.aws_iam.ServicePrincipal('apigateway.amazonaws.com'));
        this.apiUrl = this.api.url || '';
        // Outputs
        new cdk.CfnOutput(this, 'ApiUrl', {
            value: this.apiUrl,
            exportName: 'ApiGatewayUrl',
        });
        new cdk.CfnOutput(this, 'ApiId', {
            value: this.api.httpApiId,
            exportName: 'ApiGatewayId',
        });
    }
}
exports.ApiGatewayConstructConstruct = ApiGatewayConstructConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBpR2F0ZXdheUNvbnN0cnVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFwaUdhdGV3YXlDb25zdHJ1Y3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBQ25DLDJFQUE2RDtBQUM3RCxxR0FBdUY7QUFFdkYsMkRBQTZDO0FBQzdDLDJDQUF1QztBQVF2QyxNQUFhLDRCQUE2QixTQUFRLHNCQUFTO0lBQ3pDLEdBQUcsQ0FBdUI7SUFDMUIsTUFBTSxDQUFTO0lBRS9CLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBK0I7UUFDdkUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixtREFBbUQ7UUFDbkQsTUFBTSxjQUFjLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDOUQsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUztZQUN2QyxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1NBQ3pDLENBQUMsQ0FBQztRQUVILGdFQUFnRTtRQUNoRSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ25ELE9BQU8sRUFBRSxVQUFVLEtBQUssQ0FBQyxXQUFXLEVBQUU7WUFDdEMsV0FBVyxFQUFFLHdCQUF3QjtZQUNyQyxhQUFhLEVBQUU7Z0JBQ2IsWUFBWSxFQUFFO29CQUNaLFlBQVksQ0FBQyxjQUFjLENBQUMsR0FBRztvQkFDL0IsWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJO29CQUNoQyxZQUFZLENBQUMsY0FBYyxDQUFDLEdBQUc7b0JBQy9CLFlBQVksQ0FBQyxjQUFjLENBQUMsTUFBTTtvQkFDbEMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxLQUFLO2lCQUNsQztnQkFDRCxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLHVCQUF1QixDQUFDLEVBQUUsWUFBWTtnQkFDckUsWUFBWSxFQUFFO29CQUNaLGNBQWM7b0JBQ2QsZUFBZTtvQkFDZixZQUFZO29CQUNaLFdBQVc7b0JBQ1gsc0JBQXNCO29CQUN0QixrQkFBa0I7aUJBQ25CO2dCQUNELGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7YUFDL0I7U0FDRixDQUFDLENBQUM7UUFFSCx5QkFBeUI7UUFDekIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHlCQUF5QixDQUFDLHFCQUFxQixDQUMzRSxtQkFBbUIsRUFDbkIsS0FBSyxDQUFDLGNBQWMsRUFDcEI7WUFDRSxvQkFBb0IsRUFBRSxZQUFZLENBQUMsb0JBQW9CLENBQUMsV0FBVztTQUNwRSxDQUNGLENBQUM7UUFFRiwrQkFBK0I7UUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7WUFDakIsSUFBSSxFQUFFLFdBQVc7WUFDakIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7WUFDdEMsV0FBVyxFQUFFLGlCQUFpQjtTQUMvQixDQUFDLENBQUM7UUFFSCxZQUFZO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7WUFDakIsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUN0QyxXQUFXLEVBQUUsaUJBQWlCO1NBQy9CLENBQUMsQ0FBQztRQUVILGtFQUFrRTtRQUNsRSxrRUFBa0U7UUFFbEUsb0RBQW9EO1FBQ3BELEtBQUssQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUM5QixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsMEJBQTBCLENBQUMsQ0FDN0QsQ0FBQztRQUVGLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDO1FBRWpDLFVBQVU7UUFDVixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUNoQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbEIsVUFBVSxFQUFFLGVBQWU7U0FDNUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7WUFDL0IsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUztZQUN6QixVQUFVLEVBQUUsY0FBYztTQUMzQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFuRkQsb0VBbUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXl2MiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheXYyJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXl2Ml9pbnRlZ3JhdGlvbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXl2Mi1pbnRlZ3JhdGlvbnMnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGludGVyZmFjZSBBcGlHYXRld2F5Q29uc3RydWN0UHJvcHMge1xuICBsYW1iZGFGdW5jdGlvbjogbGFtYmRhLkZ1bmN0aW9uO1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICB1aURvbWFpbjogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQXBpR2F0ZXdheUNvbnN0cnVjdENvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSBhcGk6IGFwaWdhdGV3YXl2Mi5IdHRwQXBpO1xuICBwdWJsaWMgcmVhZG9ubHkgYXBpVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEFwaUdhdGV3YXlDb25zdHJ1Y3RQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICAvLyBDbG91ZFdhdGNoIGxvZyBncm91cCBmb3IgQVBJIEdhdGV3YXkgYWNjZXNzIGxvZ3NcbiAgICBjb25zdCBhY2Nlc3NMb2dHcm91cCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsICdBcGlBY2Nlc3NMb2dzJywge1xuICAgICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX01PTlRILFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBIVFRQIEFQSSAobW9kZXJuLCBsaWdodHdlaWdodCBhbHRlcm5hdGl2ZSB0byBSRVNUIEFQSSlcbiAgICB0aGlzLmFwaSA9IG5ldyBhcGlnYXRld2F5djIuSHR0cEFwaSh0aGlzLCAnSHR0cEFwaScsIHtcbiAgICAgIGFwaU5hbWU6IGBzb2Nob2EtJHtwcm9wcy5lbnZpcm9ubWVudH1gLFxuICAgICAgZGVzY3JpcHRpb246ICdzb2Nob2EuZGV2IEFQSSBHYXRld2F5JyxcbiAgICAgIGNvcnNQcmVmbGlnaHQ6IHtcbiAgICAgICAgYWxsb3dNZXRob2RzOiBbXG4gICAgICAgICAgYXBpZ2F0ZXdheXYyLkNvcnNIdHRwTWV0aG9kLkdFVCxcbiAgICAgICAgICBhcGlnYXRld2F5djIuQ29yc0h0dHBNZXRob2QuUE9TVCxcbiAgICAgICAgICBhcGlnYXRld2F5djIuQ29yc0h0dHBNZXRob2QuUFVULFxuICAgICAgICAgIGFwaWdhdGV3YXl2Mi5Db3JzSHR0cE1ldGhvZC5ERUxFVEUsXG4gICAgICAgICAgYXBpZ2F0ZXdheXYyLkNvcnNIdHRwTWV0aG9kLlBBVENILFxuICAgICAgICBdLFxuICAgICAgICBhbGxvd09yaWdpbnM6IFtwcm9wcy51aURvbWFpbiwgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3MyddLCAvLyBMb2NhbCBkZXZcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nLFxuICAgICAgICAgICdYLUFtei1EYXRlJyxcbiAgICAgICAgICAnWC1BcGktS2V5JyxcbiAgICAgICAgICAnWC1BbXotU2VjdXJpdHktVG9rZW4nLFxuICAgICAgICAgICdYLUFtei1Vc2VyLUFnZW50JyxcbiAgICAgICAgXSxcbiAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgICAgbWF4QWdlOiBjZGsuRHVyYXRpb24uaG91cnMoMjQpLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBMYW1iZGEgaW50ZWdyYXRpb25cbiAgICBjb25zdCBsYW1iZGFJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5djJfaW50ZWdyYXRpb25zLkh0dHBMYW1iZGFJbnRlZ3JhdGlvbihcbiAgICAgICdMYW1iZGFJbnRlZ3JhdGlvbicsXG4gICAgICBwcm9wcy5sYW1iZGFGdW5jdGlvbixcbiAgICAgIHtcbiAgICAgICAgcGF5bG9hZEZvcm1hdFZlcnNpb246IGFwaWdhdGV3YXl2Mi5QYXlsb2FkRm9ybWF0VmVyc2lvbi5WRVJTSU9OXzJfMCxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gUm91dGUgYWxsIHJlcXVlc3RzIHRvIExhbWJkYVxuICAgIHRoaXMuYXBpLmFkZFJvdXRlcyh7XG4gICAgICBwYXRoOiAnL3twcm94eSt9JyxcbiAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5djIuSHR0cE1ldGhvZC5BTlldLFxuICAgICAgaW50ZWdyYXRpb246IGxhbWJkYUludGVncmF0aW9uLFxuICAgIH0pO1xuXG4gICAgLy8gUm9vdCBwYXRoXG4gICAgdGhpcy5hcGkuYWRkUm91dGVzKHtcbiAgICAgIHBhdGg6ICcvJyxcbiAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5djIuSHR0cE1ldGhvZC5BTlldLFxuICAgICAgaW50ZWdyYXRpb246IGxhbWJkYUludGVncmF0aW9uLFxuICAgIH0pO1xuXG4gICAgLy8gTm90ZTogQWNjZXNzIGxvZ3MgZm9yIEhUVFAgQVBJIG5lZWQgdG8gYmUgY29uZmlndXJlZCBzZXBhcmF0ZWx5XG4gICAgLy8gVGhpcyBjYW4gYmUgZG9uZSB2aWEgdGhlIEFXUyBjb25zb2xlIG9yIGFkZGl0aW9uYWwgQ0RLIHBhdHRlcm5zXG5cbiAgICAvLyBBUEkgR2F0ZXdheSBtdXN0IGhhdmUgcGVybWlzc2lvbiB0byBpbnZva2UgTGFtYmRhXG4gICAgcHJvcHMubGFtYmRhRnVuY3Rpb24uZ3JhbnRJbnZva2UoXG4gICAgICBuZXcgY2RrLmF3c19pYW0uU2VydmljZVByaW5jaXBhbCgnYXBpZ2F0ZXdheS5hbWF6b25hd3MuY29tJylcbiAgICApO1xuXG4gICAgdGhpcy5hcGlVcmwgPSB0aGlzLmFwaS51cmwgfHwgJyc7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaVVybCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFwaVVybCxcbiAgICAgIGV4cG9ydE5hbWU6ICdBcGlHYXRld2F5VXJsJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBcGlJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFwaS5odHRwQXBpSWQsXG4gICAgICBleHBvcnROYW1lOiAnQXBpR2F0ZXdheUlkJyxcbiAgICB9KTtcbiAgfVxufVxuIl19