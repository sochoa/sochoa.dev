/**
 * Cognito Configuration
 *
 * Environment variables needed:
 * - VITE_COGNITO_REGION: AWS region (e.g., 'us-west-2')
 * - VITE_COGNITO_USER_POOL_ID: Cognito User Pool ID
 * - VITE_COGNITO_CLIENT_ID: Cognito App Client ID
 * - VITE_COGNITO_DOMAIN: Cognito domain for hosted UI
 * - VITE_APP_URL: Application base URL for redirects
 */

export const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
      region: import.meta.env.VITE_COGNITO_REGION || 'us-west-2',
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_COGNITO_DOMAIN || '',
          scopes: ['phone', 'email', 'openid', 'profile'],
          redirectSignIn: [`${import.meta.env.VITE_APP_URL || 'http://localhost:3000'}/auth/callback`],
          redirectSignOut: [`${import.meta.env.VITE_APP_URL || 'http://localhost:3000'}/`],
          responseType: 'code',
          providers: {
            google: {
              clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
              clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
            },
            linkedin: {
              clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
              clientSecret: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET,
            },
          },
        },
      },
    },
  },
}

export const isConfigured = () => {
  return (
    !!import.meta.env.VITE_COGNITO_USER_POOL_ID &&
    !!import.meta.env.VITE_COGNITO_CLIENT_ID &&
    !!import.meta.env.VITE_COGNITO_DOMAIN
  )
}
