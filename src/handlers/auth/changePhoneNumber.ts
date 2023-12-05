import { provider } from '@/modules/cognito';
import {
  createAuthorizedHandler,
  error,
  success,
  getUserIdFromEvent,
} from '@/modules/core';
import { UserModel } from '@/models/User';

export const changePhoneNumber = createAuthorizedHandler(async (e) => {
  try {
    const { accessToken, newPhoneNumber } = JSON.parse(e.body || '{}');
    const id = getUserIdFromEvent(e);

    // if (!newPhoneNumber || !Number(newPhoneNumber))
    //   return error(JSON.stringify(newPhoneNumber));

    const result = await provider.updateUserAttributes({
      AccessToken: accessToken,
      UserAttributes: [
        {
          Name: 'phone_number',
          Value: '+849123123123',
        },
      ],
    });

    if (result) {
      await UserModel.findOneAndUpdate(
        {
          _id: id,
        },
        {
          phoneNumber: newPhoneNumber,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    return success({
      result,
    });
  } catch (e) {
    return error(e);
  }
});
