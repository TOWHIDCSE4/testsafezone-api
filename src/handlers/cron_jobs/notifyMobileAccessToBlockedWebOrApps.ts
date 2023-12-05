import { SERVER_TYPE, sleep } from '@/modules/core';
import { UserModel } from '@/models/User';
import ActivityActions from '@/actions/activity';
import { ActivityModel } from '@/models/Child/Activity';
import { createHandler, success, error, init } from '@/modules/core';
import { ChildModel } from '@/models/Child';
import { sendMessageToTopic } from '@/service/firebase';

export const apiNotifyMobileAccessToBlockedWebOrApps = createHandler(
  async (event) => {
    try {
      await notifyMobileAccessToBlockedWebOrApps(event);

      return success(null);
    } catch (e) {
      return error(e);
    }
  }
);

export const notifyMobileAccessToBlockedWebOrApps = async (event?) => {
  await init();
  let skip = 0;
  let listUser = [];
  const dataFilter: any = {};
  if (event.body) {
    const { filter_user } = JSON.parse(event.body);
    if (filter_user && filter_user.length > 0) {
      dataFilter._id = { $in: filter_user };
    }
    console.log(filter_user);
  }
  console.log(`start send notify to app mobile >>>>>`);
  do {
    listUser = await UserModel.find(dataFilter).skip(skip).limit(10);
    for await (const user of listUser) {
      await sendNotification(user);
    }

    await sleep(1000);
    skip += 10;
  } while (listUser.length > 0);
  console.log(`end send notify to app mobile <<<<<`);
};

const sendNotification = async (user) => {
  const { _id } = user;
  console.log(
    `check send notify to app mobile user: ${user?.displayName} - objId: ${_id}`
  );
  const listChildren = await ChildModel.find({
    parentId: _id,
  });
  let bodyNotification = '';
  let arrActivityId = [];
  for await (const children of listChildren) {
    const devices = await ActivityActions.getDevicesByChildren(
      children._id,
      'notify'
    );
    let countAccess = 0;
    if (devices.length > 0) {
      await Promise.all(
        devices.map((device: any) => {
          device.activity.map((item) => {
            if (
              item.activityType === 'WEB_SURF' ||
              item.activityType === 'APP'
            ) {
              arrActivityId.push(item._id);
              countAccess++;
            }
          });
        })
      );
      if (arrActivityId.length > 0) {
        bodyNotification =
          bodyNotification +
          `Tài khoản ${children?.fullname} đã truy cập ${countAccess} lần vào ứng dụng/website bị cấm. `;
      }
    }
  }
  if (bodyNotification) {
    const userId = user?.id;
    const topicName = `${SERVER_TYPE}.parent.safezone.user_${userId}`;
    const message: any = {
      notification: {
        title: 'Con bạn đã truy cập vào nội dung không được phép',
        body: bodyNotification,
      },
    };
    console.log(bodyNotification);
    await sendMessageToTopic(topicName, message);
    if (arrActivityId.length > 0) {
      await ActivityModel.updateMany(
        {
          _id: {
            $in: arrActivityId,
          },
        },
        {
          $set: {
            notifyMobileAccessToBlockedWebOrApps: true,
          },
        },
        {
          upsert: false,
        }
      );
    }
  } else {
    console.log('no push notification, bodyNotification null');
  }
};
