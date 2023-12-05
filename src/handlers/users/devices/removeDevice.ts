import { DeviceModel } from '@/models/Device';
import {
  createAuthorizedHandler,
  error,
  getUserIdFromEvent,
  init,
  success,
} from '@/modules/core';

export const handler = createAuthorizedHandler(async (e) => {
  await init();

  const userId = getUserIdFromEvent(e);
  const deviceId = e.pathParameters.deviceId;

  try {
    const device = await DeviceModel.findOne({
      userId: userId,
      _id: deviceId,
    });

    if (!device)
      return error(
        'Device not found. Wrong deviceId or user does not have permission to delete this device.'
      );

    await device.delete();

    return success('ok');
  } catch (e) {
    console.error(e);
    return error(String(e));
  }
});
