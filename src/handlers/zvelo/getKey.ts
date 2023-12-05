import { createAuthorizedHandler } from '@/modules/core';
import axios from 'axios';

export const getKey = createAuthorizedHandler(async () => {
  const zveloUrl = `https://${process.env.ZVELO_CLOUD_USERNAME}:${process.env.ZVELO_CLOUD_PASSWORD}@dl.zvelo.com/dia.key`;
  const zveloKeyResponse = await axios.get(zveloUrl);
  const fileName = 'safezonedia' + new Date().getTime();

  return {
    statusCode: zveloKeyResponse.status,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename=' + fileName,
    },
    body: String(zveloKeyResponse.data),
  };
});
