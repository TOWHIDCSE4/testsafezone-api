import {
  WebFilteringRule,
  WebFilteringRuleModel,
} from '@/models/Rule/WebFilteringRule';
import {
  checkExpiredSubscription,
  createAuthorizedHandler,
  error,
  init,
  success,
} from '@/modules/core';
import { isObjectIdValid } from '@/modules/core/validators';

export const updateWebFilteringRules = createAuthorizedHandler(async (e) => {
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

    const updateObj: WebFilteringRule = {
      ...cleanedData,
    };

    await WebFilteringRuleModel.findOneAndUpdate(
      {
        childId,
      },
      updateObj,
      {
        new: true,
        upsert: true,
      }
    );
    return success('ok');
  } catch (e) {
    return error(e);
  }
});
