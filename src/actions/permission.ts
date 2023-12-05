import { FilterQuery as FilterQueryMG, PipelineStage } from 'mongoose';
import { Permission, PermissionModel } from '@/models/Permission';

export default class PermissionActions {
  public static buildFilterQuery(filter: any): FilterQueryMG<Permission> {
    const conditions: any = {};
    if (filter.email) {
      conditions.email = filter.email;
    }
    return conditions;
  }

  public static async getPermissionsByModule(filter) {
    const conditions = PermissionActions.buildFilterQuery(filter);
    const matchPipeline: PipelineStage = {
      $match: conditions,
    };

    const pipelines = [];
    pipelines.push(matchPipeline);
    pipelines.push(
      {
        $group: {
          _id: '$module',
          permissions: {
            $push: {
              _id: '$_id',
              name: '$permission_name',
              code: '$permission_code',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          module: '$_id',
          permissions: '$permissions',
        },
      },
      { $sort: { module: 1 } }
    );
    return await PermissionModel.aggregate(pipelines).exec();
  }
}
