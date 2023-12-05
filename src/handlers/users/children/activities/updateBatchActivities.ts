import { ChildModel } from '@/models/Child';
import { ActivityModel } from '@/models/Child/Activity';
import {
  checkExpiredSubscription,
  createAuthorizedHandler,
  error,
  init,
  success,
} from '@/modules/core';

export const updateBatchActivities = createAuthorizedHandler(async (e) => {
  if (await checkExpiredSubscription(e)) {
    return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
  }

  await init();

  const childId = e.pathParameters.childId;

  const listActivity: Array<any> = JSON.parse(e.body || '[]');

  const childExist = Boolean(await ChildModel.findById(childId));
  if (!childExist)
    return error({
      message: `ChildId ${childId} doesn't exist.`,
    });

  try {
    const activitiesResult = [];
    for (const activityData of listActivity) {
      const {
        id,
        activityMetadata,
        activityTimeStart,
        duration,
        questionable,
      } = activityData;

      const newDataActivity = {
        childId,
        activityMetadata,
        activityTimeStart,
        duration,
        questionable,
      };

      // update to last same activity id
      const activity = await ActivityModel.findOneAndUpdate(
        {
          _id: id,
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
      activitiesResult.push(result);
    }

    return success({
      activities: activitiesResult,
    });
  } catch (e) {
    return error(e);
  }
});
