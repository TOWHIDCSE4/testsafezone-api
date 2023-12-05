import { verify as verifyUser } from '@/models/User';
// import { forceSignIn } from '@/models/User/signIn';
import { createHandler, error, success } from '@/modules/core';

export const verify = createHandler(async (e) => {
  const { code, username, redirectToDashboard } = e.queryStringParameters || {};
  const redirectUrl = process.env.SAFE_ZONE_PORTAL_URL + '/login';

  try {
    if (!code || !username)
      return error({ message: 'Code and username must be provided!' });

    console.log(e.queryStringParameters);

    const result = await verifyUser(code, username);

    if (redirectToDashboard == '1') {
      // TODO: Research on auto login flow because Cognito doesn't allow login without password natively
      // const authResult = await forceSignIn(username);
      const redirectUrlWithParams =
        redirectUrl +
        '?' +
        new URLSearchParams({
          pl: Buffer.from(
            JSON.stringify({
              success: true,
              // authResult,
            })
          ).toString('base64url'),
        });

      console.log(redirectUrlWithParams);

      return {
        statusCode: 301,
        headers: {
          Location: redirectUrlWithParams,
        },
        body: '',
      };
    }

    return success({
      result,
    });
  } catch (e) {
    console.log(e);
    if (redirectUrl) {
      const redirectUrlWithParams =
        redirectUrl +
        '?' +
        new URLSearchParams({
          pl: Buffer.from(
            JSON.stringify({
              success: false,
            })
          ).toString('base64url'),
        });

      return {
        statusCode: 301,
        headers: {
          Location: redirectUrlWithParams,
        },
        body: '',
      };
    }

    return error(e);
  }
});
