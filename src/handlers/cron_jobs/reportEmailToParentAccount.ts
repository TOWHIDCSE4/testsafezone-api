import { SES } from 'aws-sdk';
const ses = new SES({ region: 'ap-southeast-1' });

export const reportEmailToParentAccount = async () => {
  console.log('>>> reportEmailToParentAccount');
  const emailParams = {
    Destination: {
      ToAddresses: ['hieutm1999@gmail.com'],
    },
    Message: {
      Body: {
        Html: { Data: '<h1>Sample Body</h1>' },
      },
      Subject: { Data: 'Sample Subject' },
    },
    Source: process.env.SES_EMAIL,
  };

  try {
    await ses.sendEmail(emailParams).promise();
    console.log('MAIL SENT SUCCESSFULLY!!');
  } catch (e) {
    console.log('FAILURE IN SENDING MAIL!!', e);
  }
};
