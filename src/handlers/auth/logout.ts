import { provider } from '@/modules/cognito';
import { createHandler, getUsernameFromEvent, success } from '@/modules/core';

export const logout = createHandler(async (e) => {
  await provider.adminUserGlobalSignOut({
    Username: getUsernameFromEvent(e),
    UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
  });

  return success('success');
});
