import mongoose, { Schema, Document } from 'mongoose';
export enum EnumNotificationType {
  ACCESS_BLOCK_CONTENT = 1,
}

export interface Notifications extends Document {
  user_id: string;
  title?: string;
  short_content?: string;
  full_content?: string;
  is_seen?: boolean;
  meta_data?: string;
  type?: EnumNotificationType;
}

const NotificationsSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    title: String,
    short_content: String,
    full_content: String,
    is_seen: {
      type: Boolean,
      default: false,
    },
    meta_data: String,
    type: {
      type: Number,
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

export const NotificationsModel: mongoose.Model<Notifications> =
  mongoose.models.Notifications ||
  mongoose.model<Notifications>('Notifications', NotificationsSchema);
