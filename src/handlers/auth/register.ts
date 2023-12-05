import { EnumTypeAccount, createUser, validation } from '@/models/User';
import { error, success, init, createHandler } from '@/modules/core';

export const register = createHandler(async (event) => {
  await init();
  const { username, email, password } = JSON.parse(event.body);
  let typeAccount = parseInt(JSON.parse(event.body).type as string);
  const msg = await validation(username, email, password);
  if (msg) {
    return error(msg);
  }
  try {
    const { cognitoUser } = await createUser({
      username,
      email,
      password,
      type: typeAccount ?? EnumTypeAccount.Family
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
