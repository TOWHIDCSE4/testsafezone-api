import { SubscriptionPlanModel } from '@/models/Subscription';
import { createAdminHandler, error, init, success } from '@/modules/core';

export const handler = createAdminHandler(async (e) => {
  try {
    await init();

    const planId = e.pathParameters.planId;
    const data = JSON.parse(e.body);

    await SubscriptionPlanModel.findOneAndUpdate(
      {
        _id: planId,
      },
      data,
      {
        runValidators: true,
      }
    );
    return success('ok');
  } catch (e) {
    return error(e);
  }
});
