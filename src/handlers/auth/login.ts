import { createHandler, error, success, init } from '@/modules/core';
import { signIn } from '@/models/User/signIn';
import { UserModel } from '@/models/User';

export const login = createHandler(async (event) => {
  await init();
  const { username, password } = JSON.parse(event.body);

  if (!username || !password)
    return error({
      message: 'Username or password is not provided',
    });

  try {
    // Restore for old users after adding active column
    let user = await UserModel.findOneAndUpdate(
      {
        username: username,
        active: { $exists: false },
      },
      {
        active: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      user = await UserModel.findOne({
        username: username,
      });
    }

    if (user && user.active !== true)
      return error({
        message: 'Tài khoản đã ngừng hoạt động',
      });

    const result = await signIn(username, password);

    return success(result);
  } catch (e) {
    return error(e);
  }
});
