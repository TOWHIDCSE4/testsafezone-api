import mongoose, { Schema } from 'mongoose';

export enum EnumTypePlan {
  Family = 1,
  School = 2
}
export interface SubscriptionPlan {
  name: string;
  code: string;
  totalUseDays: number;
  limitedFeatures: string[];
  totalDevices: number;
  yearlyPrice: number;
  monthlyPrice: number;
  isFree: boolean;
  isFeatured: boolean;
  level: number;
  type: EnumTypePlan;
}

export const SubscriptionPlanModel: mongoose.Model<SubscriptionPlan> =
  mongoose.models.SubscriptionPlan ||
  mongoose.model<SubscriptionPlan>(
    'SubscriptionPlan',
    new Schema(
      {
        name: { type: String, required: true },
        code: { type: String, required: true },
        isFeatured: {
          type: Boolean,
          default: false,
        },
        level: Number,
        totalUseDays: { type: Number, required: true },
        limitedFeatures: [{ type: String, required: true }],
        totalDevices: { type: Number, required: true },
        yearlyPrice: { type: Number, required: true },
        monthlyPrice: { type: Number, required: true },
        isFree: { type: Boolean, default: false },
        type: {
          type: Number,
          default: EnumTypePlan.Family
        }
      },
      {
        collection: 'subscription_plans',
      }
    )
  );

/**
 * Tên hiển thị lúc thanh toán
 */
export const getPaymentTitle = (
  subscriptionPlan: InstanceType<typeof SubscriptionPlanModel>
) => {
  return (
    'SafeZone: ' +
    subscriptionPlan.name +
    ' - ' +
    subscriptionPlan.totalUseDays +
    ' ngày'
  );
};
