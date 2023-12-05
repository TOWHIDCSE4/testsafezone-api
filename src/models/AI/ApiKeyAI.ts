import mongoose, { Schema, Document } from 'mongoose';

export enum apiKeyType {
  openAPI = 1,
}

export enum EnumApiKeyAIStatus {
  ALL = '',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface ApiKeyAI extends Document {
  title: string;
  is_active: boolean;
  api_key: string;
  type: number;
  balance?: number;
  msg_error?: string;
  last_used_time: number;
}

const ApiKeyAISchema = new Schema(
  {
    title: {
      type: String,
      index: true,
      required: true,
    },
    type: {
      type: Number,
      index: true,
      required: true,
      default: apiKeyType.openAPI,
    },
    is_active: {
      type: Boolean,
      index: true,
      required: true,
      default: true,
    },
    api_key: {
      type: String,
      index: true,
      required: true,
    },
    balance: {
      type: Number,
      index: true,
      required: true,
      default: 0,
    },
    msg_error: {
      type: String,
    },
    last_used_time: {
      type: Number,
      index: true,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'api-key-AI',
  }
);

export const ApiKeyAIModel: mongoose.Model<ApiKeyAI> =
  mongoose.models.ApiKeyAI ||
  mongoose.model<ApiKeyAI>('ApiKeyAI', ApiKeyAISchema);
