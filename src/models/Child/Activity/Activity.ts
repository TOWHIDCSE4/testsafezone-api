import { dateValidator } from '@/modules/core/validators';
import mongoose, { ObjectId, ProjectionFields, Schema } from 'mongoose';

export interface Activity {
  childId: ObjectId;
  deviceId: ObjectId;
  hardwareId?: string;
  activityId: ObjectId;
  activityMetadata?: Record<string, unknown>;
  activityTimeStart?: string;
  duration?: number;
  questionable?: boolean;
  // reportedDaily?: boolean;
  reportedAccessingToBlockedWebsitesOrApps?: boolean;
  notifyMobileAccessToBlockedWebOrApps?: boolean;
}

const activitySchema = new Schema(
  {
    childId: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'Child',
    },
    deviceId: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'Device',
    },
    activityId: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'IdentifiedActivity',
    },
    activityMetadata: Object,
    activityTimeStart: {
      validate: dateValidator,
      type: Date,
    },
    duration: Number,
    questionable: Boolean,
    // reportedDaily: Boolean,
    reportedAccessingToBlockedWebsitesOrApps: Boolean,
    notifyMobileAccessToBlockedWebOrApps: Boolean,
  },
  {
    timestamps: true,
  }
);

export const ActivityModel: mongoose.Model<Activity> =
  mongoose.models.Activity ||
  mongoose.model<Activity>('Activity', activitySchema);

export const defaultProjection: ProjectionFields<Activity> = {
  deviceId: 1,
  hardwareId: 1,
  activityId: 1,
  activityName: {
    $ifNull: [
      {
        $first: '$activity.activityName',
      },
      null,
    ],
  },
  activityType: {
    $ifNull: [
      {
        $first: '$activity.activityType',
      },
      null,
    ],
  },
  activityDisplayName: {
    $ifNull: [
      {
        $first: '$activity.activityDisplayName',
      },
      { $first: '$activity.activityName' },
    ],
  },
  activityIcon: {
    $ifNull: [
      {
        $first: '$activity.activityIcon',
      },
      null,
    ],
  },
  activityMetadata: 1,
  activityTimeStart: 1,
  duration: 1,
  questionable: 1,
  deviceName: {
    $ifNull: [
      {
        $first: '$device.name',
      },
      null,
    ],
  },
};
