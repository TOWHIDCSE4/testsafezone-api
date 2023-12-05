import { adminCreateUser, validation } from '@/models/User';
import { error, success, init, validateService } from '@/modules/core';

export const registerByAdmin = validateService(async (event) => {
  await init();
  const { username, email, password } = JSON.parse(event.body);

  const msg = await validation(username, email, password);
  if (msg) {
    return error(msg);
  }

  try {
    const { cognitoUser } = await adminCreateUser({
      username,
      email,
      password,
    });

    return success({
      codeDeliveryDetails: cognitoUser.CodeDeliveryDetails,
      sub: cognitoUser.UserSub,
      userConfirmed: cognitoUser.UserConfirmed,
    });
  } catch (e) {
    return error(e);
  }
});
