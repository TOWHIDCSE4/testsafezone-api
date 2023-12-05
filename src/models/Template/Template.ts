import mongoose, { Schema, Document } from 'mongoose';

export enum EnumTemplateType {
  EMAIL = 1,
}

export interface Template extends Document {
  title: string;
  content: string;
  type: number;
  code: string;
}

export enum EmailTemplate {
  DAILY_REPORT = 'EMAIL.DAILY_REPORT',
  REPORT_ACCESS_TO_BLOCKED_WEBSITES_OR_APPS = 'EMAIL.REPORT_ACCESS_TO_BLOCKED_WEBSITES_OR_APPS',
}

const TemplateSchema = new Schema(
  {
    title: {
      type: String,
      index: true,
      trim: true,
    },
    content: {
      type: String,
      index: true,
      required: true,
      trim: true,
    },
    type: {
      type: Number,
      index: true,
      required: true,
    },
    code: {
      type: String,
      index: true,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'templates',
  }
);

export const TemplateModel: mongoose.Model<Template> =
  mongoose.models.Template ||
  mongoose.model<Template>('Template', TemplateSchema);
