import mongoose, { Schema, Document } from 'mongoose';

export interface Role extends Document {
  name: string;
}

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'roles',
  }
);

export const RoleModel: mongoose.Model<Role> =
  mongoose.models.Role || mongoose.model<Role>('Role', RoleSchema);
