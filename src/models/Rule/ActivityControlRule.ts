import mongoose, { ObjectId, Schema } from 'mongoose';

const actionTypes = ['ALLOW', 'BLOCK'];

export interface ActivityControlRule {
  activityId: ObjectId;
  childId: ObjectId;
  action: typeof actionTypes[number];
  description?: string;
}

const schema = new Schema<ActivityControlRule>(
  {
    childId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Child',
    },
    activityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    description: String,
  },
  {
    timestamps: true,
    collection: 'activity_control_rules',
  }
);

schema.virtual('activity', {
  ref: 'IdentifiedActivity',
  localField: 'activityId',
  foreignField: '_id',
  justOne: true,
});

export const ActivityControlRuleModel: mongoose.Model<ActivityControlRule> =
  mongoose.models.ActivityControlRule ||
  mongoose.model<ActivityControlRule>('ActivityControlRule', schema);
