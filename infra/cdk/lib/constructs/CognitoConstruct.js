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
exports.CognitoConstruct = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const cognito = __importStar(require("aws-cdk-lib/aws-cognito"));
const constructs_1 = require("constructs");
class CognitoConstruct extends constructs_1.Construct {
    userPool;
    userPoolClient;
    identityProvider;
    constructor(scope, id, props) {
        super(scope, id);
        // Create User Pool with sensible defaults
        this.userPool = new cognito.UserPool(this, 'UserPool', {
            userPoolName: `sochoa-${props.environment}`,
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
            },
            passwordPolicy: {
                minLength: 12,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            mfa: cognito.Mfa.OPTIONAL, // Optional MFA (2FA)
            mfaSecondFactor: {
                sms: false,
                otp: true, // TOTP-based MFA (authenticator apps)
            },
        });
        // Add admin group for moderation
        new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
            groupName: 'admin',
            userPoolId: this.userPool.userPoolId,
            description: 'Administrators with moderation access',
        });
        // Add user group for standard users
        new cognito.CfnUserPoolGroup(this, 'UserGroup', {
            groupName: 'user',
            userPoolId: this.userPool.userPoolId,
            description: 'Standard authenticated users',
        });
        // Create User Pool Client with secure defaults
        this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
            userPool: this.userPool,
            authFlows: {
                userPassword: true, // For demo/testing
                adminUserPassword: false,
                custom: true,
                userSrp: true, // Recommended, uses PBKDF2
            },
            generateSecret: false, // Browser-based apps can't use secrets
            accessTokenValidity: cdk.Duration.hours(1),
            idTokenValidity: cdk.Duration.hours(1),
            refreshTokenValidity: cdk.Duration.days(30),
            enableTokenRevocation: true,
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.GOOGLE,
            ],
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: false, // More secure explicit flow
                },
                scopes: [
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.PROFILE,
                ],
                callbackUrls: [
                    `${props.uiDomain}/auth/callback`,
                    `${props.uiDomain}/auth`,
                    'http://localhost:5173/auth/callback', // Local dev
                ],
                logoutUrls: [
                    `${props.uiDomain}/`,
                    'http://localhost:5173/', // Local dev
                ],
            },
        });
        // Google OAuth provider
        // Note: You'll need to configure OAuth credentials in AWS Cognito console
        // and store them in Secrets Manager
        // For now, using placeholder - configure in AWS console after deployment
        this.identityProvider = new cognito.UserPoolIdentityProviderGoogle(this, 'Google', {
            userPool: this.userPool,
            clientId: 'PLACEHOLDER_GOOGLE_CLIENT_ID',
            clientSecret: 'PLACEHOLDER_GOOGLE_CLIENT_SECRET',
            scopes: ['email', 'openid', 'profile'],
            attributeMapping: {
                email: cognito.ProviderAttribute.GOOGLE_EMAIL,
                givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
                familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
            },
        });
        // Link identity provider to client
        this.userPoolClient.node.addDependency(this.identityProvider);
        // Domain for hosted UI
        const domain = this.userPool.addDomain('CognitoDomain', {
            cognitoDomain: {
                domainPrefix: `sochoa-${props.environment}`,
            },
        });
        // Outputs
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: this.userPool.userPoolId,
            exportName: 'CognitoUserPoolId',
        });
        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: this.userPoolClient.userPoolClientId,
            exportName: 'CognitoClientId',
        });
        new cdk.CfnOutput(this, 'CognitoDomain', {
            value: domain.domainName,
            exportName: 'CognitoDomain',
        });
        new cdk.CfnOutput(this, 'HostedUiUrl', {
            value: `https://${domain.domainName}.auth.${cdk.Stack.of(this).region}.amazoncognito.com/login?client_id=${this.userPoolClient.userPoolClientId}&response_type=code&scope=email+openid+profile&redirect_uri=${props.uiDomain}/auth/callback`,
            exportName: 'CognitoHostedUiUrl',
        });
    }
}
exports.CognitoConstruct = CognitoConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29nbml0b0NvbnN0cnVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvZ25pdG9Db25zdHJ1Y3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBQ25DLGlFQUFtRDtBQUVuRCwyQ0FBdUM7QUFRdkMsTUFBYSxnQkFBaUIsU0FBUSxzQkFBUztJQUM3QixRQUFRLENBQW1CO0lBQzNCLGNBQWMsQ0FBeUI7SUFDdkMsZ0JBQWdCLENBQXlDO0lBRXpFLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBNEI7UUFDcEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQiwwQ0FBMEM7UUFDMUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNyRCxZQUFZLEVBQUUsVUFBVSxLQUFLLENBQUMsV0FBVyxFQUFFO1lBQzNDLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsYUFBYSxFQUFFO2dCQUNiLEtBQUssRUFBRSxJQUFJO2FBQ1o7WUFDRCxjQUFjLEVBQUU7Z0JBQ2QsU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLGNBQWMsRUFBRSxJQUFJO2FBQ3JCO1lBQ0QsZUFBZSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsVUFBVTtZQUNuRCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQ3ZDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxxQkFBcUI7WUFDaEQsZUFBZSxFQUFFO2dCQUNmLEdBQUcsRUFBRSxLQUFLO2dCQUNWLEdBQUcsRUFBRSxJQUFJLEVBQUUsc0NBQXNDO2FBQ2xEO1NBQ0YsQ0FBQyxDQUFDO1FB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Q0FBQztRQUU5RCx1QkFBdUI7UUFDdkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFO1lBQ3RELGFBQWEsRUFBRTtnQkFDYixZQUFZLEVBQUUsVUFBVSxLQUFLLENBQUMsV0FBVyxFQUFFO2FBQzVDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsVUFBVTtRQUNWLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVU7WUFDL0IsVUFBVSxFQUFFLG1CQUFtQjtTQUNoQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzFDLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQjtZQUMzQyxVQUFVLEVBQUUsaUJBQWlCO1NBQzlCLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3ZDLEtBQUssRUFBRSxNQUFNLENBQUMsVUFBVTtZQUN4QixVQUFVLEVBQUUsZUFBZTtTQUM1QixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNyQyxLQUFLLEVBQUUsV0FBVyxNQUFNLENBQUMsVUFBVSxTQUFTLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sc0NBQXNDLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLCtEQUErRCxLQUFLLENBQUMsUUFBUSxnQkFBZ0I7WUFDNU8sVUFBVSxFQUFFLG9CQUFvQjtTQUNqQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUEzSUQsNENBMklDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGNvZ25pdG8gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZ25pdG8nO1xuaW1wb3J0ICogYXMgc2VjcmV0c21hbmFnZXIgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNlY3JldHNtYW5hZ2VyJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvZ25pdG9Db25zdHJ1Y3RQcm9wcyB7XG4gIGNvZ25pdG9TZWNyZXRzOiBzZWNyZXRzbWFuYWdlci5TZWNyZXQ7XG4gIHVpRG9tYWluOiBzdHJpbmc7XG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBDb2duaXRvQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHVibGljIHJlYWRvbmx5IHVzZXJQb29sOiBjb2duaXRvLlVzZXJQb29sO1xuICBwdWJsaWMgcmVhZG9ubHkgdXNlclBvb2xDbGllbnQ6IGNvZ25pdG8uVXNlclBvb2xDbGllbnQ7XG4gIHB1YmxpYyByZWFkb25seSBpZGVudGl0eVByb3ZpZGVyOiBjb2duaXRvLlVzZXJQb29sSWRlbnRpdHlQcm92aWRlckdvb2dsZTtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogQ29nbml0b0NvbnN0cnVjdFByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIC8vIENyZWF0ZSBVc2VyIFBvb2wgd2l0aCBzZW5zaWJsZSBkZWZhdWx0c1xuICAgIHRoaXMudXNlclBvb2wgPSBuZXcgY29nbml0by5Vc2VyUG9vbCh0aGlzLCAnVXNlclBvb2wnLCB7XG4gICAgICB1c2VyUG9vbE5hbWU6IGBzb2Nob2EtJHtwcm9wcy5lbnZpcm9ubWVudH1gLFxuICAgICAgc2VsZlNpZ25VcEVuYWJsZWQ6IHRydWUsXG4gICAgICBzaWduSW5BbGlhc2VzOiB7XG4gICAgICAgIGVtYWlsOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHBhc3N3b3JkUG9saWN5OiB7XG4gICAgICAgIG1pbkxlbmd0aDogMTIsXG4gICAgICAgIHJlcXVpcmVMb3dlcmNhc2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmVVcHBlcmNhc2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmVEaWdpdHM6IHRydWUsXG4gICAgICAgIHJlcXVpcmVTeW1ib2xzOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGFjY291bnRSZWNvdmVyeTogY29nbml0by5BY2NvdW50UmVjb3ZlcnkuRU1BSUxfT05MWSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTixcbiAgICAgIG1mYTogY29nbml0by5NZmEuT1BUSU9OQUwsIC8vIE9wdGlvbmFsIE1GQSAoMkZBKVxuICAgICAgbWZhU2Vjb25kRmFjdG9yOiB7XG4gICAgICAgIHNtczogZmFsc2UsXG4gICAgICAgIG90cDogdHJ1ZSwgLy8gVE9UUC1iYXNlZCBNRkEgKGF1dGhlbnRpY2F0b3IgYXBwcylcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgYWRtaW4gZ3JvdXAgZm9yIG1vZGVyYXRpb25cbiAgICBuZXcgY29nbml0by5DZm5Vc2VyUG9vbEdyb3VwKHRoaXMsICdBZG1pbkdyb3VwJywge1xuICAgICAgZ3JvdXBOYW1lOiAnYWRtaW4nLFxuICAgICAgdXNlclBvb2xJZDogdGhpcy51c2VyUG9vbC51c2VyUG9vbElkLFxuICAgICAgZGVzY3JpcHRpb246ICdBZG1pbmlzdHJhdG9ycyB3aXRoIG1vZGVyYXRpb24gYWNjZXNzJyxcbiAgICB9KTtcblxuICAgIC8vIEFkZCB1c2VyIGdyb3VwIGZvciBzdGFuZGFyZCB1c2Vyc1xuICAgIG5ldyBjb2duaXRvLkNmblVzZXJQb29sR3JvdXAodGhpcywgJ1VzZXJHcm91cCcsIHtcbiAgICAgIGdyb3VwTmFtZTogJ3VzZXInLFxuICAgICAgdXNlclBvb2xJZDogdGhpcy51c2VyUG9vbC51c2VyUG9vbElkLFxuICAgICAgZGVzY3JpcHRpb246ICdTdGFuZGFyZCBhdXRoZW50aWNhdGVkIHVzZXJzJyxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBVc2VyIFBvb2wgQ2xpZW50IHdpdGggc2VjdXJlIGRlZmF1bHRzXG4gICAgdGhpcy51c2VyUG9vbENsaWVudCA9IG5ldyBjb2duaXRvLlVzZXJQb29sQ2xpZW50KFxuICAgICAgdGhpcyxcbiAgICAgICdVc2VyUG9vbENsaWVudCcsXG4gICAgICB7XG4gICAgICAgIHVzZXJQb29sOiB0aGlzLnVzZXJQb29sLFxuICAgICAgICBhdXRoRmxvd3M6IHtcbiAgICAgICAgICB1c2VyUGFzc3dvcmQ6IHRydWUsIC8vIEZvciBkZW1vL3Rlc3RpbmdcbiAgICAgICAgICBhZG1pblVzZXJQYXNzd29yZDogZmFsc2UsXG4gICAgICAgICAgY3VzdG9tOiB0cnVlLFxuICAgICAgICAgIHVzZXJTcnA6IHRydWUsIC8vIFJlY29tbWVuZGVkLCB1c2VzIFBCS0RGMlxuICAgICAgICB9LFxuICAgICAgICBnZW5lcmF0ZVNlY3JldDogZmFsc2UsIC8vIEJyb3dzZXItYmFzZWQgYXBwcyBjYW4ndCB1c2Ugc2VjcmV0c1xuICAgICAgICBhY2Nlc3NUb2tlblZhbGlkaXR5OiBjZGsuRHVyYXRpb24uaG91cnMoMSksXG4gICAgICAgIGlkVG9rZW5WYWxpZGl0eTogY2RrLkR1cmF0aW9uLmhvdXJzKDEpLFxuICAgICAgICByZWZyZXNoVG9rZW5WYWxpZGl0eTogY2RrLkR1cmF0aW9uLmRheXMoMzApLFxuICAgICAgICBlbmFibGVUb2tlblJldm9jYXRpb246IHRydWUsXG4gICAgICAgIHN1cHBvcnRlZElkZW50aXR5UHJvdmlkZXJzOiBbXG4gICAgICAgICAgY29nbml0by5Vc2VyUG9vbENsaWVudElkZW50aXR5UHJvdmlkZXIuR09PR0xFLFxuICAgICAgICBdLFxuICAgICAgICBvQXV0aDoge1xuICAgICAgICAgIGZsb3dzOiB7XG4gICAgICAgICAgICBhdXRob3JpemF0aW9uQ29kZUdyYW50OiB0cnVlLFxuICAgICAgICAgICAgaW1wbGljaXRDb2RlR3JhbnQ6IGZhbHNlLCAvLyBNb3JlIHNlY3VyZSBleHBsaWNpdCBmbG93XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzY29wZXM6IFtcbiAgICAgICAgICAgIGNvZ25pdG8uT0F1dGhTY29wZS5FTUFJTCxcbiAgICAgICAgICAgIGNvZ25pdG8uT0F1dGhTY29wZS5PUEVOSUQsXG4gICAgICAgICAgICBjb2duaXRvLk9BdXRoU2NvcGUuUFJPRklMRSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGNhbGxiYWNrVXJsczogW1xuICAgICAgICAgICAgYCR7cHJvcHMudWlEb21haW59L2F1dGgvY2FsbGJhY2tgLFxuICAgICAgICAgICAgYCR7cHJvcHMudWlEb21haW59L2F1dGhgLFxuICAgICAgICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3My9hdXRoL2NhbGxiYWNrJywgLy8gTG9jYWwgZGV2XG4gICAgICAgICAgXSxcbiAgICAgICAgICBsb2dvdXRVcmxzOiBbXG4gICAgICAgICAgICBgJHtwcm9wcy51aURvbWFpbn0vYCxcbiAgICAgICAgICAgICdodHRwOi8vbG9jYWxob3N0OjUxNzMvJywgLy8gTG9jYWwgZGV2XG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gR29vZ2xlIE9BdXRoIHByb3ZpZGVyXG4gICAgLy8gTm90ZTogWW91J2xsIG5lZWQgdG8gY29uZmlndXJlIE9BdXRoIGNyZWRlbnRpYWxzIGluIEFXUyBDb2duaXRvIGNvbnNvbGVcbiAgICAvLyBhbmQgc3RvcmUgdGhlbSBpbiBTZWNyZXRzIE1hbmFnZXJcbiAgICAvLyBGb3Igbm93LCB1c2luZyBwbGFjZWhvbGRlciAtIGNvbmZpZ3VyZSBpbiBBV1MgY29uc29sZSBhZnRlciBkZXBsb3ltZW50XG4gICAgdGhpcy5pZGVudGl0eVByb3ZpZGVyID0gbmV3IGNvZ25pdG8uVXNlclBvb2xJZGVudGl0eVByb3ZpZGVyR29vZ2xlKFxuICAgICAgdGhpcyxcbiAgICAgICdHb29nbGUnLFxuICAgICAge1xuICAgICAgICB1c2VyUG9vbDogdGhpcy51c2VyUG9vbCxcbiAgICAgICAgY2xpZW50SWQ6ICdQTEFDRUhPTERFUl9HT09HTEVfQ0xJRU5UX0lEJyxcbiAgICAgICAgY2xpZW50U2VjcmV0OiAnUExBQ0VIT0xERVJfR09PR0xFX0NMSUVOVF9TRUNSRVQnLFxuICAgICAgICBzY29wZXM6IFsnZW1haWwnLCAnb3BlbmlkJywgJ3Byb2ZpbGUnXSxcbiAgICAgICAgYXR0cmlidXRlTWFwcGluZzoge1xuICAgICAgICAgIGVtYWlsOiBjb2duaXRvLlByb3ZpZGVyQXR0cmlidXRlLkdPT0dMRV9FTUFJTCxcbiAgICAgICAgICBnaXZlbk5hbWU6IGNvZ25pdG8uUHJvdmlkZXJBdHRyaWJ1dGUuR09PR0xFX0dJVkVOX05BTUUsXG4gICAgICAgICAgZmFtaWx5TmFtZTogY29nbml0by5Qcm92aWRlckF0dHJpYnV0ZS5HT09HTEVfRkFNSUxZX05BTUUsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIExpbmsgaWRlbnRpdHkgcHJvdmlkZXIgdG8gY2xpZW50XG4gICAgdGhpcy51c2VyUG9vbENsaWVudC5ub2RlLmFkZERlcGVuZGVuY3kodGhpcy5pZGVudGl0eVByb3ZpZGVyKTtcblxuICAgIC8vIERvbWFpbiBmb3IgaG9zdGVkIFVJXG4gICAgY29uc3QgZG9tYWluID0gdGhpcy51c2VyUG9vbC5hZGREb21haW4oJ0NvZ25pdG9Eb21haW4nLCB7XG4gICAgICBjb2duaXRvRG9tYWluOiB7XG4gICAgICAgIGRvbWFpblByZWZpeDogYHNvY2hvYS0ke3Byb3BzLmVudmlyb25tZW50fWAsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdVc2VyUG9vbElkJywge1xuICAgICAgdmFsdWU6IHRoaXMudXNlclBvb2wudXNlclBvb2xJZCxcbiAgICAgIGV4cG9ydE5hbWU6ICdDb2duaXRvVXNlclBvb2xJZCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnVXNlclBvb2xDbGllbnRJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLnVzZXJQb29sQ2xpZW50LnVzZXJQb29sQ2xpZW50SWQsXG4gICAgICBleHBvcnROYW1lOiAnQ29nbml0b0NsaWVudElkJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDb2duaXRvRG9tYWluJywge1xuICAgICAgdmFsdWU6IGRvbWFpbi5kb21haW5OYW1lLFxuICAgICAgZXhwb3J0TmFtZTogJ0NvZ25pdG9Eb21haW4nLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0hvc3RlZFVpVXJsJywge1xuICAgICAgdmFsdWU6IGBodHRwczovLyR7ZG9tYWluLmRvbWFpbk5hbWV9LmF1dGguJHtjZGsuU3RhY2sub2YodGhpcykucmVnaW9ufS5hbWF6b25jb2duaXRvLmNvbS9sb2dpbj9jbGllbnRfaWQ9JHt0aGlzLnVzZXJQb29sQ2xpZW50LnVzZXJQb29sQ2xpZW50SWR9JnJlc3BvbnNlX3R5cGU9Y29kZSZzY29wZT1lbWFpbCtvcGVuaWQrcHJvZmlsZSZyZWRpcmVjdF91cmk9JHtwcm9wcy51aURvbWFpbn0vYXV0aC9jYWxsYmFja2AsXG4gICAgICBleHBvcnROYW1lOiAnQ29nbml0b0hvc3RlZFVpVXJsJyxcbiAgICB9KTtcbiAgfVxufVxuIl19