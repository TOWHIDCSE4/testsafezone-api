import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import './PromptParamAI';

export enum EnumPromptAIStatus {
  ALL = '',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface PromptAI extends Document {
  is_active: boolean;
  title: string;
  category_obj_id?: ObjectId;
  category?: ObjectId;
  description?: string;
  prompt: string;
}

const PromptAISchema = new Schema(
  {
    is_active: {
      type: Boolean,
      index: true,
      required: true,
      default: true,
    },
    title: {
      type: String,
      index: true,
      required: true,
    },
    category_obj_id: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'PromptParamAI',
    },
    description: {
      type: String,
    },
    prompt: {
      type: String,
      index: true,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'prompt-AI',
  }
);

export const PromptAIModel: mongoose.Model<PromptAI> =
  mongoose.models.PromptAI ||
  mongoose.model<PromptAI>('PromptAI', PromptAISchema);
