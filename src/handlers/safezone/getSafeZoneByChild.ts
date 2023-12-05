import { SafeZoneModel } from '@/models/SafeZone';
import { createAuthorizedHandler, init, success, error } from '@/modules/core';

export const getSafeZoneByChild = createAuthorizedHandler(async (e) => {
  await init();

  try {
    const childId = e.pathParameters?.childId;
    const safeZone = await SafeZoneModel.find({childrenId: childId});

    return success({
      result: safeZone,
    });
  } catch (e) {
    return error(e);
  }}
);
