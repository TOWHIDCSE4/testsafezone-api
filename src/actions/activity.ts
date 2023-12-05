import { ActivityModel, defaultProjection } from '@/models/Child/Activity';
import { hideIdAndVersionPipelines } from '@/modules/core/mongoose';
import { ChildModel } from '@/models/Child';
import { IdentifiedActivityModel } from '@/models/Child/Activity/IdentifiedActivity';
import { DeviceModel } from '@/models/Device';
import dayjs from 'dayjs';
import type { PipelineStage } from 'mongoose';

export default class ActivityActions {
  public static async getDevicesByChildren(childrenId: any, typeGet: string) {
    let matchPipeline: any = [];
    if (typeGet === 'mail') {
      matchPipeline = {
        $match: {
          $and: [
            {
              childId: { $in: [childrenId] },
            },
            { reportedAccessingToBlockedWebsitesOrApps: { $ne: true } },
          ],
        },
      };
    } else {
      const currentDate = new Date();
      const conditionDate = new Date(currentDate.setHours(currentDate.getHours() - 2));
      matchPipeline = {
        $match: {
          $and: [
            {
              childId: { $in: [childrenId] },
            },
            { notifyMobileAccessToBlockedWebOrApps: { $ne: true } },
            { createdAt : { $gte: conditionDate}}
          ],
        },
      };
    }
    const pipelines = [];
    pipelines.push(matchPipeline);
    pipelines.push({
      $lookup: {
        from: IdentifiedActivityModel.collection.collectionName,
        localField: 'activityId',
        foreignField: '_id',
        as: 'activity',
        pipeline: hideIdAndVersionPipelines,
      },
    });
    pipelines.push({
      $lookup: {
        from: DeviceModel.collection.collectionName,
        localField: 'deviceId',
        foreignField: '_id',
        as: 'device',
        pipeline: hideIdAndVersionPipelines,
      },
    });
    pipelines.push(
      {
        $lookup: {
          from: ChildModel.collection.collectionName,
          localField: 'childId',
          foreignField: '_id',
          as: 'children',
          pipeline: hideIdAndVersionPipelines,
        },
      },
      {
        $sort: {
          activityTimeStart: -1,
        },
      },
      // ...hideIdAndVersionPipelines,
      {
        $project: defaultProjection,
      },
      {
        $match: {
          $and: [
            {
              activityType: { $in: ['APP', 'WEB_SURF'] },
            },
            {
              questionable: true,
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            deviceId: '$deviceId',
            deviceName: '$deviceName',
          },
          activity: {
            $push: {
              _id: '$_id',
              activityId: '$activityId',
              activityName: '$activityName',
              activityType: '$activityType',
              activityDisplayName: '$activityDisplayName',
              activityIcon: '$activityIcon',
              activityMetadata: '$activityMetadata',
              activityTimeStart: '$activityTimeStart',
              duration: '$duration',
              questionable: '$questionable',
            },
          },
        },
      }
    );
    return await ActivityModel.aggregate(pipelines).exec();
  }

  public static async getActivitiesByChildren(childrenId) {
    const matchPipeline: PipelineStage = {
      $match: {
        $and: [
          {
            childId: { $in: [childrenId] },
          },
        ],
      },
    };
    const now = dayjs().toDate();
    const yesterday = dayjs().add(-1, 'day').toDate();

    matchPipeline.$match.$and.push({
      activityTimeStart: {
        $gt: yesterday,
      },
    });

    matchPipeline.$match.$and.push({
      activityTimeStart: {
        $lt: now,
      },
    });

    const pipelines = [];
    pipelines.push(matchPipeline);
    pipelines.push({
      $lookup: {
        from: IdentifiedActivityModel.collection.collectionName,
        localField: 'activityId',
        foreignField: '_id',
        as: 'activity',
        pipeline: hideIdAndVersionPipelines,
      },
    });
    pipelines.push(
      {
        $lookup: {
          from: ChildModel.collection.collectionName,
          localField: 'childId',
          foreignField: '_id',
          as: 'children',
          pipeline: hideIdAndVersionPipelines,
        },
      },
      {
        $sort: {
          activityTimeStart: -1,
        },
      },
      // ...hideIdAndVersionPipelines,
      {
        $project: defaultProjection,
      }
    );
    return await ActivityModel.aggregate(pipelines).exec();
  }
}
