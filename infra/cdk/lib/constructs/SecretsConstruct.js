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
exports.SecretsConstruct = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const secretsmanager = __importStar(require("aws-cdk-lib/aws-secretsmanager"));
const constructs_1 = require("constructs");
class SecretsConstruct extends constructs_1.Construct {
    dbPasswordSecret;
    cognitoSecrets;
    apiKeysSecret;
    constructor(scope, id, props) {
        super(scope, id);
        // RDS database password
        this.dbPasswordSecret = new secretsmanager.Secret(this, 'DbPassword', {
            description: 'RDS PostgreSQL master password',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    username: 'postgres',
                }),
                generateStringKey: 'password',
                passwordLength: 32,
                excludeCharacters: '"@/\\',
            },
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // Cognito OAuth credentials (Google, LinkedIn)
        this.cognitoSecrets = new secretsmanager.Secret(this, 'CognitoSecrets', {
            description: 'Cognito OAuth provider credentials',
            secretObjectValue: {
                googleClientId: cdk.SecretValue.unsafePlainText(''),
                googleClientSecret: cdk.SecretValue.unsafePlainText(''),
                linkedinClientId: cdk.SecretValue.unsafePlainText(''),
                linkedinClientSecret: cdk.SecretValue.unsafePlainText(''),
            },
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // API signing keys and misc credentials
        this.apiKeysSecret = new secretsmanager.Secret(this, 'ApiKeys', {
            description: 'API signing keys and credentials',
            secretObjectValue: {
                metricsSigningKey: cdk.SecretValue.unsafePlainText(''),
                corsOrigins: cdk.SecretValue.unsafePlainText('https://sochoa.dev'),
            },
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // Outputs for reference
        new cdk.CfnOutput(this, 'DbPasswordSecretArn', {
            value: this.dbPasswordSecret.secretArn,
            exportName: 'DbPasswordSecretArn',
        });
        new cdk.CfnOutput(this, 'CognitoSecretsArn', {
            value: this.cognitoSecrets.secretArn,
            exportName: 'CognitoSecretsArn',
        });
        new cdk.CfnOutput(this, 'ApiKeysSecretArn', {
            value: this.apiKeysSecret.secretArn,
            exportName: 'ApiKeysSecretArn',
        });
    }
}
exports.SecretsConstruct = SecretsConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VjcmV0c0NvbnN0cnVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNlY3JldHNDb25zdHJ1Y3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBQ25DLCtFQUFpRTtBQUNqRSwyQ0FBdUM7QUFNdkMsTUFBYSxnQkFBaUIsU0FBUSxzQkFBUztJQUM3QixnQkFBZ0IsQ0FBd0I7SUFDeEMsY0FBYyxDQUF3QjtJQUN0QyxhQUFhLENBQXdCO0lBRXJELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBNEI7UUFDcEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQix3QkFBd0I7UUFDeEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BFLFdBQVcsRUFBRSxnQ0FBZ0M7WUFDN0Msb0JBQW9CLEVBQUU7Z0JBQ3BCLG9CQUFvQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ25DLFFBQVEsRUFBRSxVQUFVO2lCQUNyQixDQUFDO2dCQUNGLGlCQUFpQixFQUFFLFVBQVU7Z0JBQzdCLGNBQWMsRUFBRSxFQUFFO2dCQUNsQixpQkFBaUIsRUFBRSxPQUFPO2FBQzNCO1lBQ0QsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTTtTQUN4QyxDQUFDLENBQUM7UUFFSCwrQ0FBK0M7UUFDL0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQzdDLElBQUksRUFDSixnQkFBZ0IsRUFDaEI7WUFDRSxXQUFXLEVBQUUsb0NBQW9DO1lBQ2pELGlCQUFpQixFQUFFO2dCQUNqQixjQUFjLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO2dCQUNuRCxrQkFBa0IsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZELGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztnQkFDckQsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO2FBQzFEO1lBQ0QsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTTtTQUN4QyxDQUNGLENBQUM7UUFFRix3Q0FBd0M7UUFDeEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUM5RCxXQUFXLEVBQUUsa0NBQWtDO1lBQy9DLGlCQUFpQixFQUFFO2dCQUNqQixpQkFBaUIsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RELFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQzthQUNuRTtZQUNELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU07U0FDeEMsQ0FBQyxDQUFDO1FBRUgsd0JBQXdCO1FBQ3hCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDN0MsS0FBSyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTO1lBQ3RDLFVBQVUsRUFBRSxxQkFBcUI7U0FDbEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUMzQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTO1lBQ3BDLFVBQVUsRUFBRSxtQkFBbUI7U0FDaEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUMxQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTO1lBQ25DLFVBQVUsRUFBRSxrQkFBa0I7U0FDL0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBaEVELDRDQWdFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBzZWNyZXRzbWFuYWdlciBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc2VjcmV0c21hbmFnZXInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VjcmV0c0NvbnN0cnVjdFByb3BzIHtcbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFNlY3JldHNDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgZGJQYXNzd29yZFNlY3JldDogc2VjcmV0c21hbmFnZXIuU2VjcmV0O1xuICBwdWJsaWMgcmVhZG9ubHkgY29nbml0b1NlY3JldHM6IHNlY3JldHNtYW5hZ2VyLlNlY3JldDtcbiAgcHVibGljIHJlYWRvbmx5IGFwaUtleXNTZWNyZXQ6IHNlY3JldHNtYW5hZ2VyLlNlY3JldDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogU2VjcmV0c0NvbnN0cnVjdFByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIC8vIFJEUyBkYXRhYmFzZSBwYXNzd29yZFxuICAgIHRoaXMuZGJQYXNzd29yZFNlY3JldCA9IG5ldyBzZWNyZXRzbWFuYWdlci5TZWNyZXQodGhpcywgJ0RiUGFzc3dvcmQnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1JEUyBQb3N0Z3JlU1FMIG1hc3RlciBwYXNzd29yZCcsXG4gICAgICBnZW5lcmF0ZVNlY3JldFN0cmluZzoge1xuICAgICAgICBzZWNyZXRTdHJpbmdUZW1wbGF0ZTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHVzZXJuYW1lOiAncG9zdGdyZXMnLFxuICAgICAgICB9KSxcbiAgICAgICAgZ2VuZXJhdGVTdHJpbmdLZXk6ICdwYXNzd29yZCcsXG4gICAgICAgIHBhc3N3b3JkTGVuZ3RoOiAzMixcbiAgICAgICAgZXhjbHVkZUNoYXJhY3RlcnM6ICdcIkAvXFxcXCcsXG4gICAgICB9LFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgIH0pO1xuXG4gICAgLy8gQ29nbml0byBPQXV0aCBjcmVkZW50aWFscyAoR29vZ2xlLCBMaW5rZWRJbilcbiAgICB0aGlzLmNvZ25pdG9TZWNyZXRzID0gbmV3IHNlY3JldHNtYW5hZ2VyLlNlY3JldChcbiAgICAgIHRoaXMsXG4gICAgICAnQ29nbml0b1NlY3JldHMnLFxuICAgICAge1xuICAgICAgICBkZXNjcmlwdGlvbjogJ0NvZ25pdG8gT0F1dGggcHJvdmlkZXIgY3JlZGVudGlhbHMnLFxuICAgICAgICBzZWNyZXRPYmplY3RWYWx1ZToge1xuICAgICAgICAgIGdvb2dsZUNsaWVudElkOiBjZGsuU2VjcmV0VmFsdWUudW5zYWZlUGxhaW5UZXh0KCcnKSxcbiAgICAgICAgICBnb29nbGVDbGllbnRTZWNyZXQ6IGNkay5TZWNyZXRWYWx1ZS51bnNhZmVQbGFpblRleHQoJycpLFxuICAgICAgICAgIGxpbmtlZGluQ2xpZW50SWQ6IGNkay5TZWNyZXRWYWx1ZS51bnNhZmVQbGFpblRleHQoJycpLFxuICAgICAgICAgIGxpbmtlZGluQ2xpZW50U2VjcmV0OiBjZGsuU2VjcmV0VmFsdWUudW5zYWZlUGxhaW5UZXh0KCcnKSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBBUEkgc2lnbmluZyBrZXlzIGFuZCBtaXNjIGNyZWRlbnRpYWxzXG4gICAgdGhpcy5hcGlLZXlzU2VjcmV0ID0gbmV3IHNlY3JldHNtYW5hZ2VyLlNlY3JldCh0aGlzLCAnQXBpS2V5cycsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIHNpZ25pbmcga2V5cyBhbmQgY3JlZGVudGlhbHMnLFxuICAgICAgc2VjcmV0T2JqZWN0VmFsdWU6IHtcbiAgICAgICAgbWV0cmljc1NpZ25pbmdLZXk6IGNkay5TZWNyZXRWYWx1ZS51bnNhZmVQbGFpblRleHQoJycpLFxuICAgICAgICBjb3JzT3JpZ2luczogY2RrLlNlY3JldFZhbHVlLnVuc2FmZVBsYWluVGV4dCgnaHR0cHM6Ly9zb2Nob2EuZGV2JyksXG4gICAgICB9LFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0cyBmb3IgcmVmZXJlbmNlXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0RiUGFzc3dvcmRTZWNyZXRBcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5kYlBhc3N3b3JkU2VjcmV0LnNlY3JldEFybixcbiAgICAgIGV4cG9ydE5hbWU6ICdEYlBhc3N3b3JkU2VjcmV0QXJuJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDb2duaXRvU2VjcmV0c0FybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmNvZ25pdG9TZWNyZXRzLnNlY3JldEFybixcbiAgICAgIGV4cG9ydE5hbWU6ICdDb2duaXRvU2VjcmV0c0FybicsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpS2V5c1NlY3JldEFybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFwaUtleXNTZWNyZXQuc2VjcmV0QXJuLFxuICAgICAgZXhwb3J0TmFtZTogJ0FwaUtleXNTZWNyZXRBcm4nLFxuICAgIH0pO1xuICB9XG59XG4iXX0=