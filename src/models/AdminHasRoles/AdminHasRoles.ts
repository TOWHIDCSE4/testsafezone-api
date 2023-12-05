import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface AdminHasRoles extends Document {
  role_id: ObjectId;
  admin_id: ObjectId;
}

const AdminHasRolesSchema = new Schema(
  {
    role_id: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
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
    collection: 'admin_has_roles',
  }
);

export const AdminHasRolesModel: mongoose.Model<AdminHasRoles> =
  mongoose.models.AdminHasRoles ||
  mongoose.model<AdminHasRoles>('AdminHasRoles', AdminHasRolesSchema);
