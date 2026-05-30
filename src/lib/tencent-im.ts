import crypto from 'crypto';
import zlib from 'zlib';

/**
 * Generate Tencent Cloud IM UserSig (TLSSigAPIv2)
 * Official algorithm per: https://cloud.tencent.com/document/product/269/32688
 *
 * Steps:
 * 1. Build the TLS sig document as JSON
 * 2. Deflate (zlib) the JSON string
 * 3. Base64-URL-encode the compressed bytes → "sig"
 * 4. HMAC-SHA256(sig, secretKey) → "signature"
 * 5. Base64-URL-encode the signature
 * 6. Return "sig.signature"
 */
export function generateUserSig(
  sdkAppId: string,
  secretKey: string,
  userId: string,
  expireSeconds: number = 86400 * 180
): string {
  const currTime = Math.floor(Date.now() / 1000);
  const sigDoc = {
    'TLS.ver': '2.0',
    'TLS.identifier': userId,
    'TLS.sdkappid': Number(sdkAppId),
    'TLS.expire': expireSeconds,
    'TLS.time': currTime,
  };

  // Step 2: deflate the JSON
  const compressed = zlib.deflateSync(Buffer.from(JSON.stringify(sigDoc)));

  // Step 3: base64-url-encode the compressed bytes
  const sig = base64UrlEncode(compressed);

  // Step 4: HMAC-SHA256 sign the sig
  const hmac = crypto.createHmac('sha256', secretKey).update(sig).digest();

  // Step 5 & 6: base64-url-encode the signature, concatenate
  return sig + '.' + base64UrlEncode(hmac);
}

function base64UrlEncode(data: Buffer): string {
  return data
    .toString('base64')
    .replace(/\+/g, '*')
    .replace(/\//g, '-')
    .replace(/=/g, '_');
}
