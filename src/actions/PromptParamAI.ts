import { FilterQuery as FilterQueryMG } from 'mongoose';
import _ from 'lodash';
import { PromptParamAI, PromptParamAIModel } from '@/models/AI/PromptParamAI';

export default class PromptParamAIActions {
  public static buildFilterQuery(filter: any): FilterQueryMG<PromptParamAI> {
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
    if (filter.type) {
      conditions.type = filter.type;
    }
    if (filter.is_active || filter.is_active === false) {
      conditions.is_active = filter.is_active;
    }
    return conditions;
  }

  public static async findAllAndPaginated(filter) {
    const conditions = PromptParamAIActions.buildFilterQuery(filter);
    const pageSize = filter.page_size || 20;
    const pageNumber = filter.page_number || 1;
    const skip = pageSize * (pageNumber - 1);
    const limit = pageSize;

    return PromptParamAIModel.find(conditions, {})
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public static count(filter): Promise<number> {
    const conditions = PromptParamAIActions.buildFilterQuery(filter);
    return PromptParamAIModel.countDocuments(conditions).exec();
  }
}
