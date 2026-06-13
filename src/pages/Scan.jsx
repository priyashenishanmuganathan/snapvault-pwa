import { useState } from "react";
import { addReceipt } from "../firebase/receiptService";
import { extractReceiptText } from "../services/ocrService";
import { analyzeReceipt } from "../services/aiReceiptService";

export default function Scan() {
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState({
    merchant: "",
    amount: "",
    category: "Others",
  });

  const handleCapture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setPreview(URL.createObjectURL(file));
      setLoadingOCR(true);
      console.log("START OCR");

      const text = await extractReceiptText(file);
      console.log("OCR DONE", text);

      if (!text || text.trim() === "") {
        throw new Error("OCR returned empty text.");
      }

      setOcrText(text);
      console.log("START AI");

      const aiResult = await analyzeReceipt(text);
      console.log("AI DONE", aiResult);

      setReviewData({
        merchant: aiResult.merchant || "",
        amount: aiResult.amount || "",
        category: aiResult.category || "Others",
      });
      setShowReview(true);
    } catch (error) {
      console.error("SCAN ERROR:", error);
      alert(error.message || "Scan Failed");
    } finally {
      setLoadingOCR(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoadingSave(true);
      await addReceipt({
        merchant: reviewData.merchant,
        amount: Number(reviewData.amount),
        category: reviewData.category,
        date: new Date().toLocaleDateString(),
        ocrText,
      });

      alert("Receipt Saved Successfully");
      setShowReview(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save receipt");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white px-5 pt-8 pb-32">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Scan Receipt</h1>
        <p className="text-slate-400 mt-2">Capture and analyze receipts instantly</p>
      </div>

      {/* Upload Box */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          className="w-full text-sm text-slate-300"
        />
      </div>

      {/* Preview Image */}
      {preview && (
        <div className="mt-6 flex justify-center">
          <img
            src={preview}
            alt="Receipt"
            className="w-52 h-72 object-cover rounded-2xl border border-white/10 shadow-xl"
          />
        </div>
      )}

      {/* Loading State */}
      {loadingOCR && (
        <div className="mt-6 bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4">
          <p className="text-violet-300">Analyzing receipt...</p>
        </div>
      )}

      {/* OCR Text Result */}
      {ocrText && !loadingOCR && (
        <div className="mt-6 bg-white/5 border border-white/10 rounded-3xl p-5 whitespace-pre-wrap">
          <h2 className="font-bold mb-3 text-violet-300">OCR Result</h2>
          <p className="text-slate-300 text-sm">{ocrText}</p>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#111118] border border-white/10 backdrop-blur-xl p-6 rounded-3xl w-[90%] max-w-md">
            <h2 className="text-2xl font-bold mb-5">Review Receipt</h2>

            <input
              type="text"
              value={reviewData.merchant}
              onChange={(e) => setReviewData({ ...reviewData, merchant: e.target.value })}
              placeholder="Merchant"
              className="w-full p-3 rounded-xl bg-slate-800 text-white mb-3"
            />

            <input
              type="number"
              value={reviewData.amount}
              onChange={(e) => setReviewData({ ...reviewData, amount: e.target.value })}
              placeholder="Amount"
              className="w-full p-3 rounded-xl bg-slate-800 text-white mb-3"
            />

            <select
              value={reviewData.category}
              onChange={(e) => setReviewData({ ...reviewData, category: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-800 text-white mb-5"
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Groceries</option>
              <option>Healthcare</option>
              <option>Bills</option>
              <option>Entertainment</option>
              <option>Education</option>
              <option>Others</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReview(false)}
                className="flex-1 bg-slate-700 p-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loadingSave}
                className="flex-1 bg-violet-600 hover:bg-violet-500 p-3 rounded-xl"
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