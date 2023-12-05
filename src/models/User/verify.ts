import { provider } from '@/modules/cognito';

export const verify = async (code: string, username: string) => {
  return await provider.confirmSignUp({
    ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
    Username: username,
    ConfirmationCode: code,
  });
};
