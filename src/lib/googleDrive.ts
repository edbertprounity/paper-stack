import { google } from 'googleapis'

export function getDrive() {
  const client_email = process.env.GOOGLE_CLIENT_EMAIL
  const private_key = process.env.GOOGLE_PRIVATE_KEY

  if (!client_email || !private_key) {
    throw new Error('Missing Google service account credentials')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email,
      private_key: private_key.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  return google.drive({
    version: 'v3',
    auth,
  })
}