import { useState } from "react";
import { getReceipts } from "../firebase/receiptService";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export default function AIChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // List of simple sample questions the user can tap
  const quickQuestions = [
    "How much did I spend on food?",
    "What is my highest expense?",
    "Give me tips to save money this month",
    "Show me a summary of my categories"
  ];

  const askAI = async (selectedQuestion) => {
    // Use the tapped suggestion or the text in the textbox
    const activeQuestion = typeof selectedQuestion === "string" ? selectedQuestion : question;
    
    if (!activeQuestion.trim()) {
      alert("Please enter a question or choose a suggestion first.");
      return;
    }

    try {
      setLoading(false);
      setAnswer("");
      setLoading(true);

      if (typeof selectedQuestion === "string") {
        setQuestion(selectedQuestion);
      }

      const receipts = await getReceipts();
      const receiptData = JSON.stringify(receipts);

      const prompt = `
You are SnapVault AI Financial Assistant.

User Receipts:
${receiptData}

User Question:
${activeQuestion}

Answer naturally and professionally.
If possible provide useful financial advice.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      setAnswer(response.text);
    } catch (error) {
      console.error(error);
      setAnswer("Failed to generate response.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setQuestion("");
    setAnswer("");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-white animate-fade-in">
      
      {/* Headings kept exactly like your original layout */}
      <h1 className="text-5xl font-bold mb-2">AI Financial Assistant</h1>
      <p className="text-slate-400 mb-8">Ask questions about your spending</p>

      {/* Quick Suggestions Track */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Suggested Questions</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q, index) => (
            <button
              key={index}
              onClick={() => askAI(q)}
              disabled={loading}
              className="text-xs bg-white/5 border border-white/10 hover:border-violet-500/40 hover:bg-white/10 px-3 py-2 rounded-xl transition duration-200 disabled:opacity-50"
            >
              💡 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Input Box Container */}
      <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="How much did I spend on food?"
          className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={askAI}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-violet-600/20 active:scale-[0.98] transition disabled:opacity-50"
          >
            Ask AI
          </button>
          
          {(question || answer) && (
            <button
              onClick={clearChat}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-3 rounded-2xl transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading Block State */}
      {loading && (
        <div className="mt-6 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-300 animate-pulse">
          🤖 Analyzing spending... Please wait.
        </div>
      )}

      {/* AI Answer Response Markdown Screen Display */}
      {answer && !loading && (
        <div className="mt-6 bg-white/5 border border-violet-500/20 rounded-3xl p-6 whitespace-pre-wrap leading-relaxed text-slate-200 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
            <span className="text-xl">✨</span>
            <h3 className="font-bold text-violet-400">SnapVault Response Agent</h3>
          </div>
          <p className="text-base">{answer}</p>
        </div>
      )}

    </div>
  );
}