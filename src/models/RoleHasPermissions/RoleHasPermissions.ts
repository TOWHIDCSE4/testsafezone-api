import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface RoleHasPermissions extends Document {
  permission_id: ObjectId;
  role_id: ObjectId;
}

const RoleHasPermissionsSchema = new Schema(
  {
    permission_id: {
      type: Schema.Types.ObjectId,
      ref: 'Permission',
      index: true,
    },
    role_id: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'role_has_permissions',
  }
);

export const RoleHasPermissionsModel: mongoose.Model<RoleHasPermissions> =
  mongoose.models.RoleHasPermissions ||
  mongoose.model<RoleHasPermissions>(
    'RoleHasPermissions',
    RoleHasPermissionsSchema
  );
