import { UserModel } from '@/models/User';
import { UserGroup } from '@/models/User/Group';
import type { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { init } from './bootstrap';
import { error } from './response';
import { provider } from '@/modules/cognito';
import { SubscriptionModel } from '@/models/Subscription';
const API_KEY_ADMIN = 'udNpqUX50as21bVGprDGBYLxWk';

export const getRequestIdToken = (e: APIGatewayEvent) => {
  return e.headers.authorization || e.headers.Authorization;
};

export const getUsernameFromEvent = (e: APIGatewayEvent) => {
  return e.requestContext.authorizer?.claims['cognito:username'];
};

export const getUserIdFromEvent = (e: APIGatewayEvent) => {
  return e.requestContext.authorizer?.claims['sub'];
};

export const createHandler = (
  handler: APIGatewayProxyHandler
): APIGatewayProxyHandler => {
  return handler;
};

export const createAuthorizedHandler = (
  handler: APIGatewayProxyHandler
): APIGatewayProxyHandler => {
  const wrapperFn: APIGatewayProxyHandler = async (
    event,
    context,
    callback
  ) => {
    // If there is no access token OR the token is invalid
    if (
      !getRequestIdToken(event) ||
      !event.requestContext.authorizer?.claims?.sub
    )
      return error('Unauthorized');

    return handler(event, context, callback) as Exclude<
      ReturnType<APIGatewayProxyHandler>,
      void
    >;
  };

  return wrapperFn;
};

export const createAdminHandler = (
  handler: APIGatewayProxyHandler
): APIGatewayProxyHandler => {
  const wrapperFn: APIGatewayProxyHandler = async (
    event,
    context,
    callback
  ) => {
    // If there is no access token OR the token is invalid
    if (
      !getRequestIdToken(event) ||
      !event.requestContext.authorizer?.claims?.sub
    )
      return error('Unauthorized');

    await init();

    const user = await UserModel.findById(getUserIdFromEvent(event))
      .populate('group')
      .exec();

    if (!(user.group as any as UserGroup).isAdmin)
      return error('For admin only.');

    return handler(event, context, callback) as Exclude<
      ReturnType<APIGatewayProxyHandler>,
      void
    >;
  };

  return wrapperFn;
};

export const checkIfUserDoesntExistWithUsername = async (
  username: any,
  password: any
) => {
  try {
    await provider.initiateAuth({
      ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    return false;
  } catch (e) {
    if (
      e?.name == 'UserNotFoundException' ||
      e?.name == 'UserNotConfirmedException'
    ) {
      return true;
    } else {
      return false;
    }
  }
};

export const checkIfUserDoesntExistWithEmail = async (
  email: any,
  password: any
) => {
  try {
    await provider.initiateAuth({
      ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    return false;
  } catch (e) {
    if (
      e?.name == 'UserNotFoundException' ||
      e?.name == 'UserNotConfirmedException'
    ) {
      return true;
    } else {
      return false;
    }
  }
};

export const validateService = (
  handler: APIGatewayProxyHandler
): APIGatewayProxyHandler => {
  const wrapperFn: APIGatewayProxyHandler = async (
    event,
    context,
    callback
  ) => {
    if (event.multiValueHeaders?.api_key?.[0] !== API_KEY_ADMIN)
      return error('Bạn không có quyền truy cập');

    return handler(event, context, callback) as Exclude<
      ReturnType<APIGatewayProxyHandler>,
      void
    >;
  };

  return wrapperFn;
};

export const checkExpiredSubscription = async (event: any) => {
  await init();
  const userId = getUserIdFromEvent(event);
  const subscription = await SubscriptionModel.findOne({
    user: userId,
  });
  const now = new Date();
  if (!subscription || !subscription.endDate || now > subscription.endDate) {
    return true;
  }

  return false;
};
