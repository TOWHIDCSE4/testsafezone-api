import { provider } from '@/modules/cognito';
import { createHandler, error, success } from '@/modules/core';

export const forgotPassword = createHandler(async (e) => {
  try {
    const { username } = JSON.parse(e.body || '{}');

    const result = await provider.forgotPassword({
      ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
      Username: username,
    });

    return success({
      result,
    });
  } catch (e) {
    return error(e);
  }
});

export const confirmForgotPassword = createHandler(async (e) => {
  const { confirmationCode, username, newPassword } = JSON.parse(
    e.body || '{}'
  );

  try {
    const result = await provider.confirmForgotPassword({
      ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
      ConfirmationCode: confirmationCode,
      Username: username,
      Password: newPassword,
    });

    return success({
      result,
    });
  } catch (e) {
    return error(e);
  }
});
