import { provider } from '@/modules/cognito';
import { createHandler, error, success } from '@/modules/core';

export const handler = createHandler(async (e) => {
  try {
    const { refreshToken } = JSON.parse(e.body || '{}');

    if (!refreshToken) return error('refreshToken is required');

    const result = await provider.initiateAuth({
      ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    return success({
      result,
    });
  } catch (e) {
    return error(e);
  }
});
