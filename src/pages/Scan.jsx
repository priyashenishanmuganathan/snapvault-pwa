import { useState } from "react";
import { addReceipt } from "../firebase/receiptService";
import { extractReceiptText } from "../services/ocrService";
import { analyzeReceipt } from "../services/aiReceiptService";

export default function Scan() {
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [processStep, setProcessStep] = useState("idle"); // idle | ocr | ai | done
  const [loadingSave, setLoadingSave] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState({
    merchant: "",
    amount: "",
    category: "Others",
    date: new Date().toISOString().split("T")[0], // ISO format initialization
  });

  const handleCapture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setPreview(URL.createObjectURL(file));
      setOcrText("");
      setShowReview(false);
      setProcessStep("ocr");

      // Step 1: Fire Engine Extracting System
      const text = await extractReceiptText(file);
      if (!text || text.trim() === "") {
        throw new Error("OCR Core engine returned empty parameters.");
      }

      setOcrText(text);
      setProcessStep("ai");

      // Step 2: Algorithmic Translation Parsing Layer
      const aiResult = await analyzeReceipt(text);

      setReviewData({
        merchant: aiResult.merchant || "",
        amount: aiResult.amount || "",
        category: aiResult.category || "Others",
        date: aiResult.date || new Date().toISOString().split("T")[0],
      });
      
      setProcessStep("done");
      setShowReview(true);
    } catch (error) {
      console.error("SCAN ENGINE FAILURE:", error);
      alert(error.message || "Scanning Protocol Interrupted");
      setProcessStep("idle");
    }
  };

  const handleSave = async () => {
    try {
      setLoadingSave(true);
      await addReceipt({
        merchant: reviewData.merchant,
        amount: Number(reviewData.amount),
        category: reviewData.category,
        date: reviewData.date,
        ocrText,
      });

      alert("Receipt Saved Successfully");
      setShowReview(false);
      setPreview(null);
      setOcrText("");
      setProcessStep("idle");
    } catch (error) {
      console.error("SAVE FAILURE:", error);
      alert("Failed to commit ledger entry");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-5 pt-8 pb-32 text-white animate-fade-in">
      
      {/* Structural Header Section */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">Capture Core Subsystem</p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight">AI Document Digitizer</h1>
        <p className="text-slate-400">Upload receipts to automatically process values via machine intelligence.</p>
      </div>

      {/* Dynamic Visual Processing Progression State Indicators */}
      {processStep !== "idle" && (
        <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-3 text-center text-xs font-mono border border-white/5">
          <div className={`rounded-xl p-2 transition-all ${processStep === "ocr" ? "bg-violet-600 text-white animate-pulse" : "bg-black/20 text-slate-500"}`}>
            🔍 Step 1: Text Extract
          </div>
          <div className={`rounded-xl p-2 transition-all ${processStep === "ai" ? "bg-violet-600 text-white animate-pulse" : "bg-black/20 text-slate-500"}`}>
            🧠 Step 2: AI Synapse
          </div>
          <div className={`rounded-xl p-2 transition-all ${processStep === "done" ? "bg-emerald-600 text-white" : "bg-black/20 text-slate-500"}`}>
            ✨ Step 3: Verification
          </div>
        </div>
      )}

      {/* Futuristic Drag-And-Drop / Interactive Camera Upload Box Area */}
      <div className="relative group rounded-3xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center backdrop-blur-xl transition hover:border-violet-500/40 hover:bg-white/[0.07]">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10 text-3xl text-violet-400 transition group-hover:scale-110">
            📸
          </div>
          <div>
            <p className="text-lg font-bold">Snap Camera or Drag Media File Here</p>
            <p className="text-xs text-slate-400 mt-1">Supports JPEG, PNG and system camera arrays</p>
          </div>
        </div>
      </div>

      {/* Media Rendering Workspace Area */}
      {preview && (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Captured Target Preview Image Container Frame */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl flex flex-col items-center justify-center">
            <h3 className="mb-3 text-sm font-semibold tracking-wider uppercase text-slate-400">Source Document Preview</h3>
            <img
              src={preview}
              alt="Receipt Manifest Source"
              className="max-h-80 w-auto rounded-2xl object-contain border border-white/10 shadow-2xl"
            />
          </div>

          {/* Extracted Machine Text Diagnostics Stream Window */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl flex flex-col">
            <h3 className="mb-3 text-sm font-semibold tracking-wider uppercase text-violet-300">Extracted Raw Streams</h3>
            {processStep === "ocr" ? (
              <div className="flex flex-1 items-center justify-center py-12 text-slate-500 font-mono text-sm animate-pulse">
                ⚡ Initializing OCR Scanner Arrays...
              </div>
            ) : (
              <div className="max-h-80 flex-1 overflow-y-auto rounded-xl bg-black/40 p-4 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap border border-white/5">
                {ocrText || "Waiting for stream text compilation..."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Review Layer Panel Overlay Container */}
      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950 p-6 shadow-2xl shadow-violet-950/20">
            <div className="mb-5">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Verification Gate</span>
              <h2 className="text-2xl font-black text-white mt-0.5">Audit Ledger Analysis</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Merchant Name</label>
                <input
                  type="text"
                  value={reviewData.merchant}
                  onChange={(e) => setReviewData({ ...reviewData, merchant: e.target.value })}
                  placeholder="e.g. Shell Starburst Co"
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount Billed</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-slate-500 font-mono">RM</span>
                    <input
                      type="number"
                      value={reviewData.amount}
                      onChange={(e) => setReviewData({ ...reviewData, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 font-bold text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Receipt Date</label>
                  <input
                    type="date"
                    value={reviewData.date}
                    onChange={(e) => setReviewData({ ...reviewData, date: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Expense Structural Allocation Tier</label>
                <select
                  value={reviewData.category}
                  onChange={(e) => setReviewData({ ...reviewData, category: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-violet-500 focus:outline-none"
                >
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Education">Education</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            {/* Interaction Buttons footer matrix row */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => { setShowReview(false); setProcessStep("idle"); }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5 font-medium text-slate-300 transition hover:bg-white/10"
              >
                Discard Sync
              </button>
              <button
                onClick={handleSave}
                disabled={loadingSave}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-bold tracking-wide text-white shadow-lg shadow-indigo-600/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
              >
                {loadingSave ? "Committing..." : "Commit To Sync"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}