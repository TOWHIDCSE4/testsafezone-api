import { error, success, init, createAuthorizedHandler } from '@/modules/core';
import { SafeZoneModel } from '@/models/SafeZone';

export const createSafeZone = createAuthorizedHandler(async (e) => {
  await init();
  try {
    const body = JSON.parse(e.body || '{}');
    const safeZoneInfo = {
      ...body,
    };

    await SafeZoneModel.create(safeZoneInfo);

    return success({});
  } catch (e) {
    return error(e);
  }
});
