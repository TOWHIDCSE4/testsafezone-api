import { DeviceModel } from '@/models/Device';
import { createAuthorizedHandler, init, success } from '@/modules/core';

export const handler = createAuthorizedHandler(async (e) => {
  await init();

  const { childId } = e.pathParameters;

  const devices = await DeviceModel.findOne({
    children: childId,
  });

  return success({
    result: [devices],
  });
});
