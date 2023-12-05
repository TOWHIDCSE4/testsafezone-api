import {
  error,
  success,
  init,
  createAuthorizedHandler,
  checkExpiredSubscription,
} from '@/modules/core';
import { ChildModel } from '@/models/Child';
import { SubscriptionModel } from '@/models/Subscription';
import { OnlineStatus } from '@/models/Enums/OnlineStatus';
import { Gender } from '@/models/Enums/Gender';
import { checkIfCorrectParent } from './utils';

export const addChild = createAuthorizedHandler(async (event) => {
  try {
    if (await checkExpiredSubscription(event)) {
      return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
    }

    const { requestParentId } = checkIfCorrectParent(event);

    await init();

    const { fullname, gender } = JSON.parse(event.body);

    let subscription = await SubscriptionModel.findOne({
      user: requestParentId,
    }).populate('plan');

    if (!subscription || subscription.active == false) {
      return error({
        message: 'Tạo không thành công! Tài khoản chưa kích hoạt gói nào.',
      });
    } else {
      const newChild = new ChildModel({
        fullname,
        gender: gender === Gender.MALE ? Gender.MALE : Gender.FEMALE,
        parentId: requestParentId,
        role: 'Children',
        status: OnlineStatus.OFFLINE,
      });

      const result = await newChild.save();

      return success({ result: result });
    }
  } catch (e) {
    return error({
      message: String(e),
    });
  }
});
