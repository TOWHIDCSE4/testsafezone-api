import mongoose, { Schema } from 'mongoose';

interface WebCategory {
  id: number;
  name: string;
  description: string;
}

export const WebCategoryModel: mongoose.Model<WebCategory> =
  mongoose.models.WebCategory ||
  mongoose.model<WebCategory>(
    'WebCategory',
    new Schema(
      {
        _id: Number,
        name: String,
        description: String,
      },
      {
        _id: false,
        timestamps: true,
        collection: 'web_categories',
      }
    )
  );
