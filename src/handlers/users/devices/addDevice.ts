import { DeviceModel, DEVICES, PLATFORM_LIST } from '@/models/Device';
import {
  createAuthorizedHandler,
  error,
  getUserIdFromEvent,
  init,
  success,
} from '@/modules/core';
import { isObjectIdValid } from '@/modules/core/validators';
import {
  SubscriptionModel,
  SubscriptionPlanModel,
} from '@/models/Subscription';

export const addDevice = createAuthorizedHandler(async (e) => {
  try {
    const parentId = getUserIdFromEvent(e);
    const {
      childId,
      name,
      platform,
      type,
      hardwareId = null,
    } = JSON.parse(e.body || '{}');

    if (!childId || !isObjectIdValid(childId)) return error('Invalid childId');
    if (!name) return error('You must provide a device name');
    if (!platform || !PLATFORM_LIST.includes(platform as any))
      return error(
        'You must provide "platform" argument. Available values are: ' +
          PLATFORM_LIST.join(',')
      );
    if (!type || !DEVICES.includes(type as any))
      return error(
        'You must provide "type" argument. Available values are: ' +
          DEVICES.join(',')
      );

    await init();

    if (hardwareId) {
      const existDevice = await DeviceModel.findOne({
        hardwareId,
      });

      if (existDevice) {
        if (existDevice.userId !== parentId) {
          return error('This device is used by other parents.');
        }

        return success({
          device: existDevice,
          message: 'Using existing device.',
        });
      }
    }

    // Thêm logic giới hạn số thiết bị đăng ký theo account, theo từng plan mà user đó đang có
    const subscription = await SubscriptionModel.findOne({
      user: parentId,
    });

    if (subscription) {
      const subscriptionPlan = await SubscriptionPlanModel.findOne({
        _id: subscription.plan,
      });

      const countDevice = await DeviceModel.countDocuments({
        userId: parentId,
      }).exec();
      if (countDevice > subscriptionPlan.totalDevices) {
        return error(
          'Tài khoản của bạn đã đạt giới hạn thiết bị. Vui lòng nâng cấp gói của bạn để tiếp tục'
        );
      }
    }

    const device = new DeviceModel({
      userId: parentId,
      hardwareId,
      name,
      platform: platform,
      children: [childId],
    });

    await device.save();

    return success({
      device,
      message: 'Device added successfully',
    });
  } catch (e) {
    return error(e);
  }
});
