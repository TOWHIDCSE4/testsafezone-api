import mongoose, { Schema } from 'mongoose';

export const activityTypes = [
  'WEB_SURF',
  'APP',
  'LOCATION',
  'YOUTUBE',
  'TIKTOK',
  'FACEBOOK',
] as const;

/**
 * Đây là activity đã được thẩm định, tránh việc trùng lặp icon/name
 */
export interface IdentifiedActivity {
  activityName: string;
  activityDisplayName: string;
  activityType: typeof activityTypes[number];
  activityIcon: string;
}

const schema = new Schema<IdentifiedActivity>(
  {
    activityName: {
      required: true,
      type: String,
    },
    activityDisplayName: {
      type: String,
      default() {
        return this.activityDisplayName || this.activityName;
      },
    },
    activityType: {
      required: true,
      type: String,
      enum: {
        values: activityTypes,
        message: '{VALUE} is not supported',
      },
    },
    activityIcon: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'identified_activities',
  }
).index(
  {
    activityName: 1,
    activityType: 1,
  },
  {
    unique: true,
  }
);

export const IdentifiedActivityModel: mongoose.Model<IdentifiedActivity> =
  mongoose.models.IdentifiedActivity ||
  mongoose.model<IdentifiedActivity>('IdentifiedActivity', schema);
