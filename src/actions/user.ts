import { User, UserModel } from '@/models/User';
import { FilterQuery as FilterQueryMG, PipelineStage } from 'mongoose';
import { escapeRegExp } from 'lodash';
import { DeviceModel } from '@/models/Device';
import { ChildModel } from '@/models/Child';
import {
  SubscriptionModel,
  SubscriptionPlanModel,
} from '@/models/Subscription';

export default class UserActions {
  public static buildFilterQuery(filter: any): FilterQueryMG<User> {
    const conditions: any = {};
    if (filter.email) {
      conditions.email = filter.email;
    }

    if (filter.name) {
      const searchRegexStr = escapeRegExp(filter.name);
      conditions.$or = [
        {
          displayName: {
            $regex: searchRegexStr,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: searchRegexStr,
            $options: 'i',
          },
        },
        {
          username: {
            $regex: searchRegexStr,
            $options: 'i',
          },
        },
      ];
    }
    if (filter.phoneNumber) {
      conditions.phoneNumber = filter.phoneNumber;
    }
    if (filter.username) {
      conditions.username = filter.username;
    }
    return conditions;
  }

  public static async findAllAndPaginated(filter) {
    const conditions = UserActions.buildFilterQuery(filter);
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
        from: SubscriptionModel.collection.collectionName,
        localField: '_id',
        foreignField: 'user',
        as: 'subscriptions',
      },
    });
    pipelines.push({
      $lookup: {
        from: SubscriptionPlanModel.collection.collectionName,
        localField: 'subscriptions.plan',
        foreignField: '_id',
        as: 'subscriptionPlans',
      },
    });
    pipelines.push({
      $lookup: {
        from: DeviceModel.collection.collectionName,
        localField: '_id',
        foreignField: 'userId',
        as: 'devices',
      },
    });
    pipelines.push({
      $lookup: {
        from: ChildModel.collection.collectionName,
        localField: '_id',
        foreignField: 'parentId',
        as: 'childrens',
      },
    });

    return UserModel.aggregate(pipelines).skip(skip).limit(limit).exec();
  }

  public static count(filter): Promise<number> {
    const conditions = UserActions.buildFilterQuery(filter);
    return UserModel.countDocuments(conditions).exec();
  }

  public static async unregisteredUsersList() {
    const subscriptions = await SubscriptionModel.find();
    const usersId = subscriptions.map((x: any) => x.user);

    return UserModel.find({ _id: { $nin: usersId } }).exec();
  }
}
