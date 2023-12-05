import { FilterQuery as FilterQueryMG, PipelineStage } from 'mongoose';
import { Role, RoleModel } from '@/models/Role';
import { AdminHasRolesModel } from '@/models/AdminHasRoles';
import { escapeRegExp } from 'lodash';
import { AdminHasPermissionsModel } from '@/models/AdminHasPermissions';
import { AdminModel } from '@/models/Admin';

export default class AdminActions {
  public static buildFilterQuery(filter: any): FilterQueryMG<Role> {
    const conditions: any = {};
    if (filter.search) {
      const searchRegexStr = escapeRegExp(filter.search);
      conditions.$or = [
        {
          full_name: {
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

    return conditions;
  }

  public static async findAllAndPaginated(filter) {
    const conditions = AdminActions.buildFilterQuery(filter);
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
        from: AdminHasPermissionsModel.collection.collectionName,
        localField: '_id',
        foreignField: 'admin_id',
        as: 'admin_has_permissions',
      },
    });
    // pipelines.push({
    //   $lookup: {
    //     from: AdminHasRolesModel.collection.collectionName,
    //     localField: '_id',
    //     foreignField: 'admin_id',
    //     as: 'admin_has_roles',
    //   },
    // });
    pipelines.push({
      $lookup: {
        from: AdminHasRolesModel.collection.collectionName,
        let: {
          objId: '$_id',
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ['$admin_id', '$$objId'],
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: RoleModel.collection.collectionName,
              localField: 'role_id',
              foreignField: '_id',
              as: 'role',
            },
          },
        ],
        as: 'admin_has_roles',
      },
    });
    pipelines.push({
      $project: {
        password: 0,
      },
    });

    return await AdminModel.aggregate(pipelines).skip(skip).limit(limit).exec();
  }

  public static count(filter): Promise<number> {
    const conditions = AdminActions.buildFilterQuery(filter);
    return AdminModel.countDocuments(conditions).exec();
  }
}
