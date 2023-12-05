import mongoose, { ObjectId, Schema } from 'mongoose';

export interface SafeZone {
  childrenId: ObjectId;
  locationName?: string;
  lat?: number;
  long?: number;
  radius?: number;
  enableAlertIn?: boolean;
  enableAlertOut?: boolean;
}

const schema = new Schema<SafeZone>(
  {
    childrenId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Child',
    },
    locationName: {
      type: String,
      trim: true,
    },
    lat: {
      type: Number,
    },
    long: {
      type: Number,
    },
    radius: {
      type: Number,
    },
    enableAlertIn: {
      type: Boolean,
      default: true,
    },
    enableAlertOut: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'safezone',
  }
);

export const SafeZoneModel: mongoose.Model<SafeZone> =
  mongoose.models.SafeZone ||
  mongoose.model<SafeZone>('SafeZone', schema);
