import mongoose, { Schema, Document } from 'mongoose';

export interface FirebaseCloudMessaging extends Document {
  user_id: string;
  device_id: string;
  fcm_token: string;
  device_os?: string;
}

const FirebaseCloudMessagingSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    device_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fcm_token: {
      type: String,
      required: true,
      index: true,
    },
    device_os: {
      type: String,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'firebase_cloud_messaging',
  }
);

export const FirebaseCloudMessagingModel: mongoose.Model<FirebaseCloudMessaging> =
  mongoose.models.FirebaseCloudMessaging ||
  mongoose.model<FirebaseCloudMessaging>(
    'FirebaseCloudMessaging',
    FirebaseCloudMessagingSchema
  );
