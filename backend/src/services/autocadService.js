import axios from 'axios';

const APS_HOST = 'https://developer.api.autodesk.com';
let cachedToken = null;

export async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;
  if (!process.env.APS_CLIENT_ID || !process.env.APS_CLIENT_SECRET) {
    throw new Error('APS_CLIENT_ID/APS_CLIENT_SECRET are not set in backend/.env');
  }
  const res = await axios.post(
    `${APS_HOST}/authentication/v2/token`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.APS_CLIENT_ID,
      client_secret: process.env.APS_CLIENT_SECRET,
      scope: 'data:read data:write data:create bucket:create bucket:read viewables:read',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  cachedToken = { token: res.data.access_token, expiresAt: Date.now() + res.data.expires_in * 1000 };
  return cachedToken.token;
}

async function ensureBucket(token) {
  const bucketKey = process.env.APS_BUCKET_KEY;
  if (!bucketKey) throw new Error('APS_BUCKET_KEY is not set in backend/.env');
  try {
    await axios.post(`${APS_HOST}/oss/v2/buckets`, { bucketKey, policyKey: 'transient' }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  } catch (err) {
    if (err.response?.status !== 409) throw err;
  }
  return bucketKey;
}

async function uploadObject(token, bucketKey, objectKey, buffer) {
  const signed = await axios.get(`${APS_HOST}/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3upload?parts=1`, { headers: { Authorization: `Bearer ${token}` } });
  const { uploadKey, urls } = signed.data;
  await axios.put(urls[0], buffer, { headers: { 'Content-Type': 'application/octet-stream' } });
  const complete = await axios.post(`${APS_HOST}/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3upload`, { uploadKey }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  return complete.data.objectId;
}

function toUrn(objectId) {
  return Buffer.from(objectId).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export async function importDrawing(buffer, filename) {
  const token = await getAccessToken();
  const bucketKey = await ensureBucket(token);
  const objectKey = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const objectId = await uploadObject(token, bucketKey, objectKey, buffer);
  const urn = toUrn(objectId);
  await axios.post(`${APS_HOST}/modelderivative/v2/designdata/job`, { input: { urn }, output: { formats: [{ type: 'svf', views: ['2d'] }] } }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  return { urn };
}

export async function getTranslationStatus(urn) {
  const token = await getAccessToken();
  const res = await axios.get(`${APS_HOST}/modelderivative/v2/designdata/${urn}/manifest`, { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true });
  if (res.status === 404) return { status: 'pending' };
  return { status: res.data.status, progress: res.data.progress };
}

/* -------- THIS IS THE FUNCTION NODE IS CRYING ABOUT --------- */
export async function getThumbnail(urn) {
  const token = await getAccessToken();
  const res = await axios.get(`${APS_HOST}/modelderivative/v2/designdata/${urn}/thumbnail`, { headers: { Authorization: `Bearer ${token}` }, params: { width: 400, height: 400 }, responseType: 'arraybuffer' });
  return Buffer.from(res.data).toString('base64');
}