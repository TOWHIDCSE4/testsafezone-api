import { ActivityControlRuleModel } from '@/models/Rule/ActivityControlRule';
import {
  checkExpiredSubscription,
  createAuthorizedHandler,
  error,
  init,
  success,
} from '@/modules/core';
import { isObjectIdValid } from '@/modules/core/validators';

export const getActivityControlRules = createAuthorizedHandler(async (e) => {
  try {
    if (await checkExpiredSubscription(e)) {
      return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
    }

    const childId = e.pathParameters?.childId;

    // TODO: Check if current parent is actually the parent of this childId
    if (!isObjectIdValid(childId)) return error('Invalid childId');

    await init();

    const rules = await ActivityControlRuleModel.find({
      childId,
    }).populate('activity');

    if (!rules) {
      return success({
        rules: [],
      });
    }

    return success({
      rules,
    });
  } catch (e) {
    return error(e);
  }
});
