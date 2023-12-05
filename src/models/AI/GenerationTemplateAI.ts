import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export enum EnumTGenAIStatus {
  ALL = '',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface GenerationTemplateAI extends Document {
  title: string;
  content: string;
  category_obj_id?: ObjectId;
  subject_obj_id?: ObjectId;
  age?: number;
  rank_obj_id?: ObjectId;
  prompt_obj_id?: ObjectId;
  params?: any;
  is_active: boolean;
  job_is_active?: boolean;
  job_frequency?: number;
  last_time_run_job?: number;
}

const GenerationTemplateAISchema = new Schema(
  {
    title: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    content: {
      type: String,
      required: true
    },
    category_obj_id: {
      type: Schema.Types.ObjectId,
      ref: 'category',
      index: true
    },
    subject_obj_id: {
      type: Schema.Types.ObjectId,
      ref: 'subject',
      index: true
    },
    age: {
      type: Number,
      index: true
    },
    rank_obj_id: {
      type: Schema.Types.ObjectId,
      ref: 'rank',
      index: true
    },
    prompt_obj_id: {
      type: Schema.Types.ObjectId,
      ref: 'prompt',
      index: true
    },
    params: {
      type: Object
    },
    is_active: {
      type: Boolean,
      index: true,
      required: true,
      default: false,
    },
    job_is_active: {
      type: Boolean,
      index: true,
      required: true,
      default: false,
    },
    job_frequency: {
      type: Number,
      index: true
    },
    last_time_run_job: {
      type: Number,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'generation-template-AI',
  }
);

export const GenerationTemplateAIModel: mongoose.Model<GenerationTemplateAI> =
  mongoose.models.GenerationTemplateAI ||
  mongoose.model<GenerationTemplateAI>('GenerationTemplateAI', GenerationTemplateAISchema);
