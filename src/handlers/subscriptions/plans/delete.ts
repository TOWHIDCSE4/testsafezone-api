import { SubscriptionPlanModel } from '@/models/Subscription';
import { createAdminHandler, error, init, success } from '@/modules/core';

export const handler = createAdminHandler(async (e) => {
  try {
    await init();

    const planId = e.pathParameters.planId;

    await SubscriptionPlanModel.findByIdAndDelete(planId);
    return success('ok');
  } catch (e) {
    return error(e);
  }
});
