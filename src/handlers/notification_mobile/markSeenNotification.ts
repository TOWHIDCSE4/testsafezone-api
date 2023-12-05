import { NotificationsModel } from '@/models/Notifications';
import { createHandler, error, init, success } from '@/modules/core';

export const markSeenNotification = createHandler(async (event) => {
  try {
    const { ids } = JSON.parse(event.body);

    await init();
    let data = null;
    if(ids && ids.length > 0){
      data = await NotificationsModel.updateMany(
        {
          _id: {
            $in: ids,
          },
          is_seen: false
        },
        {
          $set: {
            is_seen: true
          }
        },
        {
          upsert: false,
        }
      );
    }
    return success({
      data: data,
    });
  } catch (e) {
    return error(e);
  }
});