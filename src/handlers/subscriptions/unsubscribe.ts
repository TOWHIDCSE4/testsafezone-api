import {
  error,
  success,
  init,
  createAuthorizedHandler,
  getUserIdFromEvent,
} from '@/modules/core';
import { SubscriptionModel, SubscriptionPlan } from '@/models/Subscription';

export const handler = createAuthorizedHandler(async (event) => {
  try {
    await init();
    const userId = getUserIdFromEvent(event);

    const currentSubscription = await SubscriptionModel.findOne({
      user: userId,
    }).populate('plan');

    const currentPlan = currentSubscription.plan as any as SubscriptionPlan;

    if (currentPlan.isFree) {
      return error('You cannot unsubscribe a free plan');
    }

    if (currentSubscription.canceledAt) {
      currentSubscription.canceledAt = undefined;
    } else {
      currentSubscription.canceledAt = new Date();
    }
    return success({ result: currentSubscription });
  } catch (e) {
    return error({
      message: String(e),
    });
  }
});
