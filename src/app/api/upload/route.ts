import { getDrive } from "@/lib/googleDrive"
import { Readable } from "stream"

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return Response.json({ error: "No file found in request" }, { status: 400 })
    }

    // Use consistent environment variable names
    const folder_id = process.env.GOOGLE_DRIVE_FOLDER_ID || process.env.GOOGLE_FOLDER_ID

    if (!folder_id) {
      return Response.json(
        { error: 'Missing GOOGLE_DRIVE_FOLDER_ID environment variable.' },
        { status: 500 },
      )
    }

    const drive = await getDrive()

    // Stream the file content
    const buffer = Buffer.from(await file.arrayBuffer())

    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folder_id],
      },
      media: {
        mimeType: file.type || 'application/octet-stream',
        body: Readable.from(buffer),
      },
      supportsAllDrives: true, // Crucial for Shared Drives
      fields: 'id',
    })

    return Response.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: response.data.id,
    })
  } catch (error: any) {
    console.error('Drive upload error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}