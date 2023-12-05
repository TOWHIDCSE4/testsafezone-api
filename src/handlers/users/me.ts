import { UserModel } from '@/models/User';
import { UserGroup, UserGroupModel } from '@/models/User/Group';
import {
  createAuthorizedHandler,
  getUserIdFromEvent,
  getUsernameFromEvent,
  init,
  success,
} from '@/modules/core';

export const me = createAuthorizedHandler(async (e) => {
  await init();

  const id = getUserIdFromEvent(e);
  const username = getUsernameFromEvent(e);
  const cognitoEmail = e.requestContext.authorizer?.claims.email;
  const cognitoPhoneNumber = e.requestContext.authorizer?.claims.phoneNumber;
  let existingProfile = await UserModel.findOne({
    _id: id,
  })
    .populate('group')
    .exec();

  // If user does not exist in MongoDB but Cognito account exist, we created a new profile
  if (!existingProfile) {
    let defaultGroup: UserGroup | undefined;

    try {
      defaultGroup = await UserGroupModel.findOne({
        isDefault: true,
      });
    } catch (e) {
      console.log(e);
    }

    const newProfile = await UserModel.create({
      _id: id,
      avatar: null,
      username: username || null,
      displayName: username || cognitoEmail,
      email: cognitoEmail || null,
      phoneNumber: cognitoPhoneNumber || null,
      lang: 'vi',
      group: defaultGroup,
      active: true,
    });

    return success({
      user: newProfile,
    });
  } else {
    // Recover for old users after adding username and email columns
    if (
      username != existingProfile.username ||
      cognitoEmail != existingProfile.email
    ) {
      const newDataUser = {
        username: username || null,
        email: cognitoEmail || null,
      };

      existingProfile = await UserModel.findOneAndUpdate(
        {
          _id: existingProfile._id,
        },
        newDataUser,
        {
          new: true,
          runValidators: true,
        }
      );
    }
  }

  return success({
    user: existingProfile,
  });
});
