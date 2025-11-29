import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface CognitoConstructProps {
  cognitoSecrets: secretsmanager.Secret;
  uiDomain: string;
  environment: string;
}

export class CognitoConstruct extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityProvider: cognito.UserPoolIdentityProviderGoogle;

  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
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
    this.userPoolClient = new cognito.UserPoolClient(
      this,
      'UserPoolClient',
      {
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
      }
    );

    // Google OAuth provider
    // Note: You'll need to configure OAuth credentials in AWS Cognito console
    // and store them in Secrets Manager
    // For now, using placeholder - configure in AWS console after deployment
    this.identityProvider = new cognito.UserPoolIdentityProviderGoogle(
      this,
      'Google',
      {
        userPool: this.userPool,
        clientId: 'PLACEHOLDER_GOOGLE_CLIENT_ID',
        clientSecret: 'PLACEHOLDER_GOOGLE_CLIENT_SECRET',
        scopes: ['email', 'openid', 'profile'],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
          familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
        },
      }
    );

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
