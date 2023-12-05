import {
  markOrderStatus,
  markOrderStatusWithAppotaData,
  Order,
  OrderModel,
  ORDER_STATUS,
} from '@/models/Order';
import { signAppotaToken } from '@/modules/appota';
import {
  createAuthorizedHandler,
  error,
  getUserIdFromEvent,
  init,
  success,
} from '@/modules/core';
import axios, { AxiosError } from 'axios';
import { Document } from 'mongoose';
import { createHmac } from 'crypto';

/**
 * Mã đỏ là mã yêu cầu phải gọi API để kiểm tra kết quả giao dịch cuối cùng.
 */
const APPOTA_RED_CODES = [34, 35, 72, 91, 99, 500];

export const handler = createAuthorizedHandler(async (e) => {
  await init();

  const orderId = e.pathParameters.orderId;
  const userId = getUserIdFromEvent(e);
  const appotaToken = signAppotaToken();

  let order: Document<Order> & Order;

  try {
    order = await OrderModel.findOne({
      $and: [
        {
          _id: orderId,
        },
        {
          userId,
        },
      ],
    });

    if (!order) return error('Order not found', 404);

    if (order.orderStatus !== ORDER_STATUS.InProgress)
      return success({
        result: order.toJSON(),
      });
  } catch (e) {
    return error(`${e}`);
  }

  try {
    const signature = createHmac('sha256', process.env.APPOTA_SECRET_KEY)
      .update(`orderId=${orderId}`)
      .digest('hex');

    const { data: appotaResponse } = await axios.post(
      `${process.env.APPOTA_ENDPOINT}/v1/orders/transaction/bank/status`,
      { orderId, signature },
      {
        headers: {
          'X-APPOTAPAY-AUTH': `Bearer ${appotaToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (appotaResponse.errorCode === 0) {
      await markOrderStatusWithAppotaData(
        appotaResponse,
        ORDER_STATUS.Success,
        'Thành công!'
      );
    } else {
      await markOrderStatus(
        orderId,
        ORDER_STATUS.Failed,
        'Giao dịch thất bại. Vui lòng liên hệ support@safezone.com.vn để được hỗ trợ'
      );
    }
  } catch (e) {
    const err = e as AxiosError<any>;

    if (APPOTA_RED_CODES.includes(err.response.data.errorCode)) {
      await markOrderStatusWithAppotaData(
        err.response.data,
        ORDER_STATUS.NeedStatusCheck,
        'Safe Zone đang kiểm tra kết quả giao dịch với ngân hàng..'
      );
    } else {
      await markOrderStatus(
        orderId,
        ORDER_STATUS.Failed,
        err?.response?.data?.message
      );
    }
  }

  order = await OrderModel.findOne({
    $and: [
      {
        _id: orderId,
      },
      {
        userId,
      },
    ],
  });

  return success({
    result: order.toJSON(),
  });
});
