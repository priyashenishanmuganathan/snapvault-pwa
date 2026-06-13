import { useState } from "react";
import { getReceipts } from "../firebase/receiptService";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export default function AIChat() {

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const askAI = async () => {

    try {

      setLoading(true);

      const receipts =
        await getReceipts();

      const receiptData =
        JSON.stringify(receipts);

      const prompt = `
You are SnapVault AI Financial Assistant.

User Receipts:

${receiptData}

User Question:

${question}

Answer naturally and professionally.

If possible provide useful financial advice.
`;

      const response =
        await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

      setAnswer(
        response.text
      );

    } catch (error) {

      console.error(error);

      setAnswer(
        "Failed to generate response."
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="p-6 max-w-5xl mx-auto text-white">

      <h1 className="text-5xl font-bold mb-2">
        AI Financial Assistant
      </h1>

      <p className="text-slate-400 mb-8">
        Ask questions about your spending
      </p>

      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">

        <textarea
          value={question}
          onChange={(e) =>
            setQuestion(
              e.target.value
            )
          }
          placeholder="How much did I spend on food?"
          className="
            w-full
            h-32
            bg-black/20
            border
            border-white/10
            rounded-2xl
            p-4
            text-white
          "
        />

        <button
          onClick={askAI}
          className="
            mt-4
            bg-violet-600
            hover:bg-violet-500
            px-6
            py-3
            rounded-2xl
          "
        >
          Ask AI
        </button>

      </div>

      {loading && (

        <div className="mt-6">
          🤖 Analyzing spending...
        </div>

      )}

      {answer && (

        <div
          className="
            mt-6
            bg-white/5
            border
            border-violet-500/20
            rounded-3xl
            p-6
            whitespace-pre-wrap
          "
        >
          {answer}
        </div>

      )}

    </div>
  );
}