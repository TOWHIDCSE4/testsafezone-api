import { WebFilteringRuleModel } from '@/models/Rule/WebFilteringRule';
import {
  checkExpiredSubscription,
  createHandler,
  error,
  init,
  success,
} from '@/modules/core';
import { isObjectIdValid } from '@/modules/core/validators';

export const getWebFilteringRules = createHandler(async (e) => {
  await init();

  try {
    if (await checkExpiredSubscription(e)) {
      return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
    }

    const childId = e.pathParameters?.childId;

    if (!isObjectIdValid(childId)) {
      return error('Invalid childId');
    }

    const rule = await WebFilteringRuleModel.findOne({
      childId,
    });

    if (!rule) {
      const newRule = await new WebFilteringRuleModel({
        childId,
        enabled: true,
      }).save();

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
