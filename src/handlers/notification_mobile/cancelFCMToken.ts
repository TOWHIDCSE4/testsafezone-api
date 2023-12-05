import { unsubscribeTopic } from '@/service/firebase';
import { FirebaseCloudMessagingModel } from '@/models/FirebaseCloudMessaging';
import {
  SERVER_TYPE,
  createHandler,
  error,
  init,
  success,
} from '@/modules/core';

export const cancelFCMToken = createHandler(async (event) => {
  try {
    const { user_id, fcm_token, device_id } = JSON.parse(event.body);

    await init();
    const checkToken = await FirebaseCloudMessagingModel.findOne({
      device_id
    });
    if (fcm_token && checkToken) {
      const registrationTokens = [fcm_token];
      const topicName = `${SERVER_TYPE}.parent.safezone.user_${user_id}`;
      await unsubscribeTopic(registrationTokens, topicName);
      await FirebaseCloudMessagingModel.deleteOne({_id: checkToken._id});
    }
    return success({
      data: true,
    });
  } catch (e) {
    return error(e);
  }
});
