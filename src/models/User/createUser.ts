import { provider } from '@/modules/cognito';
import mongoose from 'mongoose';
import { UserModel } from '.';

interface CreateRequestUserParams {
  username: string;
  email: string;
  password: string;
  type: number;
}

export const createUser = async ({
  username,
  email,
  password,
  type
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
      type
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

    user._id = cognitoUser.UserSub;

    await Promise.all([user.save(), session.commitTransaction()]);
    session.endSession();

    return { cognitoUser };
  } catch (e) {
    // await Promise.all([session.abortTransaction(), removeUser(username)]);
    throw e;
  }
};
