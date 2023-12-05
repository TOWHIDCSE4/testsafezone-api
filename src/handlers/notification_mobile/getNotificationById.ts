import { NotificationsModel } from '@/models/Notifications';
import { createHandler, error, init, success } from '@/modules/core';

export const getNotificationById = createHandler(async (event) => {
  try {
    const idNotification = event.pathParameters?.id;

    await init();
    const data = await NotificationsModel.findById(idNotification);

    return success({
      data: data,
    });
  } catch (e) {
    return error(e);
  }
});
