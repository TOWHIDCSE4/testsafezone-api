import https from 'https';

interface ExtraOptions {
  query?: Record<any, any>;
}

type IncomingMessage = Parameters<Parameters<typeof https.get>[2]>[0];

export const httpsGet = (
  url: Parameters<typeof https.get>[0],
  { query, ...options }: https.RequestOptions & ExtraOptions = {}
) => {
  return new Promise<IncomingMessage>((resolve, reject) => {
    try {
      const queryStr = query ? `?${new URLSearchParams(query)}` : null;
      https.get(url + queryStr, options, (res) => resolve(res));
    } catch (e) {
      reject(e);
    }
  });
};
