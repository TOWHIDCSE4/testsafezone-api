import { IdentifiedActivityModel } from '@/models/Child/Activity/IdentifiedActivity';
import { ActivityControlRuleModel } from '@/models/Rule/ActivityControlRule';
import {
  checkExpiredSubscription,
  createAuthorizedHandler,
  error,
  init,
  success,
} from '@/modules/core';
import { isObjectIdValid } from '@/modules/core/validators';

export const addActivityControlRules = createAuthorizedHandler(async (e) => {
  try {
    if (await checkExpiredSubscription(e)) {
      return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
    }

    await init();

    const childId = e.pathParameters.childId;

    if (!isObjectIdValid(childId)) return error('Invalid ChildId');

    const data = JSON.parse(e.body || '{}');
    const { activityId, action } = data;

    if (!activityId) return error('ActivityId is required');

    const identifiedActivity = await IdentifiedActivityModel.findOne({
      _id: activityId,
    });

    if (!identifiedActivity) return error('Activity does not exist.');

    await ActivityControlRuleModel.findOneAndUpdate(
      { childId, activityId: identifiedActivity.id },
      {
        action,
      },
      {
        upsert: true,
      }
    );
    return success({});
  } catch (e) {
    return error(e);
  }
});
