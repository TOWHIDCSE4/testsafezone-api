import {
  defaultRestrictedTimeRule,
  RestrictedTimeRuleModel,
} from '@/models/Rule';
import {
  checkExpiredSubscription,
  createAuthorizedHandler,
  error,
  init,
  success,
} from '@/modules/core';
import { isObjectIdValid } from '@/modules/core/validators';

export const getRestrictedTimeRules = createAuthorizedHandler(async (e) => {
  try {
    if (await checkExpiredSubscription(e)) {
      return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
    }

    const childId = e.pathParameters?.childId;

    // TODO: Check if current parent is actually the parent of this childId
    if (!isObjectIdValid(childId)) return error('Invalid childId');

    await init();
    const rule = await RestrictedTimeRuleModel.findOne({
      childId,
    });

    if (!rule) {
      const newRule = await RestrictedTimeRuleModel.create({
        ...defaultRestrictedTimeRule,
        childId: childId,
      });
      return success({
        rule: newRule,
      });
    }

    return success({
      rule,
    });
  } catch (e) {
    return error(e);
  }
});
