import mongoose, { Schema, ObjectId } from 'mongoose';

import '@/models/Order';
import '@/models/User';
import './SubscriptionPlan';
import dayjs from 'dayjs';

const SUBSCRIPTION_PERIODS = ['6_MONTH', 'YEARLY'] as const;

export interface Subscription {
  plan: ObjectId;
  user: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
  associatedOrder: ObjectId;
  canceledAt: Date;
  subscriptionPeriod: (typeof SUBSCRIPTION_PERIODS)[number];
  deletedAt?: Date;
}

const schema = new Schema({
  plan: {
    type: Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    index: true,
  },
  user: {
    type: Schema.Types.String,
    ref: 'User',
    index: true,
    unique: true,
  },
  startDate: Date,
  endDate: Date,
  canceledAt: Date,
  active: Boolean,
  subscriptionPeriod: {
    type: String,
    enum: {
      values: SUBSCRIPTION_PERIODS,
      message: 'Period {VALUE} is not supported',
    },
  },
  associatedOrder: [
    {
      type: String,
      ref: 'Order',
    },
  ],
  deletedAt: Date,
});

schema.pre('find', function () {
  this.where({ deletedAt: undefined });
});

schema.pre('findOne', function () {
  this.where({ deletedAt: undefined });
});

export const SubscriptionModel: mongoose.Model<Subscription> =
  mongoose.models.Subscription ||
  mongoose.model<Subscription>('Subscription', schema);

export const createSubscription = async (
  orderId: string,
  { extraData: extraDataRaw }: any
) => {
  const extraData = JSON.parse(JSON.parse(extraDataRaw));
  const subscription = await SubscriptionModel.findOneAndUpdate(
    {
      user: extraData.userId,
    },
    {
      active: true,
      startDate: dayjs().toISOString(),
      endDate: dayjs().add(extraData.plan.totalUseDays, 'day').toISOString(),
      plan: extraData.plan.id,
      subscriptionPeriod: 'YEARLY',
      user: extraData.userId,
      $push: {
        associatedOrder: orderId,
      },
    },
    {
      runValidators: true,
      upsert: true,
    }
  );

  return subscription;
};
