import { getDrive } from '@/lib/googleDrive'

export async function GET() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (!folderId) {
      return Response.json({ error: 'Missing folder ID' }, { status: 500 })
    }

    const drive = await getDrive()

    const resp = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id,name)',

      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })

    return Response.json({
      files: resp.data.files ?? [],
    })

  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}