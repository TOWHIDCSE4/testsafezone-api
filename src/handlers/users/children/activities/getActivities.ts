import { DEFAULT_DATE_FORMAT } from '@/constants';
import { ChildModel } from '@/models/Child';
import { ActivityModel, defaultProjection } from '@/models/Child/Activity';
import {
  activityTypes,
  IdentifiedActivityModel,
} from '@/models/Child/Activity/IdentifiedActivity';
import {
  checkExpiredSubscription,
  createAuthorizedHandler,
  error,
  init,
  success,
} from '@/modules/core';
import { hideIdAndVersionPipelines } from '@/modules/core/mongoose';
import dayjs from 'dayjs';
import type { PipelineStage } from 'mongoose';
import * as mongoose from 'mongoose';
import { checkIfCorrectParent } from '../utils';

export const getActivities = createAuthorizedHandler(async (e) => {
  try {
    if (await checkExpiredSubscription(e)) {
      return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
    }

    checkIfCorrectParent(e);

    await init();

    const childId = e.pathParameters?.childId;

    if (!childId) return error('No childId is provided');

    const {
      from,
      to,
      page = 1,
      limit = 25,
      type,
    } = e.queryStringParameters || {};

    if (type && !activityTypes.includes(type as any)) {
      return error(
        `Invalid activity type. Valid value: ${activityTypes.join(',')}`
      );
    }

    const matchPipeline: PipelineStage = {
      $match: {
        $and: [
          {
            childId: new mongoose.Types.ObjectId(childId),
          },
        ],
      },
    };

    let hasParams = true;
    const fromObj = dayjs(from);
    const toObj = dayjs(to);

    if (from && fromObj.isValid()) {
      matchPipeline.$match.$and.push({
        activityTimeStart: {
          $gt: fromObj.format(DEFAULT_DATE_FORMAT),
        },
      });
      hasParams = true;
    }

    if (to && toObj.isValid()) {
      matchPipeline.$match.$and.push({
        activityTimeStart: {
          $lt: toObj.format(DEFAULT_DATE_FORMAT),
        },
      });
      hasParams = true;
    }

    const $skip = (+page - 1) * +limit;
    const $limit = +limit;

    const pipelines = [];
    hasParams && pipelines.push(matchPipeline);

    pipelines.push({
      $lookup: {
        from: IdentifiedActivityModel.collection.collectionName,
        localField: 'activityId',
        foreignField: '_id',
        as: 'activity',
        pipeline: hideIdAndVersionPipelines,
      },
    });

    type &&
      pipelines.push({
        $match: {
          'activity.activityType': type || '*',
        },
      });

    const total =
      (
        await ActivityModel.aggregate([
          ...pipelines,
          {
            $count: 'count',
          },
        ])
      )[0]?.count || 0;

    pipelines.push(
      {
        $lookup: {
          from: ChildModel.collection.collectionName,
          localField: 'childId',
          foreignField: '_id',
          as: 'device',
          pipeline: hideIdAndVersionPipelines,
        },
      },
      {
        $sort: {
          activityTimeStart: -1,
        },
      },
      {
        $skip,
      },
      {
        $limit,
      },
      ...hideIdAndVersionPipelines,
      {
        $project: defaultProjection,
      }
    );

    const activities = await ActivityModel.aggregate(pipelines).exec();

    return success({
      result: activities,
      pagination: {
        page: +page,
        limit: $limit,
        total,
      },
    });
  } catch (e) {
    return error(`${e}`);
  }
});
