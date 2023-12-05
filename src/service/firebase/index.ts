import { getApps } from 'firebase-admin/app';
const admin = require('firebase-admin');

const serviceAccount = require('../firebase/fcm_key/safezone-a0eec-firebase-adminsdk-mo3o5-365fe6f0a4.json');
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
export interface IPushNotification {
  notification: {
    title: string;
    body: string;
  }; 
}

export const sendMessageToTopic = async (
  topic: string,
  message: IPushNotification
) => {
  console.log('start sent message to topic:', topic);
  await admin.messaging()
    .sendToTopic(topic, message)
    .then((response2: any) => {
      console.log('Info sent message to topic:', response2);
      return true;
    })
    .catch((error: any) => {
      console.log('Error sending message to topic:', error);
      return false;
    });
};

export const subscribeTopic = async (arrayToken: any, topic: string) => {
  console.log('Start subscribed to topic >>>>>>');
  console.log(arrayToken);
  try {
    await admin.messaging()
      .subscribeToTopic(arrayToken, topic)
      .then((response: any) => {
        console.log('Info subscribed to topic:', response);
        if (response.failureCount > 0) {
          console.log(
            'Error res subscribing to topic:',
            response.errors[0].error
          );
          return false;
        }
        console.log('End subscribed to topic <<<<<');
        return true;
      })
      .catch((error: any) => {
        console.log('Error subscribing to topic:', error);
        return false;
      });
  } catch (e) {
    console.log('Error subscribing to topic:', e);
    return false;
  }
};

export const unsubscribeTopic = async (arrayToken: any, topic: string) => {
  console.log('Start unsubscribed to topic >>>>>>');
  await admin.messaging()
    .unsubscribeFromTopic(arrayToken, topic)
    .then((response: any) => {
      console.log('Successfully unsubscribed to topic:', response);
      if (response.failureCount > 0) {
        console.log(
          'Error res unsubscribed to topic:',
          response.errors[0].error
        );
        return false;
      }
      console.log('End unsubscribed to topic <<<<<');
      return true;
    })
    .catch((error: any) => {
      console.log('Error unsubscribing to topic:', error);
      return false;
    });
};
