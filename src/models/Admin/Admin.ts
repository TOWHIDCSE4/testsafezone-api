import mongoose, { Schema, Document } from 'mongoose';
import { EnumGender } from './constants';
import bcrypt from 'bcryptjs';

const SALT: number = 10;

export interface Admin extends Document {
  username: string;
  email: string;
  phone?: string;
  password: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar?: string;
  gender?: EnumGender;
  birthday?: Date;
  status?: number;
  comparePassword: (password: string) => Promise<boolean>;
}

const AdminSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    first_name: {
      type: String,
      trim: true,
      default: '',
    },
    last_name: {
      type: String,
      trim: true,
      default: '',
    },
    full_name: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: Number,
      enum: [0, 1, 2], //0: other, 1: male, 2: female
      default: 0,
    },
    birthday: {
      type: Date,
    },
    status: {
      type: Number,
    },
  },
  {
    timestamps: true,
    collection: 'admins',
  }
);

AdminSchema.pre<Admin>('save', function (next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// @ts-ignore
AdminSchema.methods.comparePassword = function (
  this: Admin,
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const AdminModel: mongoose.Model<Admin> =
  mongoose.models.Admin || mongoose.model<Admin>('Admin', AdminSchema);
