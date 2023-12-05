import mongoose, { Schema, Document } from 'mongoose';

export interface Permission extends Document {
  module: string;
  permission_name: string;
  permission_code: string;
}

const PermissionSchema = new Schema(
  {
    module: {
      type: String,
      index: true,
      required: true,
      trim: true,
    },
    permission_name: {
      type: String,
      index: true,
      required: true,
      trim: true,
    },
    permission_code: {
      type: String,
      index: true,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'permissions',
  }
);

export const PermissionModel: mongoose.Model<Permission> =
  mongoose.models.Permission ||
  mongoose.model<Permission>('Permission', PermissionSchema);
