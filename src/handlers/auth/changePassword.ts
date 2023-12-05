import { provider } from '@/modules/cognito';
import { createAuthorizedHandler, error, success } from '@/modules/core';

export const changePassword = createAuthorizedHandler(async (e) => {
  try {
    const { accessToken, previousPassword, newPassword } = JSON.parse(
      e.body || '{}'
    );

    if (!previousPassword || !newPassword)
      return error('Previous password and new password must be provided.');

    const result = await provider.changePassword({
      AccessToken: accessToken,
      PreviousPassword: previousPassword,
      ProposedPassword: newPassword,
    });

    return success({
      result,
    });
  } catch (e) {
    return error(e);
  }
});
