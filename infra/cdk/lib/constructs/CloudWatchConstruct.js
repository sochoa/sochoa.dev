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
exports.CloudWatchConstruct = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const cloudwatch = __importStar(require("aws-cdk-lib/aws-cloudwatch"));
const constructs_1 = require("constructs");
class CloudWatchConstruct extends constructs_1.Construct {
    dashboard;
    constructor(scope, id, props) {
        super(scope, id);
        // Create custom namespace for application metrics
        const namespace = 'sochoa';
        // Dashboard for monitoring
        this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
            dashboardName: `sochoa-${props.environment}`,
        });
        // Lambda metrics
        const lambdaDurationMetric = props.lambdaFunction.metricDuration({
            statistic: 'Average',
            period: cdk.Duration.minutes(5),
        });
        const lambdaErrorsMetric = props.lambdaFunction.metricErrors({
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
        });
        const lambdaInvocationsMetric = props.lambdaFunction.metricInvocations({
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
        });
        const lambdaThrottlesMetric = props.lambdaFunction.metricThrottles({
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
        });
        // API Gateway metrics
        const apiErrorsMetric = new cloudwatch.Metric({
            namespace: 'AWS/ApiGateway',
            metricName: '4XXError',
            dimensionsMap: {
                ApiId: props.apiGateway.httpApiId,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
        });
        const api5xxErrorsMetric = new cloudwatch.Metric({
            namespace: 'AWS/ApiGateway',
            metricName: '5XXError',
            dimensionsMap: {
                ApiId: props.apiGateway.httpApiId,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
        });
        const apiLatencyMetric = new cloudwatch.Metric({
            namespace: 'AWS/ApiGateway',
            metricName: 'Latency',
            dimensionsMap: {
                ApiId: props.apiGateway.httpApiId,
            },
            statistic: 'Average',
            period: cdk.Duration.minutes(5),
        });
        // Add widgets to dashboard
        this.dashboard.addWidgets(
        // Lambda performance
        new cloudwatch.GraphWidget({
            title: 'Lambda Duration (ms)',
            left: [lambdaDurationMetric],
            height: 6,
        }), new cloudwatch.GraphWidget({
            title: 'Lambda Errors',
            left: [lambdaErrorsMetric],
            height: 6,
        }), 
        // API Gateway performance
        new cloudwatch.GraphWidget({
            title: 'API Latency (ms)',
            left: [apiLatencyMetric],
            height: 6,
        }), new cloudwatch.GraphWidget({
            title: 'API Errors (4xx/5xx)',
            left: [apiErrorsMetric, api5xxErrorsMetric],
            height: 6,
        }));
        // Add second row with additional metrics
        this.dashboard.addWidgets(new cloudwatch.SingleValueWidget({
            title: 'Lambda Invocations (5m)',
            metrics: [lambdaInvocationsMetric],
            height: 6,
        }), new cloudwatch.SingleValueWidget({
            title: 'Lambda Throttles',
            metrics: [lambdaThrottlesMetric],
            height: 6,
        }));
        // Create alarms for critical issues
        const lambdaErrorAlarm = new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
            alarmName: `sochoa-${props.environment}-lambda-errors`,
            metric: lambdaErrorsMetric,
            threshold: 5, // Alert if >5 errors in 5 minutes
            evaluationPeriods: 1,
            alarmDescription: 'Alert when Lambda function has errors',
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });
        const lambda5xxErrorAlarm = new cloudwatch.Alarm(this, 'Api5xxErrorAlarm', {
            alarmName: `sochoa-${props.environment}-api-5xx-errors`,
            metric: api5xxErrorsMetric,
            threshold: 10, // Alert if >10 5xx errors in 5 minutes
            evaluationPeriods: 2,
            alarmDescription: 'Alert when API returns 5xx errors',
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });
        const apiLatencyAlarm = new cloudwatch.Alarm(this, 'ApiLatencyAlarm', {
            alarmName: `sochoa-${props.environment}-api-high-latency`,
            metric: apiLatencyMetric,
            threshold: 2000, // Alert if average latency > 2 seconds
            evaluationPeriods: 2,
            alarmDescription: 'Alert when API latency is abnormally high',
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });
        // Outputs
        new cdk.CfnOutput(this, 'DashboardUrl', {
            value: `https://console.aws.amazon.com/cloudwatch/home?region=${cdk.Stack.of(this).region}#dashboards:name=${this.dashboard.dashboardName}`,
            exportName: 'CloudWatchDashboardUrl',
        });
        new cdk.CfnOutput(this, 'LambdaErrorAlarmName', {
            value: lambdaErrorAlarm.alarmName,
            exportName: 'LambdaErrorAlarmName',
        });
    }
}
exports.CloudWatchConstruct = CloudWatchConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xvdWRXYXRjaENvbnN0cnVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNsb3VkV2F0Y2hDb25zdHJ1Y3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBQ25DLHVFQUF5RDtBQUl6RCwyQ0FBdUM7QUFRdkMsTUFBYSxtQkFBb0IsU0FBUSxzQkFBUztJQUNoQyxTQUFTLENBQXVCO0lBRWhELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBK0I7UUFDdkUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixrREFBa0Q7UUFDbEQsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBRTNCLDJCQUEyQjtRQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQzNELGFBQWEsRUFBRSxVQUFVLEtBQUssQ0FBQyxXQUFXLEVBQUU7U0FDN0MsQ0FBQyxDQUFDO1FBRUgsaUJBQWlCO1FBQ2pCLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUM7WUFDL0QsU0FBUyxFQUFFLFNBQVM7WUFDcEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNoQyxDQUFDLENBQUM7UUFFSCxNQUFNLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDO1lBQzNELFNBQVMsRUFBRSxLQUFLO1lBQ2hCLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDaEMsQ0FBQyxDQUFDO1FBRUgsTUFBTSx1QkFBdUIsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDO1lBQ3JFLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLE1BQU0sRUFBRSxH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RTtZQUN0QyxLQUFLLEVBQUUseURBQXlELEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sb0JBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFO1lBQzNJLFVBQVUsRUFBRSx3QkFBd0I7U0FDckMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUM5QyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsU0FBUztZQUNqQyxVQUFVLEVBQUUsc0JBQXNCO1NBQ25DLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQW5LRCxrREFtS0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgY2xvdWR3YXRjaCBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWR3YXRjaCc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5djIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXl2Mic7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENsb3VkV2F0Y2hDb25zdHJ1Y3RQcm9wcyB7XG4gIGxhbWJkYUZ1bmN0aW9uOiBsYW1iZGEuRnVuY3Rpb247XG4gIGFwaUdhdGV3YXk6IGFwaWdhdGV3YXl2Mi5IdHRwQXBpO1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQ2xvdWRXYXRjaENvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSBkYXNoYm9hcmQ6IGNsb3Vkd2F0Y2guRGFzaGJvYXJkO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBDbG91ZFdhdGNoQ29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgLy8gQ3JlYXRlIGN1c3RvbSBuYW1lc3BhY2UgZm9yIGFwcGxpY2F0aW9uIG1ldHJpY3NcbiAgICBjb25zdCBuYW1lc3BhY2UgPSAnc29jaG9hJztcblxuICAgIC8vIERhc2hib2FyZCBmb3IgbW9uaXRvcmluZ1xuICAgIHRoaXMuZGFzaGJvYXJkID0gbmV3IGNsb3Vkd2F0Y2guRGFzaGJvYXJkKHRoaXMsICdEYXNoYm9hcmQnLCB7XG4gICAgICBkYXNoYm9hcmROYW1lOiBgc29jaG9hLSR7cHJvcHMuZW52aXJvbm1lbnR9YCxcbiAgICB9KTtcblxuICAgIC8vIExhbWJkYSBtZXRyaWNzXG4gICAgY29uc3QgbGFtYmRhRHVyYXRpb25NZXRyaWMgPSBwcm9wcy5sYW1iZGFGdW5jdGlvbi5tZXRyaWNEdXJhdGlvbih7XG4gICAgICBzdGF0aXN0aWM6ICdBdmVyYWdlJyxcbiAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgfSk7XG5cbiAgICBjb25zdCBsYW1iZGFFcnJvcnNNZXRyaWMgPSBwcm9wcy5sYW1iZGFGdW5jdGlvbi5tZXRyaWNFcnJvcnMoe1xuICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgfSk7XG5cbiAgICBjb25zdCBsYW1iZGFJbnZvY2F0aW9uc01ldHJpYyA9IHByb3BzLmxhbWJkYUZ1bmN0aW9uLm1ldHJpY0ludm9jYXRpb25zKHtcbiAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbGFtYmRhVGhyb3R0bGVzTWV0cmljID0gcHJvcHMubGFtYmRhRnVuY3Rpb24ubWV0cmljVGhyb3R0bGVzKHtcbiAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgIH0pO1xuXG4gICAgLy8gQVBJIEdhdGV3YXkgbWV0cmljc1xuICAgIGNvbnN0IGFwaUVycm9yc01ldHJpYyA9IG5ldyBjbG91ZHdhdGNoLk1ldHJpYyh7XG4gICAgICBuYW1lc3BhY2U6ICdBV1MvQXBpR2F0ZXdheScsXG4gICAgICBtZXRyaWNOYW1lOiAnNFhYRXJyb3InLFxuICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICBBcGlJZDogcHJvcHMuYXBpR2F0ZXdheS5odHRwQXBpSWQsXG4gICAgICB9LFxuICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgfSk7XG5cbiAgICBjb25zdCBhcGk1eHhFcnJvcnNNZXRyaWMgPSBuZXcgY2xvdWR3YXRjaC5NZXRyaWMoe1xuICAgICAgbmFtZXNwYWNlOiAnQVdTL0FwaUdhdGV3YXknLFxuICAgICAgbWV0cmljTmFtZTogJzVYWEVycm9yJyxcbiAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgQXBpSWQ6IHByb3BzLmFwaUdhdGV3YXkuaHR0cEFwaUlkLFxuICAgICAgfSxcbiAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYXBpTGF0ZW5jeU1ldHJpYyA9IG5ldyBjbG91ZHdhdGNoLk1ldHJpYyh7XG4gICAgICBuYW1lc3BhY2U6ICdBV1MvQXBpR2F0ZXdheScsXG4gICAgICBtZXRyaWNOYW1lOiAnTGF0ZW5jeScsXG4gICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgIEFwaUlkOiBwcm9wcy5hcGlHYXRld2F5Lmh0dHBBcGlJZCxcbiAgICAgIH0sXG4gICAgICBzdGF0aXN0aWM6ICdBdmVyYWdlJyxcbiAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgd2lkZ2V0cyB0byBkYXNoYm9hcmRcbiAgICB0aGlzLmRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgLy8gTGFtYmRhIHBlcmZvcm1hbmNlXG4gICAgICBuZXcgY2xvdWR3YXRjaC5HcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnTGFtYmRhIER1cmF0aW9uIChtcyknLFxuICAgICAgICBsZWZ0OiBbbGFtYmRhRHVyYXRpb25NZXRyaWNdLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KSxcblxuICAgICAgbmV3IGNsb3Vkd2F0Y2guR3JhcGhXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0xhbWJkYSBFcnJvcnMnLFxuICAgICAgICBsZWZ0OiBbbGFtYmRhRXJyb3JzTWV0cmljXSxcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSksXG5cbiAgICAgIC8vIEFQSSBHYXRld2F5IHBlcmZvcm1hbmNlXG4gICAgICBuZXcgY2xvdWR3YXRjaC5HcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnQVBJIExhdGVuY3kgKG1zKScsXG4gICAgICAgIGxlZnQ6IFthcGlMYXRlbmN5TWV0cmljXSxcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSksXG5cbiAgICAgIG5ldyBjbG91ZHdhdGNoLkdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdBUEkgRXJyb3JzICg0eHgvNXh4KScsXG4gICAgICAgIGxlZnQ6IFthcGlFcnJvcnNNZXRyaWMsIGFwaTV4eEVycm9yc01ldHJpY10sXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIEFkZCBzZWNvbmQgcm93IHdpdGggYWRkaXRpb25hbCBtZXRyaWNzXG4gICAgdGhpcy5kYXNoYm9hcmQuYWRkV2lkZ2V0cyhcbiAgICAgIG5ldyBjbG91ZHdhdGNoLlNpbmdsZVZhbHVlV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdMYW1iZGEgSW52b2NhdGlvbnMgKDVtKScsXG4gICAgICAgIG1ldHJpY3M6IFtsYW1iZGFJbnZvY2F0aW9uc01ldHJpY10sXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pLFxuXG4gICAgICBuZXcgY2xvdWR3YXRjaC5TaW5nbGVWYWx1ZVdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnTGFtYmRhIFRocm90dGxlcycsXG4gICAgICAgIG1ldHJpY3M6IFtsYW1iZGFUaHJvdHRsZXNNZXRyaWNdLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBDcmVhdGUgYWxhcm1zIGZvciBjcml0aWNhbCBpc3N1ZXNcbiAgICBjb25zdCBsYW1iZGFFcnJvckFsYXJtID0gbmV3IGNsb3Vkd2F0Y2guQWxhcm0oXG4gICAgICB0aGlzLFxuICAgICAgJ0xhbWJkYUVycm9yQWxhcm0nLFxuICAgICAge1xuICAgICAgICBhbGFybU5hbWU6IGBzb2Nob2EtJHtwcm9wcy5lbnZpcm9ubWVudH0tbGFtYmRhLWVycm9yc2AsXG4gICAgICAgIG1ldHJpYzogbGFtYmRhRXJyb3JzTWV0cmljLFxuICAgICAgICB0aHJlc2hvbGQ6IDUsIC8vIEFsZXJ0IGlmID41IGVycm9ycyBpbiA1IG1pbnV0ZXNcbiAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDEsXG4gICAgICAgIGFsYXJtRGVzY3JpcHRpb246XG4gICAgICAgICAgJ0FsZXJ0IHdoZW4gTGFtYmRhIGZ1bmN0aW9uIGhhcyBlcnJvcnMnLFxuICAgICAgICB0cmVhdE1pc3NpbmdEYXRhOiBjbG91ZHdhdGNoLlRyZWF0TWlzc2luZ0RhdGEuTk9UX0JSRUFDSElORyxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgbGFtYmRhNXh4RXJyb3JBbGFybSA9IG5ldyBjbG91ZHdhdGNoLkFsYXJtKFxuICAgICAgdGhpcyxcbiAgICAgICdBcGk1eHhFcnJvckFsYXJtJyxcbiAgICAgIHtcbiAgICAgICAgYWxhcm1OYW1lOiBgc29jaG9hLSR7cHJvcHMuZW52aXJvbm1lbnR9LWFwaS01eHgtZXJyb3JzYCxcbiAgICAgICAgbWV0cmljOiBhcGk1eHhFcnJvcnNNZXRyaWMsXG4gICAgICAgIHRocmVzaG9sZDogMTAsIC8vIEFsZXJ0IGlmID4xMCA1eHggZXJyb3JzIGluIDUgbWludXRlc1xuICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogMixcbiAgICAgICAgYWxhcm1EZXNjcmlwdGlvbjogJ0FsZXJ0IHdoZW4gQVBJIHJldHVybnMgNXh4IGVycm9ycycsXG4gICAgICAgIHRyZWF0TWlzc2luZ0RhdGE6IGNsb3Vkd2F0Y2guVHJlYXRNaXNzaW5nRGF0YS5OT1RfQlJFQUNISU5HLFxuICAgICAgfVxuICAgICk7XG5cbiAgICBjb25zdCBhcGlMYXRlbmN5QWxhcm0gPSBuZXcgY2xvdWR3YXRjaC5BbGFybShcbiAgICAgIHRoaXMsXG4gICAgICAnQXBpTGF0ZW5jeUFsYXJtJyxcbiAgICAgIHtcbiAgICAgICAgYWxhcm1OYW1lOiBgc29jaG9hLSR7cHJvcHMuZW52aXJvbm1lbnR9LWFwaS1oaWdoLWxhdGVuY3lgLFxuICAgICAgICBtZXRyaWM6IGFwaUxhdGVuY3lNZXRyaWMsXG4gICAgICAgIHRocmVzaG9sZDogMjAwMCwgLy8gQWxlcnQgaWYgYXZlcmFnZSBsYXRlbmN5ID4gMiBzZWNvbmRzXG4gICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAyLFxuICAgICAgICBhbGFybURlc2NyaXB0aW9uOlxuICAgICAgICAgICdBbGVydCB3aGVuIEFQSSBsYXRlbmN5IGlzIGFibm9ybWFsbHkgaGlnaCcsXG4gICAgICAgIHRyZWF0TWlzc2luZ0RhdGE6IGNsb3Vkd2F0Y2guVHJlYXRNaXNzaW5nRGF0YS5OT1RfQlJFQUNISU5HLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Rhc2hib2FyZFVybCcsIHtcbiAgICAgIHZhbHVlOiBgaHR0cHM6Ly9jb25zb2xlLmF3cy5hbWF6b24uY29tL2Nsb3Vkd2F0Y2gvaG9tZT9yZWdpb249JHtjZGsuU3RhY2sub2YodGhpcykucmVnaW9ufSNkYXNoYm9hcmRzOm5hbWU9JHt0aGlzLmRhc2hib2FyZC5kYXNoYm9hcmROYW1lfWAsXG4gICAgICBleHBvcnROYW1lOiAnQ2xvdWRXYXRjaERhc2hib2FyZFVybCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTGFtYmRhRXJyb3JBbGFybU5hbWUnLCB7XG4gICAgICB2YWx1ZTogbGFtYmRhRXJyb3JBbGFybS5hbGFybU5hbWUsXG4gICAgICBleHBvcnROYW1lOiAnTGFtYmRhRXJyb3JBbGFybU5hbWUnLFxuICAgIH0pO1xuICB9XG59XG4iXX0=