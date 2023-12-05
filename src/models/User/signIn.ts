import { provider } from '@/modules/cognito';

export const signIn = async (username: string, password: string) => {
  console.log(`signIn >>>, username: ${username}, password: ${password}`);

  const authResult = await provider.initiateAuth({
    ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  });
  console.log(`authResult: ${JSON.stringify(authResult)}`);

  const user = await provider.getUser({
    AccessToken: authResult.AuthenticationResult.AccessToken,
  });
  console.log(`user: ${JSON.stringify(user)}`);

  // Delete unnecessary fields
  delete authResult.$metadata;
  // delete authResult.AuthenticationResult.AccessToken;
  delete user.$metadata;

  return { authResult, user };
};

export const forceSignIn = async (username: string) => {
  const authResult = await provider.adminInitiateAuth({
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
    UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
    AuthParameters: {
      USERNAME: username,
    },
  });

  const user = await provider.getUser({
    AccessToken: authResult.AuthenticationResult.AccessToken,
  });
  // Delete unnecessary fields
  delete authResult.$metadata;
  delete user.$metadata;

  return {
    authResult,
    user,
  };
};
