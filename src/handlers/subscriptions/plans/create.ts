import { error, success, init, createAdminHandler } from '@/modules/core';
import { SubscriptionPlanModel } from '@/models/Subscription';

export const handler = createAdminHandler(async (event) => {
  try {
    await init();

    const {
      name,
      totalUseDays,
      limitFeatures,
      totalDevices,
      yearlyPrice,
      monthlyPrice,
    } = JSON.parse(event.body || '{}');

    const newSubscription = new SubscriptionPlanModel({
      name,
      totalUseDays,
      limitFeatures,
      totalDevices,
      yearlyPrice,
      monthlyPrice,
    });

    const result = await newSubscription.save();

    return success({ result: result });
  } catch (e) {
    return error({
      message: String(e),
    });
  }
});
