import { UserModel, User } from './User';

export const createOrUpdateProfile = (profileData: User) => {
  const user = new UserModel(profileData);
  return user.save();
};
