import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface GenerationResultAI extends Document {
  template_obj_id?: ObjectId;
  title?: string;
  content: string;
}

const GenerationResultAISchema = new Schema(
  {
    template_obj_id: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    title: {
      type: String
    },
    content: {
      type: String,
      require: true
    },
  },
  {
    timestamps: true,
    collection: 'generation-result-AI',
  }
);

export const GenerationResultAIModel: mongoose.Model<GenerationResultAI> =
  mongoose.models.GenerationResultAI ||
  mongoose.model<GenerationResultAI>('GenerationResultAI', GenerationResultAISchema);
