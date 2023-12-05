import mongoose, { FilterQuery as FilterQueryMG } from 'mongoose';
import { ApiKeyAI, ApiKeyAIModel } from '@/models/AI/ApiKeyAI';
import _ from 'lodash';

export default class ApiKeyAIActions {
  public static buildFilterQuery(filter: any): FilterQueryMG<ApiKeyAI> {
    const conditions: any = {};
    if (filter._id) {
      conditions._id = filter._id;
    }
    if (filter.search) {
      conditions.title = {
        $regex: _.escapeRegExp(filter.search),
        $options: 'i',
      };
    }
    if (filter.api_key) {
      conditions.api_key = filter.api_key;
    }
    if (filter.is_active || filter.is_active === false) {
      conditions.is_active = filter.is_active;
    }
    return conditions;
  }

  public static async findAllAndPaginated(filter) {
    const conditions = ApiKeyAIActions.buildFilterQuery(filter);
    const pageSize = filter.page_size || 20;
    const pageNumber = filter.page_number || 1;
    const skip = pageSize * (pageNumber - 1);
    const limit = pageSize;

    return ApiKeyAIModel.find(conditions, {}).skip(skip).limit(limit).exec();
  }

  public static count(filter): Promise<number> {
    const conditions = ApiKeyAIActions.buildFilterQuery(filter);
    return ApiKeyAIModel.countDocuments(conditions).exec();
  }

  public static findOne(
    filter: any,
    select_fields?: any,
    sort: any = {}
  ): Promise<ApiKeyAI | null> {
    const conditions = ApiKeyAIActions.buildFilterQuery(filter);
    return ApiKeyAIModel.findOne(conditions, {
      ...select_fields,
    })
      .sort(sort)
      .exec();
  }

  public static update(
    _id: mongoose.Types.ObjectId,
    diff: ApiKeyAI
  ): Promise<any> {
    return ApiKeyAIModel.findOneAndUpdate(
      { _id },
      {
        $set: {
          ...diff,
          updateAt: new Date(),
        },
      },
      {
        upsert: false,
        new: true,
        returnOriginal: false,
      }
    ).exec();
  }
}
