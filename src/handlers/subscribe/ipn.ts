import {
  markOrderStatusWithAppotaData,
  OrderModel,
  ORDER_STATUS,
} from '@/models/Order';
import { createSubscription } from '@/models/Subscription';
import { createHandler, error, init, success } from '@/modules/core';
import mongoose from 'mongoose';

/**
 * Sample data
 * {"partnerCode":"APPOTAPAY","apiKey":"FJcmF8uj2ISveL5FvvNk4pnp8xrhINz8","amount":10000,"currency":"VND","orderId":"b8753996-e34f-46aa-b362-1ca188dc049e","bankCode":"SAIGONBANK","paymentMethod":"ATM","paymentType":"WEB","appotapayTransId":"AP221436230466","errorCode":0,"message":"Success","transactionTs":1670050390,"extraData":"{\\"userId\\":\\"0936a099-6d75-4d0b-8cc6-74ef1cd967fc\\"}","tokenResult":"{\\"status\\":0,\\"message\\":\\"Th\\\\u00e0nh c\\\\u00f4ng\\",\\"card\\":{\\"status\\":\\"active\\",\\"token\\":\\"2058824365753154\\",\\"card_name\\":\\"NGUYEN VAN A\\",\\"card_number\\":\\"970400xxxxxx0001\\",\\"card_date\\":\\"\\",\\"card_type\\":\\"ATM_CARD\\"}}","signature":"e92a2ce1dc7a65f46810df49be6e7f1021d82ef86a5beb715ae833d38719353b"}
 */

export const handler = createHandler(async (e) => {
  console.log('Received payment: ', e.body);
  let appotaData;

  try {
    appotaData = JSON.parse(e.body || '{}');
  } catch (e) {
    return error(e);
  }

  await init();

  const { orderId } = appotaData;

  if (
    !orderId ||
    !(await OrderModel.findOne({
      _id: orderId,
    }))
  ) {
    return error(
      'Không tìm thấy order! Vui lòng liên hệ support@safezone.com.vn để được hỗ trợ.'
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await createSubscription(appotaData.orderId, appotaData);
    await markOrderStatusWithAppotaData(
      appotaData,
      ORDER_STATUS.Success,
      'Thành công!'
    );
    await session.commitTransaction();

    // According to Appota
    return success({
      status: 'ok',
    });
  } catch (e) {
    await session.abortTransaction();
    markOrderStatusWithAppotaData(appotaData, ORDER_STATUS.Failed);

    console.error(e);
    return error(e);
  }
});
