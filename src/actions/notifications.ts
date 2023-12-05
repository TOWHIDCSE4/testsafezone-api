import { FilterQuery as FilterQueryMG, PipelineStage } from 'mongoose';
import { Notifications, NotificationsModel } from '@/models/Notifications';

export default class NotificationActions {
  public static buildFilterQuery(filter: any): FilterQueryMG<Notifications> {
    const conditions: any = {};
    if (filter.user_id) {
      conditions.user_id = filter.user_id;
    }
    if (filter.type) {
      conditions.type = filter.type;
    }
    if (filter.is_seen || filter.is_seen === false) {
      conditions.is_seen = filter.is_seen;
    }
    return conditions;
  }

  public static async findAllAndPaginated(filter) {
    const conditions = NotificationActions.buildFilterQuery(filter);
    const pageSize = filter.page_size || 20;
    const pageNumber = filter.page_number || 1;
    const skip = pageSize * (pageNumber - 1);
    const limit = pageSize;

    const matchPipeline: PipelineStage = {
      $match: conditions,
    };

    const pipelines = [];
    pipelines.push(matchPipeline);
    return await NotificationsModel.aggregate(pipelines).skip(skip).limit(limit).exec();
  }

  public static count(filter): Promise<number> {
    const conditions = NotificationActions.buildFilterQuery(filter);
    return NotificationsModel.countDocuments(conditions).exec();
  }
}
