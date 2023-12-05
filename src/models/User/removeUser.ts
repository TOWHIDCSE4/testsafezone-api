import { provider } from '@/modules/cognito';

export const removeUser = async (username: string) => {
  await provider.adminDeleteUser({
    Username: username,
    UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
  });
};
