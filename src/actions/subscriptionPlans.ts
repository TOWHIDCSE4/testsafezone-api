import { FilterQuery as FilterQueryMG } from 'mongoose';
import { escapeRegExp } from 'lodash';
import { SubscriptionPlan, SubscriptionPlanModel } from '@/models/Subscription';

export default class SubscriptionPlanActions {
  public static buildFilterQuery(filter: any): FilterQueryMG<SubscriptionPlan> {
    const conditions: any = {};
    if (filter.search) {
      const searchRegexStr = escapeRegExp(filter.search);
      conditions.$or = [
        {
          name: {
            $regex: searchRegexStr,
            $options: 'i',
          },
        },
      ];
    }
    return conditions;
  }

  public static async findAllAndPaginated(filter) {
    const conditions = SubscriptionPlanActions.buildFilterQuery(filter);
    const pageSize = filter.page_size || 20;
    const pageNumber = filter.page_number || 1;
    const skip = pageSize * (pageNumber - 1);
    const limit = pageSize;

    return SubscriptionPlanModel.find(conditions, {})
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public static count(filter): Promise<number> {
    const conditions = SubscriptionPlanActions.buildFilterQuery(filter);
    return SubscriptionPlanModel.countDocuments(conditions).exec();
  }
}
