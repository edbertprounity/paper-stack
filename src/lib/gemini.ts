import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function getFeedback(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
You are an education assistant.

Evaluate this question and give feedback:
Return:
- quality score (0-10)
- explanation
- improvements

TEXT:
${text.slice(0, 8000)}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (err) {
    console.log("Gemini error:", err)
    return null
  }
}