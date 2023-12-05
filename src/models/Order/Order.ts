import mongoose, { Schema } from 'mongoose';
import randomstring from 'randomstring';
import { SubscriptionPlan } from '../Subscription';

export enum ORDER_STATUS {
  'InProgress' = 0,
  'Success' = 1,
  'Failed' = 2,
  'NeedStatusCheck' = 3,
}

export interface Order {
  _id: string;
  externalMetadata: Record<any, any>;

  userId: string;
  orderName: string;
  orderAmount: number;
  orderStatus: ORDER_STATUS;
  statusMessage: string;
}

export const OrderModel: mongoose.Model<Order> =
  mongoose.models.Order ||
  mongoose.model<Order>(
    'Order',
    new Schema(
      {
        _id: {
          type: String,
        },
        orderName: String,
        orderAmount: Number,
        orderStatus: Number,
        statusMessage: String,
        externalMetadata: Object,
        userId: String,
      },
      {
        _id: false,
        timestamps: true,
      }
    )
  );

export const generateOrderId = (client: string, plan: SubscriptionPlan) => {
  const uuid = randomstring.generate({
    charset: 'hex',
    capitalization: 'uppercase',
    readable: true,
    length: 7,
  });
  switch (client) {
    default:
      return `W` + uuid + plan.code + 'VN';
  }
};

export const markOrderStatusWithAppotaData = async (
  appotaData: any,
  orderStatus: ORDER_STATUS,
  statusMessage = ''
) => {
  const { orderId } = appotaData;

  const result = await OrderModel.findByIdAndUpdate(orderId, {
    $set: {
      externalMetadata: appotaData,
      orderStatus: orderStatus,
      statusMessage,
    },
  });

  return result;
};

export const markOrderStatus = async (
  orderId: string,
  orderStatus: ORDER_STATUS,
  statusMessage = ''
) => {
  const result = await OrderModel.findByIdAndUpdate(orderId, {
    $set: {
      externalMetadata: {},
      orderStatus: orderStatus,
      statusMessage,
    },
  });

  return result;
};
