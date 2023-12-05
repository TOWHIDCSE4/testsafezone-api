import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

export const provider = new CognitoIdentityProvider({
  region: process.env.COGNITO_REGION,
  credentials: {
    sessionToken: process.env.AWS_SESSION_TOKEN,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
