import { FilterQuery as FilterQueryMG } from 'mongoose';
import _ from 'lodash';
import { GenerationResultAI, GenerationResultAIModel } from '@/models/AI/GenerationResultAI';

export default class GenerationResultAIActions {
  public static buildFilterQuery(filter: any): FilterQueryMG<GenerationResultAI> {
    const conditions: any = {};
    if (filter._id) {
      conditions._id = filter._id;
    }
    if (filter.search) {
      conditions.content = {
        $regex: _.escapeRegExp(filter.search),
        $options: 'i',
      };
    }
    if (filter.template_obj_id ) {
      conditions.template_obj_id = filter.template_obj_id;
    }
    return conditions;
  }

  public static async findAllAndPaginated(filter) {
    const conditions = GenerationResultAIActions.buildFilterQuery(filter);
    const pageSize = filter.page_size || 20;
    const pageNumber = filter.page_number || 1;
    const skip = pageSize * (pageNumber - 1);
    const limit = pageSize;

    return GenerationResultAIModel.find(conditions, {})
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public static count(filter): Promise<number> {
    const conditions = GenerationResultAIActions.buildFilterQuery(filter);
    return GenerationResultAIModel.countDocuments(conditions).exec();
  }
}
