import {
  SubscriptionModel,
  // SubscriptionPlanModel,
} from '@/models/Subscription';
import {
  createAuthorizedHandler,
  getUserIdFromEvent,
  init,
  success,
} from '@/modules/core';

export const handler = createAuthorizedHandler(async (e) => {
  await init();

  const userId = getUserIdFromEvent(e);

  let subscription = await SubscriptionModel.findOne({
    user: userId,
  }).populate('plan');

  // if (!subscription) {
  //   const freePlan = await SubscriptionPlanModel.findOne({
  //     code: 'FR22',
  //   });

  //   if (!freePlan) throw Error('Please create a free plan!');

  //   subscription = await SubscriptionModel.create({
  //     active: false,
  //     user: getUserIdFromEvent(e),
  //     canceledAt: undefined,
  //     endDate: undefined,
  //     startDate: undefined,
  //     subscriptionPeriod: 'YEARLY',
  //     plan: freePlan,
  //   });
  // }

  const currentDate = new Date();

  if (subscription.canceledAt && subscription.canceledAt > currentDate) {
    subscription.active = false;
    await subscription.save();
  }

  return success({
    result: subscription || {},
  });
});
