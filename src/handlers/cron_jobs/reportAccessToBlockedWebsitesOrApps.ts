import { sleep } from '@/modules/core';
import { SES } from 'aws-sdk';
import { UserModel } from '@/models/User';
import dayjs from 'dayjs';
import ActivityActions from '@/actions/activity';
import { ActivityModel } from '@/models/Child/Activity';
import { createHandler, success, error, init } from '@/modules/core';
import { ChildModel } from '@/models/Child';
import { EmailTemplate, TemplateModel } from '@/models/Template';

var ses = new SES({ region: 'ap-southeast-1' });

export const apiReportAccessToBlockedWebsitesOrApps = createHandler(
  async () => {
    try {
      await reportAccessToBlockedWebsitesOrApps();

      return success(null);
    } catch (e) {
      return error(e);
    }
  }
);

export const reportAccessToBlockedWebsitesOrApps = async () => {
  await init();
  let skip = 0;
  let listUser = [];

  do {
    listUser = await UserModel.find({ email: { $exists: true } })
      .skip(skip)
      .limit(10);

    for (const user of listUser) {
      sendMail(user);
    }

    await sleep(1000);
    skip += 10;
  } while (listUser.length > 0);
};

const sendMail = async (user) => {
  const { _id } = user;
  const listChildren = await ChildModel.find({
    parentId: _id,
  });
  for (const children of listChildren) {
    sendByChildren(user, children);
  }
};

const sendByChildren = async (user, children) => {
  const { username = '', displayName = '', email } = user;

  const devices = await ActivityActions.getDevicesByChildren(children._id, 'mail');
  if (devices.length > 0) {
    const template = await TemplateModel.findOne({
      code: EmailTemplate.REPORT_ACCESS_TO_BLOCKED_WEBSITES_OR_APPS,
    });

    if (template) {
      let content = template.content;

      if (content) {
        content = content.replace(
          '${displayName}',
          `${username || displayName}`
        );

        let listDevices = '';
        devices.forEach((device) => {
          listDevices += `<h4>${device?._id?.deviceName}</h4>`;

          device.activity.forEach((item) => {
            listDevices += `<p>
                              <b style="color: #6161ff">${
                                item.activityDisplayName
                              }</b> đã bị chặn lúc ${dayjs(
              item.activityTimeStart
            )
              .add(7, 'hour')
              .format('HH:mm YYYY-MM-DD')}
                              <span style="display: inline-block; background-color: #ff0000; color: white; padding: 6px 12px; border-radius: 6px;">${
                                item.activityType == 'APP'
                                  ? 'Ứng dụng'
                                  : 'Trang web'
                              }</span>
                            </p>`;
          });
        });

        content = content.replace('${listDevices}', `${listDevices}`);

        const emailParams = {
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Body: {
              Html: { Data: content },
            },
            Subject: {
              Data:
                template.title ||
                `Cảnh báo vào trang web, ứng dụng bị chặn - ${children.fullname}`,
            },
          },
          Source: `SafeZone <${process.env.SES_EMAIL}>`,
        };

        try {
          await ses.sendEmail(emailParams).promise();
          let arrActivityId = [];
          await Promise.all(
            devices.map((device) => {
              const arr = device.activity.map((item) => {
                if (
                  item.activityType === 'WEB_SURF' ||
                  item.activityType === 'APP'
                ) {
                  return item._id;
                }
              });
              arrActivityId = arrActivityId.concat(arr);
            })
          );
          await ActivityModel.updateMany(
            {
              _id: {
                $in: arrActivityId,
              },
            },
            {
              $set: {
                reportedAccessingToBlockedWebsitesOrApps: true,
              },
            },
            {
              upsert: false,
            }
          );
          console.log('MAIL SENT SUCCESSFULLY!!');
        } catch (e) {
          console.log('FAILURE IN SENDING MAIL!!', e);
        }
      }
    } else {
      let htmlData = `<div style="text-align: left; width: 80%; margin: auto">
              <h1 style="text-align: center">Cảnh báo gần đây cho hoạt động bị chặn</h1>
              <div>Xin chào <b>${
                username || displayName
              }</b>, có một số hoạt động trên các thiết bị:</div>`;

      devices.forEach((device) => {
        htmlData += `<h4>${device?._id?.deviceName}</h4>`;

        device.activity.forEach((item) => {
          htmlData += `<p>
                  <b style="color: #6161ff">${
                    item.activityDisplayName
                  }</b> đã bị chặn lúc ${dayjs(item.activityTimeStart)
            .add(7, 'hour')
            .format('HH:mm YYYY-MM-DD')}
                  <span style="display: inline-block; background-color: #ff0000; color: white; padding: 6px 12px; border-radius: 6px;">${
                    item.activityType == 'APP' ? 'Ứng dụng' : 'Trang web'
                  }</span>
                  </p>`;
        });
      });

      htmlData += `<div style="margin-top: 50px; margin-bottom: 30px">Để xem lại tất cả các hoạt động, truy cập liên kết bên dưới:</div>
              <div style="text-align: center">
                <a href="https://dashboard.safezone.com.vn/" target="_blank" style="padding: 15px;
                                  display: inline-block;
                  background-color: #6161ff;
                  color: white;
                  font-weight: bold;
                  border: 1px solid #6161ff;
                  text-decoration:none;
                  border-radius: 6px;" type="button">Xem tất cả hoạt động</a>
              </div>
            </div>`;

      const emailParams = {
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Body: {
            Html: { Data: htmlData },
          },
          Subject: {
            Data: `Cảnh báo vào trang web, ứng dụng bị chặn - ${children.fullname}`,
          },
        },
        Source: `SafeZone <${process.env.SES_EMAIL}>`,
      };

      try {
        await ses.sendEmail(emailParams).promise();
        let arrActivityId = [];
        await Promise.all(
          devices.map((device) => {
            const arr = device.activity.map((item) => {
              if (
                item.activityType === 'WEB_SURF' ||
                item.activityType === 'APP'
              ) {
                return item._id;
              }
            });
            arrActivityId = arrActivityId.concat(arr);
          })
        );
        await ActivityModel.updateMany(
          {
            _id: {
              $in: arrActivityId,
            },
          },
          {
            $set: {
              reportedAccessingToBlockedWebsitesOrApps: true,
            },
          },
          {
            upsert: false,
          }
        );
        console.log('MAIL SENT SUCCESSFULLY!!');
      } catch (e) {
        console.log('FAILURE IN SENDING MAIL!!', e);
      }
    }
  }
};
