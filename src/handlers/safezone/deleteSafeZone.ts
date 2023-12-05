import { error, success, init, createAuthorizedHandler } from '@/modules/core';
import { SafeZoneModel } from '@/models/SafeZone';

export const deleteSafeZone = createAuthorizedHandler(async (e) => {
  await init();
  try {
    const safeZoneId = e.pathParameters.safeZoneId;

    await SafeZoneModel.deleteOne({ _id: safeZoneId });

    return success({});
  } catch (e) {
    return error(e);
  }
});
