import { provider } from '@/modules/cognito';
import mongoose from 'mongoose';
import { UserModel } from '.';

interface CreateRequestUserParams {
  username: string;
  email: string;
  password: string;
}

export const adminCreateUser = async ({
  username,
  email,
  password,
}: CreateRequestUserParams) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = new UserModel({
      avatar: null,
      username: username,
      displayName: username || email,
      email: email,
      phoneNumber: null,
      lang: 'en',
      active: true,
    });

    const cognitoUser = await provider.signUp({
      Username: username,
      Password: password,
      ClientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
    });

    await provider.adminUpdateUserAttributes({
      Username: username,
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      UserAttributes: [
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
    });

    await provider.adminConfirmSignUp({
      Username: username,
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
    });

    user._id = cognitoUser.UserSub;

    await Promise.all([user.save(), session.commitTransaction()]);
    session.endSession();

    return { cognitoUser };
  } catch (e) {
    // await Promise.all([session.abortTransaction(), removeUser(username)]);
    throw e;
  }
};
