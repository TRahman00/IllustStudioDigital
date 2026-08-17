import { google } from 'googleapis';

export function getOAuthClient() {
  return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
}
export function getAuthUrl() {
  return getOAuthClient().generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/drive.file'] });
}