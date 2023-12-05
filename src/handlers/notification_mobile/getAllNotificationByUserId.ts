import NotificationActions from '@/actions/notifications';
import { createHandler, error, init, success } from '@/modules/core';

export const getAllNotificationByUserId = createHandler(async (event) => {
  try {
    const userId = event.pathParameters?.user_id;
    const is_seen: any = event.queryStringParameters?.is_seen || null;
    const pageNumber = parseInt(event.queryStringParameters?.page_number as string) || 1;
    const pageSize = parseInt(event.queryStringParameters?.page_size as string) || 20;

    await init();
    const filter: any = {
      user_id: userId,
      page_number: pageNumber,
      page_size: pageSize

    }
    if(is_seen === true || is_seen === false){
      filter.is_seen = is_seen
    }
    const dataNotify = await NotificationActions.findAllAndPaginated(filter);;
    const count = await NotificationActions.count(filter);;
    const res_payload = {
      data: dataNotify,
      pagination: {
        total: count,
      },
    };
    return success({
      code: '10000',
      data: res_payload,
      message: 'Success',
    });
  } catch (e) {
    return error(e);
  }
});