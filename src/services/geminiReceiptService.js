import { GoogleGenerativeAI }
  from "@google/generative-ai";

const genAI =
  new GoogleGenerativeAI(
    import.meta.env.VITE_GEMINI_API_KEY
  );

export const analyzeReceipt =
  async (ocrText) => {

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.0-flash"
      });

    const prompt = `
You are a receipt extraction AI.

OCR TEXT:
${ocrText}

Extract:
- merchant
- final amount paid
- date
- category

Return ONLY JSON.
`;

    const result =
      await model.generateContent(
        prompt
      );

    return result.response.text();
};