import { getDrive } from '@/lib/googleDrive'

export async function GET(req: Request): Promise<Response> {
  try {
    const folder_id = process.env.GOOGLE_DRIVE_FOLDER_ID || process.env.GOOGLE_FOLDER_ID

    if (!folder_id) {
      return Response.json({ error: 'Missing GOOGLE_DRIVE_FOLDER_ID environment variable.' }, { status: 500 })
    }

    const drive = await getDrive()

    const files: any[] = []
    let pageToken: string | undefined = undefined

    do {
        //@ts-ignore
      const resp = await drive.files.list({
        q: `'${folder_id}' in parents and trashed = false`,
        pageSize: 1000,
        pageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, description, appProperties)'
      })

      if (resp.data.files && resp.data.files.length) {
        files.push(...resp.data.files)
      }

      pageToken = resp.data.nextPageToken || undefined
    } while (pageToken)

    return Response.json({ success: true, count: files.length, files })
  } catch (err: any) {
    console.error('Drive list error:', err)
    return Response.json({ error: String(err?.message || err) }, { status: 500 })
  }
}
