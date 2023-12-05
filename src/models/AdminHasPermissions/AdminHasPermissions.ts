import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface AdminHasPermissions extends Document {
  permission_id: ObjectId;
  admin_id: ObjectId;
}

const AdminHasPermissionsSchema = new Schema(
  {
    permission_id: {
      type: Schema.Types.ObjectId,
      ref: 'Permission',
      index: true,
    },
    admin_id: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'admin_has_permissions',
  }
);

export const AdminHasPermissionsModel: mongoose.Model<AdminHasPermissions> =
  mongoose.models.AdminHasPermissions ||
  mongoose.model<AdminHasPermissions>(
    'AdminHasPermissions',
    AdminHasPermissionsSchema
  );
