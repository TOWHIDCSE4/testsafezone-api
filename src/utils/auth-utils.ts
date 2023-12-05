import JWT from './jwt';
import _ from 'lodash';

const expire_time_token = 432000;

export const createToken = async (user: any, secret: string) => {
  const access_token = await JWT.encode(
    _.pick(user, [
      'id',
      'phone',
      'email',
      'username',
      'phone_number',
      'first_name',
      'last_name',
      'full_name',
      'gender',
      'avatar',
      'date_of_birth',
    ]),
    secret,
    Number(expire_time_token)
  );

  return access_token;
};
