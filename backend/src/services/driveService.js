import { google } from 'googleapis';
import User from '../models/User.js';

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(userId) {
  return getOAuthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    state: userId,
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });
}

export async function exchangeCodeForTokens(code) {
  const { tokens } = await getOAuthClient().getToken(code);
  return tokens;
}

export async function saveUserTokens(userId, tokens) {
  await User.findByIdAndUpdate(userId, { googleTokens: tokens });
}

export async function uploadFileToDrive(userId, fileName, mimeType, dataUrl) {
  const user = await User.findById(userId);
  if (!user?.googleTokens?.access_token) throw new Error('Drive not connected');

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(user.googleTokens);

  if (user.googleTokens.expiry_date && Date.now() > user.googleTokens.expiry_date) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await saveUserTokens(userId, credentials);
    oauth2Client.setCredentials(credentials);
  }

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const base64Data = dataUrl.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');

  const response = await drive.files.create({
    requestBody: { name: fileName, mimeType: mimeType },
    media: { mimeType: mimeType, body: buffer },
  });

  return response.data;
}

// --- NEW: List files from Drive ---
export async function listDriveFiles(userId) {
  const user = await User.findById(userId);
  if (!user?.googleTokens?.access_token) throw new Error('Drive not connected');

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(user.googleTokens);
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name, mimeType, webViewLink)',
    q: "mimeType contains 'image/'", // Only show image files
  });

  return response.data.files;
}

// --- NEW: Download a specific image from Drive ---
export async function downloadDriveFile(userId, fileId) {
  const user = await User.findById(userId);
  if (!user?.googleTokens?.access_token) throw new Error('Drive not connected');

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(user.googleTokens);
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  const buffer = Buffer.from(response.data);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}