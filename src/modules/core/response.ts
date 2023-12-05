import type { APIGatewayProxyResult } from 'aws-lambda';

type Payload = Record<string | number, any> | string;

const baseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,api_key',
  'Access-Control-Allow-Credentials': true,
};

export const response = (
  payload: Payload,
  statusCode = 200
): APIGatewayProxyResult => {
  if (typeof payload === 'string') {
    return {
      statusCode,
      headers: baseHeaders,
      body: JSON.stringify({
        success: true,
        message: payload,
      }),
    };
  }

  return {
    statusCode,
    headers: baseHeaders,
    body: JSON.stringify({ success: true, ...payload }),
  };
};

export const success = response;

export const error = (
  payload: Payload,
  statusCode = 400
): APIGatewayProxyResult => {
  if (typeof payload === 'string') {
    return {
      statusCode,
      headers: baseHeaders,
      body: JSON.stringify({
        error: true,
        message: payload,
      }),
    };
  }

  // If it's mongoose validation error...
  if (payload?.name == 'ValidationError') {
    return {
      statusCode,
      headers: baseHeaders,
      body: JSON.stringify({
        error: true,
        message: payload._message,
        invalidFields: Object.keys(payload.errors),
      }),
    };
  }

  return {
    statusCode,
    headers: baseHeaders,
    body: JSON.stringify({
      error: true,
      ...payload,
    }),
  };
};
