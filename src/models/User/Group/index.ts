import mongoose, { Schema } from 'mongoose';

export interface UserRole {
  [key: string]: any;
}

export interface UserGroup {
  name: string;
  roles: UserRole[];
  description: string;
  isDefault: boolean;
  isAdmin: boolean;
}

export const UserGroupModel: mongoose.Model<UserGroup> =
  mongoose.models.UserGroup ||
  mongoose.model<UserGroup>(
    'UserGroup',
    new Schema(
      {
        roles: [
          {
            type: [Schema.Types.ObjectId],
            default: [],
          },
        ],
        name: {
          type: String,
          required: true,
        },
        description: String,
        isDefault: {
          type: Boolean,
          default: false,
          index: true,
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
      },
      {
        collection: 'user_groups',
      }
    )
  );
