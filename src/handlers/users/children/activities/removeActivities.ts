import { DEFAULT_DATE_FORMAT } from '@/constants';
import { ChildModel } from '@/models/Child';
import { Activity, ActivityModel } from '@/models/Child/Activity';
import {
  checkExpiredSubscription,
  createAuthorizedHandler,
  error,
  init,
  success,
} from '@/modules/core';
import dayjs from 'dayjs';
import { FilterQuery } from 'mongoose';

export const removeActivities = createAuthorizedHandler(async (e) => {
  if (await checkExpiredSubscription(e)) {
    return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
  }

  await init();

  const childId = e.pathParameters.childId;

  if (!(await ChildModel.findOne({ _id: childId })))
    return error('ChildId does not exist');

  try {
    const { from, to, ids } = JSON.parse(e.body || '{}');

    const deleteParams: FilterQuery<Activity> = {};

    if (ids && Array.isArray(ids)) {
      deleteParams._id = {
        $in: ids,
      };
    }

    const fromObj = dayjs(from);
    const toObj = dayjs(to);

    if (from && fromObj.isValid()) {
      deleteParams.activityTimeStart = {
        $gt: fromObj.format(DEFAULT_DATE_FORMAT),
      };
    }
    if (to && toObj.isValid()) {
      deleteParams.activityTimeStart = {
        $lt: toObj.format(DEFAULT_DATE_FORMAT),
      };
    }

    // Không cho người dùng xóa hết..
    if (!Object.keys(deleteParams).length) return error('Lack of parameters');

    deleteParams.childId = childId;

    const result = await ActivityModel.deleteMany(deleteParams);

    return success({ result });
  } catch (e) {
    return error(e);
  }
});
