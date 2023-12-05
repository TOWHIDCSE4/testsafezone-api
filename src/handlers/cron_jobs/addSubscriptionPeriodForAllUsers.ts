import { createHandler, success, error, init } from '@/modules/core';
import { SubscriptionModel } from '@/models/Subscription';
import dayjs from 'dayjs';

export const addSubscriptionPeriodForAllUsers = createHandler(async () => {
  try {
    await init();
    const startDate = dayjs();
    const endDate = startDate.clone().add(1, 'year');
    await SubscriptionModel.updateMany(
      {
        startDate: { $exists: false },
        endDate: { $exists: false },
      },
      {
        $set: {
          startDate: startDate.toDate(),
          endDate: endDate.toDate(),
        },
      },
      {
        upsert: false,
      }
    );

    return success(null);
  } catch (e) {
    return error(e);
  }
});
