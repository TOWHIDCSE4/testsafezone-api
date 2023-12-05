// import { subscribeTopic } from '@/service/firebase';
import { FirebaseCloudMessagingModel } from '@/models/FirebaseCloudMessaging';
import {
  SERVER_TYPE,
  createHandler,
  error,
  init,
  success,
} from '@/modules/core';
import { subscribeTopic } from '@/service/firebase';

export const registerFCMToken = createHandler(async (event) => {
  try {
    const { user_id, device_id, fcm_token, device_os } = JSON.parse(event.body);
    await init();
    const checkToken = await FirebaseCloudMessagingModel.findOne({
      device_id
    });
    let data = null;
    if (!checkToken) {
      const dataNew = {
        user_id,
        device_id,
        fcm_token,
        device_os,
      };
      data = await FirebaseCloudMessagingModel.create(dataNew);
      if (fcm_token) {
        const registrationTokens = [fcm_token];
        const topicName = `${SERVER_TYPE}.parent.safezone.user_${user_id}`;
        await subscribeTopic(registrationTokens, topicName);
      }
    }else if(fcm_token && fcm_token != checkToken?.fcm_token) {
      data = await FirebaseCloudMessagingModel.findOneAndUpdate(
        {
          _id: checkToken._id,
        },
        {
          $set: {
            fcm_token,
          },
        },
        {
          upsert: false,
        }
      );
      const registrationTokens = [fcm_token];
      const topicName = `${SERVER_TYPE}.parent.safezone.user_${user_id}`;
      await subscribeTopic(registrationTokens, topicName);
    }
    return success({
      data: data,
    });
  } catch (e) {
    return error(e);
  }
});
