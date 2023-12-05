import NotificationActions from '@/actions/notifications';
import { createHandler, error, init, success } from '@/modules/core';

export const getCountNotificationUnseen = createHandler(async (event) => {
  try {
    const userId = event.pathParameters?.user_id;

    await init();
    const filter: any = {
      user_id: userId,
      is_seen: false
    }
    const data = await NotificationActions.count(filter);

    return success({
      data: data,
    });
  } catch (e) {
    return error(e);
  }
});