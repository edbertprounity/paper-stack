export const runtime = "nodejs"
import { getDrive } from "@/lib/googleDrive"
import { Readable } from "stream"
import { getPayloadClient } from '@/payload'
import { getFeedback } from "@/lib/gemini"
import { extractPdfText } from "@/lib/pdf"

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
    let text = ""

    try {
      text = await extractPdfText(buffer)
      console.log("PDF TEXT LENGTH:", text.length)
    } catch (err) {
      console.log("PDF parse failed:", err)
    }
    let feedback = null

    try {
      if (text && text.length > 0) {
        feedback = await getFeedback(text)
        console.log("GEMINI FEEDBACK:", feedback)
      }
    } catch (err) {
      console.log("Gemini failed:", err)
    }

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
      fields: 'id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,createdTime',
    })
    // Create a record in Payload `media` collection to store metadata
    try {
      // payload should be initialized by @payloadcms/next in this environment; if not, this will throw.
      // Build payload data as `any` to avoid excess-property checks against the Media type
      const payloadData: any = {
        alt: file.name,
        // keep original name as a custom field; cast to `any` so TS won't error if Media type differs
        name: response.data.name || file.name,
        driveId: response.data.id,
        mimeType: response.data.mimeType || file.type,
        size: response.data.size ? Number(response.data.size) : buffer.length,
        url: response.data.webViewLink || response.data.webContentLink || '',
        description: `Uploaded via API on ${new Date().toISOString()} \nGEMINI FEEDBACK: ${feedback}`,
      }

      const payload = await getPayloadClient()

      const doc = await payload.create({
        collection: 'media',
        data: payloadData,
      })
      return Response.json({
        success: true,
        message: 'File uploaded and metadata saved',
        file: response.data,
        mediaRecord: doc,
      })
    } catch (dbError: any) {
      console.error('Payload save error:', dbError)
      // Return upload success but indicate metadata save failure
      return Response.json({
        success: true,
        message: 'File uploaded but saving metadata failed',
        file: response.data,
        metadataError: String(dbError?.message || dbError),
      })
    }
  } catch (error: any) {
    console.error('Drive upload error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}