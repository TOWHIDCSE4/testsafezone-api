import {
  totalWebsiteVisitTime,
  filterUsedApps,
  filterVisitedWebsites,
  countBlockedWebsites,
  totalAppUsageTime,
  timeFormat,
  getHexColorByIndex,
  sleep,
} from '@/modules/core';
import { SES } from 'aws-sdk';
import { UserModel } from '@/models/User';
import ActivityActions from '@/actions/activity';
import { createHandler, success, error, init } from '@/modules/core';
import { ChildModel } from '@/models/Child';
import { EmailTemplate, TemplateModel } from '@/models/Template';

var ses = new SES({ region: 'ap-southeast-1' });

export const apiDailyReport = createHandler(async () => {
  try {
    await dailyReport();

    return success(null);
  } catch (e) {
    return error(e);
  }
});

export const dailyReport = async () => {
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

  const activities = await ActivityActions.getActivitiesByChildren(
    children._id
  );
  if (activities.length > 0) {
    const totalTimeWebsite = totalWebsiteVisitTime(activities);
    const countBlockedWeb = countBlockedWebsites(activities);
    const usedApps = filterUsedApps(activities);
    const visitedWebsites = filterVisitedWebsites(activities);
    const socialNetworkWebsites = [
      // {
      //   total: totalTimeWebsite,
      //   type: 'WEB_SURF',
      //   activity: 'Trang web đã truy cập',
      // },
    ];
    const totalTimeApp = totalAppUsageTime(activities);
    const totalTime = totalTimeWebsite + totalTimeApp;
    const datasets = socialNetworkWebsites.concat(usedApps);
    const chco = [];
    const chd = [];
    datasets.forEach((element, index) => {
      const total = element.total || 0;
      const val = (total / totalTime) * 100;
      chd.push(val);

      const colorHex = getHexColorByIndex(index);
      chco.push(colorHex);
    });
    console.log(chco.join('%7C'));

    const template = await TemplateModel.findOne({
      code: EmailTemplate.DAILY_REPORT,
    });

    if (template) {
      let content = template.content;

      if (content) {
        content = content.replace(
          '${displayName}',
          `${username || displayName}`
        );
        content = content.replace('${totalTime}', `${timeFormat(totalTime)}`);

        let dataList = `<table style="width: 100%; word-break:break-word">`;
        datasets.forEach((element, index) => {
          const colorHex = getHexColorByIndex(index);
          dataList += `<tr>
                        <td style="width: 30px" align="left">
                          <span style="background-color:#${colorHex};display: inline-block;
                            width: 16px;
                            height: 16px;
                            border-radius: 50%;">
                        </td>
                        <td align="left">${element.activity}</td>
                        <td align="right" style="white-space: nowrap;">${timeFormat(
                          element.total
                        )}</td>
                      </tr>`;
        });
        dataList += `</table>`;

        content = content.replace('${data_list}', `${dataList}`);
        content = content.replace(
          '${chart}',
          `<img width="60%" height="60%" src="https://chart.apis.google.com/chart?chp=4.712&chf=bg,s,ffffff&chs=180x180&cht=p&chd=t:${chd.toString()}&chco=${chco.join(
            '%7C'
          )}" alt="pie_chart">`
        );
        content = content.replace('${count_blocked_web}', `${countBlockedWeb}`);

        let usedAppsList = `<table style="width: 100%; word-break:break-word; border-collapse: collapse; ">`;
        usedApps.forEach((element) => {
          usedAppsList += `<tr style="border-bottom: 1pt solid black;">
                            <td align="left" style="font-weight: normal;">${
                              element.activity
                            }</td>
                            <td align="right" style="white-space: nowrap;">${timeFormat(
                              element.total
                            )}</td>
                          </tr>`;
        });
        usedAppsList += `</table>`;

        content = content.replace('${used_apps_list}', `${usedAppsList}`);

        let visitedWebsiteList = `<table style="width: 100%; word-break:break-word; border-collapse: collapse; ">`;
        visitedWebsites.forEach((element) => {
          visitedWebsiteList += `<tr style="border-bottom: 1pt solid black;">
                        <td align="left" style="font-weight: normal;">${element.activity}</td>
                      </tr>`;
        });
        visitedWebsiteList += `</table>`;

        content = content.replace(
          '${visited_website_list}',
          `${visitedWebsiteList}`
        );

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
                template.title || `Báo cáo hàng ngày - ${children.fullname}`,
            },
          },
          Source: `SafeZone <${process.env.SES_EMAIL}>`,
        };

        try {
          await ses.sendEmail(emailParams).promise();
          // const arrActivityId = activities.map((item) => {
          //   if (item.activityType === 'WEB_SURF' || item.activityType === 'APP') {
          //     return item._id;
          //   }
          // });
          // await ActivityModel.updateMany(
          //   {
          //     _id: {
          //       $in: arrActivityId,
          //     },
          //   },
          //   {
          //     $set: {
          //       reportedDaily: true,
          //     },
          //   },
          //   {
          //     upsert: false,
          //   }
          // );
          console.log('MAIL SENT SUCCESSFULLY!!');
        } catch (e) {
          console.log('FAILURE IN SENDING MAIL!!', e);
        }
      }
    } else {
      let htmlData = `<!DOCTYPE html>
          <html>
          
          <head>
              <title>SafeZone</title>
          
              <!-- Style -->
              <style>
                  .sz-bg-f8fafd {
                      background-color: #f8fafd
                  }
          
                  .sz-color-36383b {
                      color: #36383b
                  }
          
                  .sz-w-100 {
                      width: 100%;
                  }
          
                  .sz-text-center {
                      text-align: center;
                  }
          
                  .sz-color-3b9e8a {
                      color: #3b9e8a;
                  }
          
                  .sz-bg-white {
                      background-color: white;
                  }
          
                  .sz-m-auto {
                      margin: auto;
                  }
          
                  .sz-bg-eff3f6 {
                      background-color: #eff3f6;
                  }
          
                  .sz-color-white {
                      color: white;
                  }
          
                  .sz-bg-3b9e8a {
                      background-color: #3b9e8a;
                  }
          
                  .sz-p-24 {
                      padding: 24px;
                  }
          
                  .sz-p-16 {
                      padding: 16px;
                  }
          
                  .sz-font-weight-bold {
                      font-weight: bold;
                  }
          
                  .sz-w-30 {
                      width: 30%;
                  }
          
                  .sz-d-flex {
                      display: flex;
                  }
          
                  .sz-w-70 {
                      width: 70%;
                  }
          
                  .sz-pr-10 {
                      padding-right: 10%;
                  }
          
                  .sz-ml-auto {
                      margin-left: auto;
                  }
          
                  .sz-table-fixed {
                      table-layout: fixed;
                      width: 100%;
                  }

                  @media only screen and (max-width: 768px) {
                    /* For mobile phones: */
                    .sz-mobile-width {
                      width: 100% !important;
                    }

                    .sz-mobile-d-block {
                      display: block !important;
                    }

                    .sz-mobile-p-0 {
                      padding: 0 !important;
                    }

                    .sz-mobile-mb-15 {
                      margin-bottom: 15px !important;
                    }
                  }
              </style>
          </head>
          
          <body>
              <div class="sz-w-100 sz-bg-f8fafd sz-color-36383b sz-text-center">
                  <h1 class="sz-color-3b9e8a">SafeZone</h1>
                  <div class="sz-bg-white sz-m-auto sz-mobile-width" style="width: 80%">
                      <div class="sz-p-24">
                          <h2 class="sz-m-auto sz-p-16">${
                            username || displayName
                          }</h2>
                          <h2 class="sz-m-auto sz-p-16">${timeFormat(
                            totalTime
                          )}</h2>
                      </div>
                  </div>
                  <div class="sz-m-auto sz-font-weight-bold sz-mobile-width" style="width: 80%">
                      <div class="sz-bg-eff3f6 sz-p-16">
                          Tóm tắt hoạt động
                      </div>
                      <div class="sz-bg-white sz-p-24">
                          <table style="width: 100%">
                              <tr>
                                  <td class="sz-mobile-width" style="width: 60%; ">
                                      <table style="width: 100%; word-break:break-word">`;
      datasets.forEach((element, index) => {
        const colorHex = getHexColorByIndex(index);
        htmlData += `<tr>
                                        <td style="width: 30px" align="left"><span style="background-color:#${colorHex};display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 50%;">
                                        </td>
                                        <td align="left">${
                                          element.activity
                                        }</td>
                                        <td align="right" style="white-space: nowrap;">${timeFormat(
                                          element.total
                                        )}</td>
                                    </tr>`;
      });
      htmlData += `</table>
                                  </td>
                                  <td style="width: 40%;">
                                      <img width="60%" height="60%" src="https://chart.apis.google.com/chart?chp=4.712&chf=bg,s,ffffff&chs=180x180&cht=p&chd=t:${chd.toString()}&chco=${chco.join(
        '%7C'
      )}" alt="pie_chart">
                                  </td>
                              </tr>
                              <tr class="sz-mobile-d-block" style="display: none">
                                  <td>
                                  </td>
                                  <td class="sz-mobile-width">
                                      <img width="60%" height="60%" src="https://chart.apis.google.com/chart?chp=4.712&chf=bg,s,ffffff&chs=180x180&cht=p&chd=t:${chd.toString()}&chco=${chco.join(
        '%7C'
      )}" alt="pie_chart">
                                  </td>
                              </tr>
                          </table>
          
                          <div style="text-align: center; margin-top: 20px;">
                              <a href="https://dashboard.safezone.com.vn/" target="_blank" style=" padding: 15px;
                              display: inline-block; 
              background-color: #3b9e8a;
              color: white;
              font-weight: bold;
              border: 1px solid #3b9e8a;
              text-decoration:none;
              border-radius: 6px;" type="button">Tới SafeZone</a>
                          </div>
          
                          <div style="background-color: #eff3f6; border-radius: 6px; text-align: left; padding: 20px; margin-top: 50px">
                              <h3 style="margin: 0">Hoạt động bị chặn</h3>
                              <hr>
                              <p style="margin: 0; padding: 10px">
                                  ${countBlockedWeb} Website
                              </p>
                          </div>
          
                          <div class="sz-mobile-d-block" style="width: 100%; display: flex; margin-top: 30px;">
                              <div class="sz-mobile-width sz-mobile-p-0 sz-mobile-mb-15" style="width: 50%; padding-right: 10px; display: flex">
                                  <div style="width: 100%; text-align: left; border:1px solid rgba(0,0,0,0.1); border-radius:8px; padding: 10px 10px 50px 10px;">
                                      <h3 style="margin-top: 0;">Ứng dụng đã sử dụng</h3>
                                      <table style="width: 100%; word-break:break-word; border-collapse: collapse; ">`;
      usedApps.forEach((element) => {
        htmlData += `<tr style="border-bottom: 1pt solid black;">
                                            <td align="left" style="font-weight: normal;">${
                                              element.activity
                                            }</td>
                                            <td align="right" style="white-space: nowrap;">${timeFormat(
                                              element.total
                                            )}</td>
                                        </tr>`;
      });
      htmlData += `</table>
                                  </div>
                              </div>
                              <div class="sz-mobile-width sz-mobile-p-0" style="width: 50%; padding-left: 10px; display: flex">
                                  <div style="width: 100%; text-align: left; border:1px solid rgba(0,0,0,0.1); border-radius:8px; padding: 10px 10px 50px 10px;">
                                      <h3 style="margin-top: 0;">Trang web đã truy cập</h3>
                                      <table style="width: 100%; word-break:break-word; border-collapse: collapse; ">`;
      visitedWebsites.forEach((element) => {
        htmlData += `<tr style="border-bottom: 1pt solid black;">
                                              <td align="left" style="font-weight: normal;">${element.activity}</td>
                                          </tr>`;
      });
      htmlData += `</table>
                                  </div>
                              </div>
                          </div>
          
                          <div style="padding: 50px 20px 20px 20px;">
                              Cần điều chỉnh cài đặt ?
                          </div>
          
                          <div style="text-align: center; margin: 20px 0 100px 0;">
                              <a href="https://dashboard.safezone.com.vn/" target="_blank" style="padding: 15px;
                              display: inline-block;
              background-color: #3b9e8a;
              color: white;
              font-weight: bold;
              border: 1px solid #3b9e8a;
              text-decoration:none;
              border-radius: 6px;" type="button">Tới SafeZone</a>
                          </div>
                      </div>
                  </div>
              </div>
          </body>
          
          </html>`;

      const emailParams = {
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Body: {
            Html: { Data: htmlData },
          },
          Subject: { Data: `Báo cáo hàng ngày - ${children.fullname}` },
        },
        Source: `SafeZone <${process.env.SES_EMAIL}>`,
      };

      try {
        await ses.sendEmail(emailParams).promise();
        // const arrActivityId = activities.map((item) => {
        //   if (item.activityType === 'WEB_SURF' || item.activityType === 'APP') {
        //     return item._id;
        //   }
        // });
        // await ActivityModel.updateMany(
        //   {
        //     _id: {
        //       $in: arrActivityId,
        //     },
        //   },
        //   {
        //     $set: {
        //       reportedDaily: true,
        //     },
        //   },
        //   {
        //     upsert: false,
        //   }
        // );
        console.log('MAIL SENT SUCCESSFULLY!!');
      } catch (e) {
        console.log('FAILURE IN SENDING MAIL!!', e);
      }
    }
  }
};
