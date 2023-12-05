import { createHandler, success, error, init } from '@/modules/core';
import { SubscriptionModel } from '@/models/Subscription';
import dayjs from 'dayjs';

export const convertStartDateAndEndDateColumnFromStringToDateOfTableSubscriptions =
  createHandler(async () => {
    try {
      await init();
      const subscriptions = await SubscriptionModel.find({
        startDate: { $exists: true },
        endDate: { $exists: true },
      });
      for (const subscription of subscriptions) {
        await SubscriptionModel.findOneAndUpdate(
          {
            _id: subscription._id,
          },
          {
            startDate: dayjs(subscription.startDate).toDate(),
            endDate: dayjs(subscription.endDate).toDate(),
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }

      return success(null);
    } catch (e) {
      return error(e);
    }
  });
