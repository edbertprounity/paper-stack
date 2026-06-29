import { extractText } from "unpdf"

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer)
  const { text } = await extractText(uint8Array, { mergePages: true })
  return text
}