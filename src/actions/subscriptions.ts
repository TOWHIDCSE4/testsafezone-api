import { FilterQuery as FilterQueryMG, PipelineStage } from 'mongoose';
import {
  Subscription,
  SubscriptionModel,
  SubscriptionPlanModel,
} from '@/models/Subscription';
import { UserModel } from '@/models/User';

export default class SubscriptionActions {
  public static buildFilterQuery(filter: any): FilterQueryMG<Subscription> {
    const conditions: any = {};
    console.log(filter);

    if (filter.startDate) {
      conditions.startDate = filter.startDate;
    }

    if (filter.endDate) {
      conditions.endDate = filter.endDate;
    }

    return conditions;
  }

  public static async findAllAndPaginated(filter) {
    const conditions = SubscriptionActions.buildFilterQuery(filter);
    const pageSize = filter.page_size || 20;
    const pageNumber = filter.page_number || 1;
    const skip = pageSize * (pageNumber - 1);
    const limit = pageSize;

    const matchPipeline: PipelineStage = {
      $match: conditions,
    };

    const pipelines = [];
    pipelines.push(matchPipeline);
    pipelines.push({
      $lookup: {
        from: SubscriptionPlanModel.collection.collectionName,
        localField: 'plan',
        foreignField: '_id',
        as: 'subscriptionPlan',
      },
    });
    pipelines.push({
      $lookup: {
        from: UserModel.collection.collectionName,
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    });

    return SubscriptionModel.aggregate(pipelines)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public static count(filter): Promise<number> {
    const conditions = SubscriptionActions.buildFilterQuery(filter);
    return SubscriptionModel.countDocuments(conditions).exec();
  }
}
