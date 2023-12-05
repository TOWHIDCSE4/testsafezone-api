import { CustomMessageTriggerHandler } from 'aws-lambda';

export const customMessage: CustomMessageTriggerHandler = (
  event,
  _context,
  callback
) => {
  console.log(event);
  // check event type
  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    // customize message and subject content
    // event.response.smsMessage =
    // 'Welcome to the service. Your confirmation code is ' +
    // event.request.codeParameter;

    event.response.emailSubject = 'SafeZone - Quên mật khẩu';
    event.response.emailMessage =
      event.request.codeParameter + ' là mã để khôi phục mật khẩu';
  }

  if (event.triggerSource === 'CustomMessage_SignUp') {
    const completeRegisterUrl =
      process.env.AWS_GATEWAY_API_URL +
      `/v1/auth/verify?code=${event.request.codeParameter}&` +
      new URLSearchParams({
        username: event.userName,
        redirectToDashboard: '1',
      });

    event.response.emailSubject = 'SafeZone - Xác nhận đăng ký';
    event.response.emailMessage = `Chào bạn.<br/><br/>Cảm ơn bạn đã đăng ký sử dụng SafeZone, để hoàn tất quá trình đăng ký và xác thực email, vui lòng bấm <a href="${completeRegisterUrl}">vào đây</a>.`;
  }

  return callback(null, event);
};
