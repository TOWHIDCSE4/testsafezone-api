import mongoose, { Schema } from 'mongoose';
import { Gender } from '../Enums/Gender';
import { OnlineStatus } from '../Enums/OnlineStatus';

export enum EnumSupportSubject {
  Maths = 'maths',
  English = 'english',
  Vietnamese = 'vietnamese',
  Skill = 'skill',
}
export interface Child {
  parentId: string;
  fullname: string;
  gender: Gender;
  role: 'CHILDREN';
  status: OnlineStatus;
  real_name?: string;
  date_of_birth?: number;
  grade?: string;
  school?: string;
  address?: string;
  support_subject?: EnumSupportSubject[];
}

export const ChildModel: mongoose.Model<Child> =
  mongoose.models.Child ||
  mongoose.model<Child>(
    'Child',
    new Schema({
      parentId: {
        type: String,
        required: true,
        index: true,
      },
      fullname: String,
      gender: String,
      role: String,
      status: String,
      real_name: String,
      date_of_birth: Number,
      grade: String,
      school: String,
      address: String,
      support_subject: Array,
    })
  );
