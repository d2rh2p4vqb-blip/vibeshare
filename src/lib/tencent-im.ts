import crypto from 'crypto';

/**
 * Generate Tencent Cloud IM UserSig (TLSSigAPIv2)
 * Based on official Tencent Cloud IM documentation
 */
export function generateUserSig(
  sdkAppId: string,
  secretKey: string,
  userId: string,
  expireSeconds: number = 86400 * 180
): string {
  const current = Math.floor(Date.now() / 1000);
  const obj = {
    'TLS.ver': '2.0',
    'TLS.identifier': userId,
    'TLS.sdkappid': Number(sdkAppId),
    'TLS.expire': expireSeconds,
    'TLS.time': current,
  };

  const sig = hmacsha256(
    Buffer.from(JSON.stringify(obj)),
    Buffer.from(secretKey, 'utf8')
  );

  return base64urlEncode(
    Buffer.concat([Buffer.from(JSON.stringify(obj)), Buffer.from(':'), sig])
  );
}

function hmacsha256(data: Buffer, key: Buffer): Buffer {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function base64urlEncode(data: Buffer): string {
  return data
    .toString('base64')
    .replace(/\+/g, '*')
    .replace(/\//g, '-')
    .replace(/=/g, '_');
}
