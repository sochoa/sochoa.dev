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
exports.S3Construct = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const constructs_1 = require("constructs");
class S3Construct extends constructs_1.Construct {
    uiBucket;
    constructor(scope, id, props) {
        super(scope, id);
        // S3 bucket for UI assets
        this.uiBucket = new s3.Bucket(this, 'UiBucket', {
            bucketName: props.bucketName ||
                `sochoa-dev-ui-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}`,
            versioned: true, // Enable versioning for rollback capability
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Never allow public access directly
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true, // Require HTTPS for all requests
            removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep bucket on stack deletion
        });
        // Enable public read access only through CloudFront OAC
        // (we'll configure this in CloudFrontConstruct)
        // Add lifecycle policy: transition old versions to cheaper storage
        this.uiBucket.addLifecycleRule({
            noncurrentVersionTransitions: [
                {
                    storageClass: s3.StorageClass.INTELLIGENT_TIERING,
                    transitionAfter: cdk.Duration.days(30),
                },
                {
                    storageClass: s3.StorageClass.GLACIER,
                    transitionAfter: cdk.Duration.days(90),
                },
            ],
            noncurrentVersionExpiration: cdk.Duration.days(180), // Delete old versions after 6 months
        });
        // Outputs
        new cdk.CfnOutput(this, 'UiBucketName', {
            value: this.uiBucket.bucketName,
            exportName: 'UiBucketName',
        });
        new cdk.CfnOutput(this, 'UiBucketArn', {
            value: this.uiBucket.bucketArn,
            exportName: 'UiBucketArn',
        });
    }
}
exports.S3Construct = S3Construct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUzNDb25zdHJ1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTM0NvbnN0cnVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsdURBQXlDO0FBQ3pDLDJDQUF1QztBQU92QyxNQUFhLFdBQVksU0FBUSxzQkFBUztJQUN4QixRQUFRLENBQVk7SUFFcEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF1QjtRQUMvRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLDBCQUEwQjtRQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQzlDLFVBQVUsRUFDUixLQUFLLENBQUMsVUFBVTtnQkFDaEIsaUJBQWlCLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDNUUsU0FBUyxFQUFFLElBQUksRUFBRSw0Q0FBNEM7WUFDN0QsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxxQ0FBcUM7WUFDeEYsVUFBVSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVO1lBQzFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsaUNBQWlDO1lBQ25ELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxnQ0FBZ0M7U0FDMUUsQ0FBQyxDQUFDO1FBRUgsd0RBQXdEO1FBQ3hELGdEQUFnRDtRQUVoRCxtRUFBbUU7UUFDbkUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztZQUM3Qiw0QkFBNEIsRUFBRTtnQkFDNUI7b0JBQ0UsWUFBWSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsbUJBQW1CO29CQUNqRCxlQUFlLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2lCQUN2QztnQkFDRDtvQkFDRSxZQUFZLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPO29CQUNyQyxlQUFlLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2lCQUN2QzthQUNGO1lBQ0QsMkJBQTJCLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUscUNBQXFDO1NBQzNGLENBQUMsQ0FBQztRQUVILFVBQVU7UUFDVixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUN0QyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVO1lBQy9CLFVBQVUsRUFBRSxjQUFjO1NBQzNCLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ3JDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVM7WUFDOUIsVUFBVSxFQUFFLGFBQWE7U0FDMUIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBL0NELGtDQStDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUzNDb25zdHJ1Y3RQcm9wcyB7XG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIGJ1Y2tldE5hbWU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBTM0NvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSB1aUJ1Y2tldDogczMuQnVja2V0O1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBTM0NvbnN0cnVjdFByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIC8vIFMzIGJ1Y2tldCBmb3IgVUkgYXNzZXRzXG4gICAgdGhpcy51aUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1VpQnVja2V0Jywge1xuICAgICAgYnVja2V0TmFtZTpcbiAgICAgICAgcHJvcHMuYnVja2V0TmFtZSB8fFxuICAgICAgICBgc29jaG9hLWRldi11aS0ke2Nkay5TdGFjay5vZih0aGlzKS5hY2NvdW50fS0ke2Nkay5TdGFjay5vZih0aGlzKS5yZWdpb259YCxcbiAgICAgIHZlcnNpb25lZDogdHJ1ZSwgLy8gRW5hYmxlIHZlcnNpb25pbmcgZm9yIHJvbGxiYWNrIGNhcGFiaWxpdHlcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsIC8vIE5ldmVyIGFsbG93IHB1YmxpYyBhY2Nlc3MgZGlyZWN0bHlcbiAgICAgIGVuY3J5cHRpb246IHMzLkJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcbiAgICAgIGVuZm9yY2VTU0w6IHRydWUsIC8vIFJlcXVpcmUgSFRUUFMgZm9yIGFsbCByZXF1ZXN0c1xuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLCAvLyBLZWVwIGJ1Y2tldCBvbiBzdGFjayBkZWxldGlvblxuICAgIH0pO1xuXG4gICAgLy8gRW5hYmxlIHB1YmxpYyByZWFkIGFjY2VzcyBvbmx5IHRocm91Z2ggQ2xvdWRGcm9udCBPQUNcbiAgICAvLyAod2UnbGwgY29uZmlndXJlIHRoaXMgaW4gQ2xvdWRGcm9udENvbnN0cnVjdClcblxuICAgIC8vIEFkZCBsaWZlY3ljbGUgcG9saWN5OiB0cmFuc2l0aW9uIG9sZCB2ZXJzaW9ucyB0byBjaGVhcGVyIHN0b3JhZ2VcbiAgICB0aGlzLnVpQnVja2V0LmFkZExpZmVjeWNsZVJ1bGUoe1xuICAgICAgbm9uY3VycmVudFZlcnNpb25UcmFuc2l0aW9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgc3RvcmFnZUNsYXNzOiBzMy5TdG9yYWdlQ2xhc3MuSU5URUxMSUdFTlRfVElFUklORyxcbiAgICAgICAgICB0cmFuc2l0aW9uQWZ0ZXI6IGNkay5EdXJhdGlvbi5kYXlzKDMwKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHN0b3JhZ2VDbGFzczogczMuU3RvcmFnZUNsYXNzLkdMQUNJRVIsXG4gICAgICAgICAgdHJhbnNpdGlvbkFmdGVyOiBjZGsuRHVyYXRpb24uZGF5cyg5MCksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgbm9uY3VycmVudFZlcnNpb25FeHBpcmF0aW9uOiBjZGsuRHVyYXRpb24uZGF5cygxODApLCAvLyBEZWxldGUgb2xkIHZlcnNpb25zIGFmdGVyIDYgbW9udGhzXG4gICAgfSk7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1VpQnVja2V0TmFtZScsIHtcbiAgICAgIHZhbHVlOiB0aGlzLnVpQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICBleHBvcnROYW1lOiAnVWlCdWNrZXROYW1lJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdVaUJ1Y2tldEFybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLnVpQnVja2V0LmJ1Y2tldEFybixcbiAgICAgIGV4cG9ydE5hbWU6ICdVaUJ1Y2tldEFybicsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==