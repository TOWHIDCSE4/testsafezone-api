import mongoose, { ObjectId, Schema } from 'mongoose';

export const DEVICES = ['SmartPhone', 'PC'] as const;
export const PLATFORM_LIST = ['iOS', 'Android', 'MacOS', 'Windows'] as const;

export interface Device {
  /**
   * Optional field. Used for performance purpose only, otherwise we should lookup by childrenId
   */
  userId?: string;
  lastSeen?: string;
  locationAddress?: string;
  locationLat?: number;
  locationLng?: number;
  name: string;
  type: typeof DEVICES[number];
  platform: typeof PLATFORM_LIST[number];
  hardwareId?: string;
  children: ObjectId[];
}

export const DeviceModel: mongoose.Model<Device> =
  mongoose.models.Device ||
  mongoose.model<Device>(
    'Device',
    new Schema(
      {
        userId: String,
        lastSeen: String,
        locationAddress: String,
        locationLat: Number,
        locationLng: Number,
        name: String,
        type: String,
        platform: String,
        children: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Child',
          },
        ],
        hardwareId: {
          type: String,
          index: true,
          unique: true,
        },
      },
      { timestamps: true }
    )
  );
