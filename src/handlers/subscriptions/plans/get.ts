import { EnumTypePlan, SubscriptionPlanModel } from '@/models/Subscription';
import { createAuthorizedHandler, error, init, success } from '@/modules/core';

export const handler = createAuthorizedHandler(async (e) => {
  try {
    await init();
    const { type } = e.queryStringParameters || {};
    const filter: any = {};
    if(type){
      filter.type = parseInt(type as string);
    }else{
      filter.type = EnumTypePlan.Family
    }
    const plans = await SubscriptionPlanModel.find(filter).sort({
      level: 1,
    });

    return success({
      result: plans,
    });
  } catch (e) {
    return error(e);
  }
});
