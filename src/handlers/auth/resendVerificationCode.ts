import { provider } from '@/modules/cognito';
import { error, success } from '@/modules/core';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const resendVerificationCode: APIGatewayProxyHandler = async (e) => {
  try {
    const { username } = JSON.parse(e.body);

    if (!username) return;

    const result = await provider.resendConfirmationCode({
      ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
      Username: username,
    });

    return success({
      result,
    });
  } catch (e) {
    return error(String(e));
  }
};
