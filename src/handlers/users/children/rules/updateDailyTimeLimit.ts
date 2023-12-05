import {
  DailyTimeLimitRule,
  DailyTimeLimitRuleModel,
  defaultDailyTimeLimitRule,
} from '@/models/Rule';
import {
  checkExpiredSubscription,
  createAuthorizedHandler,
  error,
  init,
  success,
} from '@/modules/core';
import { isObjectIdValid } from '@/modules/core/validators';

export const updateDailyTimeLimit = createAuthorizedHandler(async (e) => {
  try {
    if (await checkExpiredSubscription(e)) {
      return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
    }

    await init();

    const childId = e.pathParameters.childId;

    if (!isObjectIdValid(childId)) return error('Invalid ChildId');

    const data = JSON.parse(e.body);

    // Remove some fields from the JSON data to prevent editing.
    const { _id, id, childId: _childId, ...cleanedData } = data;

    const updateObj: DailyTimeLimitRule = {
      ...defaultDailyTimeLimitRule,
      ...cleanedData,
    };

    await DailyTimeLimitRuleModel.findOneAndUpdate(
      {
        childId,
      },
      updateObj,
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );
    return success('ok');
  } catch (e) {
    return error(e);
  }
});
