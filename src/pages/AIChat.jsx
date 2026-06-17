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

  const quickQuestions = [
    "How much did I spend on food?",
    "What is my highest expense?",
    "Give me tips to save money this month",
    "Show me a summary of my categories"
  ];

  const askAI = async (selectedQuestion) => {
    const activeQuestion = typeof selectedQuestion === "string" ? selectedQuestion : question;
    
    if (!activeQuestion.trim()) {
      alert("Please enter a question or choose a suggestion first.");
      return;
    }

    try {
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
    } finally { // <-- Fixed from "final" to "finally"
      setLoading(false);
    }
  };

  const clearChat = () => {
    setQuestion("");
    setAnswer("");
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 pb-24">
      
      {/* View Header Row */}
      <header className="border-b border-zinc-900 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">AI Financial Assistant</h1>
        <p className="text-xs text-zinc-400 mt-1">Ask questions about your spending logs and categories</p>
      </header>

      {/* Main Two-Column Conversational Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* Left Control Column: User Entry & System Prompts */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Choice Suggestion Chips */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">Suggested Questions</p>
            <div className="grid gap-2">
              {quickQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => askAI(q)}
                  disabled={loading}
                  className="w-full text-left text-xs bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-300 px-4 py-3 rounded-xl transition duration-150 disabled:opacity-50 font-medium truncate"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Form Command Box Text Area */}
          <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4 space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="w-full h-32 bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 text-xs font-medium text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:outline-none transition resize-none leading-relaxed"
            />

            <div className="flex gap-2.5">
              <button
                onClick={askAI}
                disabled={loading}
                className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-xs transition active:scale-[0.99] disabled:opacity-50"
              >
                Ask AI
              </button>
              
              {(question || answer) && (
                <button
                  onClick={clearChat}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Output Column: Response Canvas Container */}
        <div className="lg:col-span-7">
          
          {/* Default Empty Active State Layout */}
          {!loading && !answer && (
            <div className="h-64 border border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
              <span className="text-xl">✨</span>
              <p className="text-xs text-zinc-400 font-medium mt-3">Ready for query array execution.</p>
              <p className="text-[11px] text-zinc-600 mt-1 max-w-xs leading-relaxed">Choose an initialization prompt from the suggested layout or write a manual input phrase string.</p>
            </div>
          )}

          {/* Runtime Data Processing Loading Prompt */}
          {loading && (
            <div className="border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6 flex items-center gap-4 animate-pulse">
              <div className="h-4 w-4 rounded-full border border-t-indigo-400 border-zinc-800 animate-spin shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Analyzing spending</p>
                <p className="text-xs text-zinc-400 font-medium">Please wait while the engine queries your data schema...</p>
              </div>
            </div>
          )}

          {/* Core Response Dialog Box */}
          {answer && !loading && (
            <div className="border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 w-36 h-36 bg-indigo-500/[0.015] rounded-full blur-2xl pointer-events-none" />
              
              {/* Profile Box Title Node Header */}
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-3">
                <div className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-xs text-indigo-400 shadow-inner shrink-0">
                  AI
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Assistant Response</h3>
                </div>
              </div>

              {/* Dynamic Answer Body Paragraph Block */}
              <div className="text-xs font-medium text-zinc-300 leading-relaxed whitespace-pre-wrap tracking-wide">
                {answer}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}