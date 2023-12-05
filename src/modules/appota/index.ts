import dayjs from 'dayjs';
import { sign } from 'jsonwebtoken';

const DEFAULT_EXPIRED_TIME = 60 * 30;

export const signAppotaToken = () => {
  const expiredTime = dayjs().unix() + DEFAULT_EXPIRED_TIME;
  const appotaToken = sign(
    {
      iss: process.env.APPOTA_PARTNER_CODE,
      jti: process.env.APPOTA_API_KEY + '-' + expiredTime, // (ex time: 1614225624)
      api_key: process.env.APPOTA_API_KEY,
      exp: expiredTime,
    },
    process.env.APPOTA_SECRET_KEY,
    {
      header: {
        typ: 'JWT',
        alg: 'HS256',
        cty: 'appotapay-api;v=1',
      },
    }
  );
  return appotaToken;
};
