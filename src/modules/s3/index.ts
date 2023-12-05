import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromBuffer } from 'file-type';
import { S3_KEY_BASE } from './config';

const ALLOW_EXTENSIONS = ['jpg', 'png', 'jpeg', 'webp', 'bmp'];

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    sessionToken: process.env.AWS_SESSION_TOKEN,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * @param image Base64 image
 */
export const uploadImage = async (
  image: string,
  userId: string,
  filename: string
) => {
  const maybeBase64 = image.split(',')[1];

  const imageBuffer = Buffer.from(maybeBase64 || image, 'base64');
  const { ext, mime } = (await fromBuffer(imageBuffer)) || {};

  if (!ext || !mime || !imageBuffer)
    return Promise.reject('Invalid upload file!');

  if (!ALLOW_EXTENSIONS.includes(ext))
    return Promise.reject('Extension not allowed');

  const Key = `${S3_KEY_BASE}/${userId}/${filename}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_PUBLIC_BUCKET_NAME,
      Key,
      Body: imageBuffer,
    })
  );

  return process.env.S3_PUBLIC_BUCKET_DOMAIN + '/' + Key;
};
