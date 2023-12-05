import { error, success, init, createAuthorizedHandler } from '@/modules/core';
import { SafeZoneModel } from '@/models/SafeZone';
import { ChildModel } from '@/models/Child';

export const updateSafeZone = createAuthorizedHandler(async (e) => {
  await init();

  const safeZoneId = e.pathParameters.safeZoneId;
    const {
      childrenId,
      locationName,
      lat,
      long,
      radius,
      enableAlertIn,
      enableAlertOut
    } = JSON.parse(e.body || '{}');

  const safeZoneExist = Boolean(await SafeZoneModel.findById(safeZoneId));

  if (!safeZoneExist) {
    return error(`safeZoneId ${safeZoneId} doesn't exist.`);
  }

  if (childrenId) {
    const childExist = Boolean(await ChildModel.findById(childrenId));

    if (!childExist) {
      return error(`childrenId ${childrenId} doesn't exist.`);
    }
  }

  try {
    const newDataSafeZone = {
      childrenId,
      locationName,
      lat,
      long,
      radius,
      enableAlertIn,
      enableAlertOut
    };

    await SafeZoneModel.findOneAndUpdate(
      {
        _id: safeZoneId,
      },
      newDataSafeZone,
      {
        new: true,
        runValidators: true,
      }
    );

    return success({});
  } catch (e) {
    return error(e);
  }
});
