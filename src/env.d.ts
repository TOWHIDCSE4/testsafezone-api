declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string;
    SLS_MONGODB_URI: string;
    AWS_REGION: string;
    AWS_COGNITO_REGION: string;
    AWS_COGNITO_USER_POOL_ID: string;
    AWS_COGNITO_APP_CLIENT_ID: string;
    ZVELO_CLOUD_USERNAME: string;
    ZVELO_CLOUD_PASSWORD: string;
    AWS_GATEWAY_API_URL: string;
    APPOTA_PARTNER_CODE: string;
    APPOTA_API_KEY: string;
    APPOTA_SECRET_KEY: string;
    APPOTA_ENDPOINT: string;
    S3_PUBLIC_BUCKET_NAME: string;
    S3_PUBLIC_BUCKET_DOMAIN: string;
    SAFE_ZONE_PORTAL_URL: string;
    SERVER_TYPE: string;
  }
}
