import { SQSClient } from '@aws-sdk/client-sqs';

export const appSQSClient = new SQSClient({
  region: process.env.AWS_REGION,
});
