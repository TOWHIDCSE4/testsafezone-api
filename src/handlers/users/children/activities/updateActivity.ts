import { ChildModel } from '@/models/Child';
import { ActivityModel } from '@/models/Child/Activity';
import { IdentifiedActivityModel } from '@/models/Child/Activity/IdentifiedActivity';
import { DeviceModel } from '@/models/Device';
import {
  checkExpiredSubscription,
  createAuthorizedHandler,
  error,
  init,
  success,
} from '@/modules/core';

export const updateActivity = createAuthorizedHandler(async (e) => {
  if (await checkExpiredSubscription(e)) {
    return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
  }

  await init();

  const childId = e.pathParameters.childId;
  const activityId = e.pathParameters.activityId;

  const {
    deviceId,
    hardwareId = '',
    activityName,
    activityType,
    activityMetadata = {},
    activityTimeStart = new Date().toISOString(),
    duration,
    questionable = false,
  } = JSON.parse(e.body || '{}');

  const deviceExist = Boolean(await DeviceModel.findById(deviceId));

  if (!deviceExist)
    return error({
      message: `DeviceID ${deviceId} doesn't exist.`,
    });

  const childExist = Boolean(await ChildModel.findById(childId));

  if (!childExist)
    return error({
      message: `ChildId ${deviceId} doesn't exist.`,
    });

  try {
    let maybeIdentifiedActivity = await IdentifiedActivityModel.findOne({
      activityName,
      activityType,
    });

    if (!maybeIdentifiedActivity)
      return error({
        message: `Activity not created.`,
      });

    const newDataActivity = {
      childId,
      deviceId,
      hardwareId,
      activityId: maybeIdentifiedActivity,
      activityMetadata,
      activityTimeStart,
      duration,
      questionable,
    };
    // update to last same activity id
    const activity = await ActivityModel.findOneAndUpdate(
      {
        _id: activityId,
      },
      newDataActivity,
      {
        new: true,
        runValidators: true,
      }
    );

    const result = activity.toJSON();
    (result as any).identifiedActivity = result.activityId;
    delete result.activityId;

    return success({
      activity: result,
    });
  } catch (e) {
    return error(e);
  }
});
