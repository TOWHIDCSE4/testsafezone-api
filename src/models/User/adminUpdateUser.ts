import { provider } from '@/modules/cognito';
import mongoose from 'mongoose';

interface CreateRequestUserParams {
  username: string;
  password: string;
}

export const adminUpdateUser = async ({
  username,
  password,
}: CreateRequestUserParams) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (password) {
      await provider.adminSetUserPassword({
        Password: password,
        Username: username,
        Permanent: true,
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      });
    }

    session.commitTransaction();
    session.endSession();

    return true;
  } catch (e) {
    throw e;
  }
};
