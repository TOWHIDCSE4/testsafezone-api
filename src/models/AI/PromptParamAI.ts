import mongoose, { Schema, Document } from 'mongoose';

export enum EnumPromptParamAIStatus {
  ALL = '',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum EnumTypeParamAIStatus {
  CATEGORY = 1,
  SUBJECT = 2,
  RANK = 3,
}

export interface PromptParamAI extends Document {
  title: string;
  type?: EnumTypeParamAIStatus;
  description?: string;
  is_active: boolean;
}

const PromptParamAISchema = new Schema(
  {
    title: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    type: {
      type: Number,
      index: true,
      required: true,
      default: EnumTypeParamAIStatus.CATEGORY,
    },
    description: {
      type: String
    },
    is_active: {
      type: Boolean,
      index: true,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'prompt-param-AI',
  }
);

export const PromptParamAIModel: mongoose.Model<PromptParamAI> =
  mongoose.models.PromptParamAI ||
  mongoose.model<PromptParamAI>('PromptParamAI', PromptParamAISchema);
