import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export const analyzeReceipt = async (ocrText) => {

  const prompt = `
You are a receipt extraction AI.

OCR TEXT:
${ocrText}

Extract:

- merchant
- amount
- date
- category

Available Categories:
Food
Transport
Shopping
Groceries
Healthcare
Bills
Entertainment
Education
Others

Return ONLY valid JSON.

Example:

{
  "merchant": "KFC",
  "amount": 25.90,
  "date": "2026-06-13",
  "category": "Food"
}
`;

  const response =
    await ai.models.generateContent({

      model: "gemini-3.5-flash",

      contents: prompt,

    });

  const text =
    response.text;

  const match =
    text.match(/\{[\s\S]*\}/);

  if (!match) {

    throw new Error(
      "No JSON returned by Gemini"
    );
  }

  return JSON.parse(
    match[0]
  );
};