import { DeviceModel } from '@/models/Device';
import { createAuthorizedHandler, init, success } from '@/modules/core';

export const getDevices = createAuthorizedHandler(async (e) => {
  await init();

  const parentId = e.requestContext.authorizer.claims.sub;

  const devices = await DeviceModel.find({
    userId: parentId,
  });

  return success({ result: devices });
});
