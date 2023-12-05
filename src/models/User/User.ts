import mongoose, { ObjectId, Schema } from 'mongoose';
import './Group';

export interface UserRole {
  [key: string]: any;
}

export enum EnumTypeAccount {
  Family = 1,
  School = 2
}

export interface User {
  _id: string;
  lang: string;
  username: string;
  displayName: string;
  phoneNumber: string;
  email: string;
  avatar: string;
  group?: ObjectId;
  active: boolean;
  type?: EnumTypeAccount;
}

export const UserModel: mongoose.Model<User> =
  mongoose.models.User ||
  mongoose.model<User>(
    'User',
    new Schema(
      {
        _id: {
          type: String,
        },
        lang: String,
        username: String,
        displayName: String,
        phoneNumber: String,
        email: String,
        avatar: String,
        group: {
          type: Schema.Types.ObjectId,
          ref: 'UserGroup',
        },
        active: {
          type: Boolean,
          default: true,
        },
        type: {
          type: Number,
          default: EnumTypeAccount.Family,
        }
      },
      {
        _id: false,
      }
    )
  );
