import { useState } from "react";
import { addReceipt } from "../firebase/receiptService";
import { extractReceiptText } from "../services/ocrService";
import { analyzeReceipt } from "../services/aiReceiptService";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [processStep, setProcessStep] = useState("idle"); // idle | ocr | ai | done
  const [loadingSave, setLoadingSave] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState({
    merchant: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Others",
  });

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setOcrText("");
    setShowReview(false);
    setProcessStep("ocr");

    try {
      // Step 1: Read text from image
      const text = await extractReceiptText(file);
      setOcrText(text);
      setProcessStep("ai");

      // Step 2: Use AI to get receipt details
      const aiResult = await analyzeReceipt(text);

      setReviewData({
        merchant: aiResult.merchant || "",
        amount: aiResult.amount || "",
        date: aiResult.date || new Date().toISOString().split("T")[0],
        category: aiResult.category || "Others",
      });

      setProcessStep("done");
      setShowReview(true);
    } catch (error) {
      console.error("Error reading receipt:", error);
      alert("Failed to read the receipt image.");
      setProcessStep("idle");
    }
  };

  const handleConfirmSave = async () => {
    if (!reviewData.merchant.trim() || !String(reviewData.amount).trim()) {
      alert("Please fill in both the Merchant and Amount fields.");
      return;
    }

    try {
      setLoadingSave(true);

      await addReceipt({
        merchant: reviewData.merchant,
        amount: Number(reviewData.amount),
        category: reviewData.category,
        date: reviewData.date,
        imageName: selectedFile?.name || "",
        ocrText,
      });

      alert("Receipt Saved Successfully");
      
      // Reset everything back to empty
      setShowReview(false);
      setSelectedFile(null);
      setPreview(null);
      setOcrText("");
      setProcessStep("idle");
      setReviewData({
        merchant: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "Others",
      });
    } catch (error) {
      console.error("Error saving receipt:", error);
      alert("Failed to save the receipt to the database.");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 text-white">
      {/* Header Section using your original wording */}
      <div className="mt-10 mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">Smart OCR</p>
        <h1 className="mt-2 text-5xl font-bold tracking-tight">Upload Receipt</h1>
        <p className="mt-2 text-slate-400">AI-powered receipt extraction</p>
      </div>

      {/* Simple Status Tracker Step Bar */}
      {processStep !== "idle" && (
        <div className="mb-6 grid grid-cols-3 gap-3 rounded-2xl bg-white/5 p-3 text-center text-xs font-mono border border-white/5 backdrop-blur-xl">
          <div className={`rounded-xl p-2.5 transition-all duration-300 ${processStep === "ocr" ? "bg-violet-600 text-white animate-pulse shadow-md shadow-violet-600/30" : "bg-black/30 text-slate-500"}`}>
            📝 Reading Image Text
          </div>
          <div className={`rounded-xl p-2.5 transition-all duration-300 ${processStep === "ai" ? "bg-violet-600 text-white animate-pulse shadow-md shadow-violet-600/30" : "bg-black/30 text-slate-500"}`}>
            🧠 AI Analyzing Data
          </div>
          <div className={`rounded-xl p-2.5 transition-all duration-300 ${processStep === "done" ? "bg-emerald-600 text-white" : "bg-black/30 text-slate-500"}`}>
            ✅ Ready to Review
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Upload Dropzone Area */}
        <label className="group block border-2 border-dashed border-violet-500/30 bg-white/5 backdrop-blur-xl rounded-3xl p-12 text-center cursor-pointer hover:border-violet-400 hover:bg-white/[0.07] transition-all duration-300">
          <div className="space-y-4">
            <div className="text-5xl transition-transform duration-300 group-hover:scale-110">📤</div>
            <h2 className="text-xl font-semibold">Upload Receipt</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Tap to choose a receipt image or drag it here to begin.
            </p>
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        {/* Side by side Preview and Output Section */}
        {preview && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column: Image Preview */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl flex flex-col items-center justify-center">
              <h3 className="mb-3 text-xs font-bold tracking-wider uppercase text-slate-400">Receipt Image</h3>
              <img src={preview} alt="Receipt Input" className="max-h-96 w-auto rounded-2xl object-contain border border-white/10 shadow-2xl" />
            </div>

            {/* Right Column: Extracted Text Box */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl flex flex-col">
              <h3 className="mb-3 text-xs font-bold tracking-wider uppercase text-violet-300">OCR Result</h3>
              {processStep === "ocr" ? (
                <div className="flex flex-1 items-center justify-center py-20 text-slate-500 text-sm animate-pulse">
                  Scanning text from your image...
                </div>
              ) : (
                <div className="max-h-96 flex-1 overflow-y-auto rounded-2xl bg-black/40 p-4 font-mono text-xs leading-relaxed text-slate-300 border border-white/5 whitespace-pre-wrap">
                  {ocrText || "Waiting for text data..."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Review Information Modal Popup */}
      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950 p-6 shadow-2xl">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Check Details</span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">Review Receipt</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Merchant Name</label>
                <input
                  type="text"
                  value={reviewData.merchant}
                  onChange={(e) => setReviewData({ ...reviewData, merchant: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-sm text-slate-500">RM</span>
                    <input
                      type="number"
                      value={reviewData.amount}
                      onChange={(e) => setReviewData({ ...reviewData, amount: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-3 font-bold text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={reviewData.date}
                    onChange={(e) => setReviewData({ ...reviewData, date: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                <select
                  value={reviewData.category}
                  onChange={(e) => setReviewData({ ...reviewData, category: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-white focus:border-violet-500 focus:outline-none"
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

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => { setShowReview(false); setProcessStep("idle"); }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5 font-medium text-slate-300 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={loadingSave}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-bold tracking-wide shadow-lg shadow-indigo-600/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
              >
                {loadingSave ? "Saving..." : "Save Receipt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}