import { FilterQuery as FilterQueryMG, PipelineStage } from 'mongoose';
import { Role, RoleModel } from '@/models/Role';
import { AdminHasRolesModel } from '@/models/AdminHasRoles';
import { RoleHasPermissionsModel } from '@/models/RoleHasPermissions';

export default class RoleActions {
  public static buildFilterQuery(filter: any): FilterQueryMG<Role> {
    const conditions: any = {};
    if (filter.email) {
      conditions.email = filter.email;
    }
    return conditions;
  }

  public static async findAllAndPaginated(filter) {
    const conditions = RoleActions.buildFilterQuery(filter);
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
        from: RoleHasPermissionsModel.collection.collectionName,
        localField: '_id',
        foreignField: 'role_id',
        as: 'role_has_permissions',
      },
    });
    pipelines.push({
      $lookup: {
        from: AdminHasRolesModel.collection.collectionName,
        localField: '_id',
        foreignField: 'role_id',
        as: 'admin_has_roles',
      },
    });

    return await RoleModel.aggregate(pipelines).skip(skip).limit(limit).exec();
  }

  public static count(filter): Promise<number> {
    const conditions = RoleActions.buildFilterQuery(filter);
    return RoleModel.countDocuments(conditions).exec();
  }
}
