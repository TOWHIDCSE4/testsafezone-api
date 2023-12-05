import { ChildModel } from '@/models/Child';
import { ActivityModel } from '@/models/Child/Activity';
import { IdentifiedActivityModel } from '@/models/Child/Activity/IdentifiedActivity';
import { DeviceModel } from '@/models/Device';
import { EnumNotificationType, NotificationsModel } from '@/models/Notifications';
import {
  checkExpiredSubscription,
  createAuthorizedHandler,
  error,
  getUserIdFromEvent,
  init,
  success,
} from '@/modules/core';
import { uploadImage } from '@/modules/s3';

export const addBatchActivities = createAuthorizedHandler(async (e) => {
  if (await checkExpiredSubscription(e)) {
    return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
  }

  await init();

  const childId = e.pathParameters.childId;

  const listActivity: Array<any> = JSON.parse(e.body || '[]');

  const childExist = Boolean(await ChildModel.findById(childId));

  if (!childExist)
    return error({
      message: `ChildId ${childId} doesn't exist.`,
    });
  const checkedDevices = new Set<String>();
  const nowDate = new Date().toISOString();

  try {
    const activitiesResult = [];
    for (const activityData of listActivity) {
      const {
        deviceId,
        hardwareId = '',
        activityName,
        activityDisplayName,
        activityType,
        activityIcon,
        activityMetadata = {},
        activityTimeStart = nowDate,
        duration,
        questionable = false,
      } = activityData;

      if (activityType === 'LOCATION' && activityIcon) {
        return error('Location activity does not need an icon.');
      }

      if (!checkedDevices.has(deviceId)) {
        const deviceExist = Boolean(await DeviceModel.findById(deviceId));
        if (!deviceExist)
          return error({
            message: `DeviceID ${deviceId} doesn't exist.`,
          });

        checkedDevices.add(deviceId);
      }

      let maybeIdentifiedActivity = await IdentifiedActivityModel.findOne({
        activityName,
        activityType,
      });

      const imageUrl = activityIcon
        ? await uploadImage(activityIcon, getUserIdFromEvent(e), activityName)
        : null;

      if (!maybeIdentifiedActivity) {
        maybeIdentifiedActivity = await IdentifiedActivityModel.create({
          activityName,
          activityDisplayName,
          activityType,
          activityIcon: imageUrl,
        });
      } else {
        maybeIdentifiedActivity.activityIcon =
          imageUrl || maybeIdentifiedActivity.activityIcon;
        maybeIdentifiedActivity.activityDisplayName = activityDisplayName;
        await maybeIdentifiedActivity.save();
      }

      const newDataActivity = {
        childId,
        deviceId,
        hardwareId,
        activityId: maybeIdentifiedActivity,
        activityMetadata,
        activityTimeStart,
        duration,
        questionable,
      };

      const activity = await ActivityModel.create(newDataActivity);
      if(activity && questionable === true && (activityType === 'APP' || activityType === 'WEB_SURF')){
        const childData = await ChildModel.findOne({ _id: childId })
        let shortContent = '';
        let fullContent = '';
        if(activityType === 'APP'){
          shortContent = `Tài khoản ${childData?.fullname} đã truy cập vào ứng dụng bị cấm`;
          fullContent = `Tài khoản ${childData?.fullname} đã truy cập vào ứng dụng bị cấm: ${activityName}`;
        }else if(activityType === 'WEB_SURF'){
          shortContent = `Tài khoản ${childData?.fullname} đã truy cập vào trang web bị cấm`;
          fullContent = `Tài khoản ${childData?.fullname} đã truy cập vào trang web bị cấm: ${activityName}`;
        }
        const dataChild = {
          child_id: childId,
          full_name: childData?.fullname,
          gender: childData?.gender
        }
        const newDataNotification = {
          user_id: childData?.parentId,
          title: 'Con bạn đã truy cập vào nội dung không được phép',
          short_content: shortContent,
          full_content: fullContent,
          is_seen: false,
          meta_data: JSON.stringify(dataChild),
          type: EnumNotificationType.ACCESS_BLOCK_CONTENT
        };
        await NotificationsModel.create(newDataNotification)
      }

      const result = activity.toJSON();
      (result as any).identifiedActivity = result.activityId;
      delete result.activityId;
      activitiesResult.push(result);
    }

    return success({
      activities: activitiesResult,
    });
  } catch (e) {
    return error(e);
  }
});
