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
  const [reviewData, setReviewData] = useState({
    merchant: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Others",
  });

  // Handle changes specifically inside manual form inputs
  const handleInputChange = (field, value) => {
    setReviewData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setOcrText("");
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
      
      // Complete form state clean reset
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
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto space-y-6 md:space-y-8 pb-24 text-zinc-100">
      
      {/* Header View */}
      <header className="border-b border-zinc-900 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">Upload Receipt</h1>
        <p className="text-xs text-zinc-400 mt-1">Add expenses automatically via AI extraction or input them manually</p>
      </header>

      {/* Dynamic Smart Processing Pipeline Indicator Bar */}
      {processStep !== "idle" && (
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-zinc-900/30 p-2 text-center text-[11px] font-medium border border-zinc-900">
          <div className={`py-2 rounded-lg transition-all ${processStep === "ocr" ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 animate-pulse" : "text-zinc-600 bg-zinc-950/20"}`}>
            Reading Text
          </div>
          <div className={`py-2 rounded-lg transition-all ${processStep === "ai" ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 animate-pulse" : "text-zinc-600 bg-zinc-950/20"}`}>
            AI Extracting
          </div>
          <div className={`py-2 rounded-lg transition-all ${processStep === "done" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold" : "text-zinc-600 bg-zinc-950/20"}`}>
            Review Ready
          </div>
        </div>
      )}

      {/* Main Two-Column Layout Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: MANUAL ENTRY PANEL (FIX)                                      */}
        {/* ========================================================================= */}
        <section className="lg:col-span-5 bg-zinc-900/10 border border-zinc-900 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-zinc-900 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Receipt Ledger Details</h2>
          </div>

          <div className="space-y-3.5">
            {/* Merchant */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 px-0.5">Merchant Name</label>
              <input
                type="text"
                placeholder="e.g. Starbucks"
                value={reviewData.merchant}
                onChange={(e) => handleInputChange("merchant", e.target.value)}
                className="w-full bg-zinc-900/20 border border-zinc-900 text-zinc-100 placeholder:text-zinc-600 p-3 rounded-xl text-xs font-medium outline-none focus:border-indigo-500/50 transition-all leading-none"
              />
            </div>

            {/* Value Inputs Group Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 px-0.5">Amount</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-zinc-600">RM</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={reviewData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className="w-full bg-zinc-900/20 border border-zinc-900 text-zinc-100 placeholder:text-zinc-600 py-3 pl-9 pr-3 rounded-xl text-xs font-bold outline-none focus:border-indigo-500/50 transition-all leading-none font-mono tracking-tight"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 px-0.5">Date</label>
                <input
                  type="date"
                  value={reviewData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full bg-zinc-900/20 border border-zinc-900 text-zinc-100 p-2.5 rounded-xl text-xs font-medium outline-none focus:border-indigo-500/50 transition-all font-mono"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 px-0.5">Category</label>
              <select
                value={reviewData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full bg-zinc-900/20 border border-zinc-900 text-zinc-100 p-3 rounded-xl text-xs font-medium outline-none focus:border-indigo-500/50 transition-all"
              >
                <option value="Food" className="bg-zinc-950">Food</option>
                <option value="Transport" className="bg-zinc-950">Transport</option>
                <option value="Shopping" className="bg-zinc-950">Shopping</option>
                <option value="Groceries" className="bg-zinc-950">Groceries</option>
                <option value="Healthcare" className="bg-zinc-950">Healthcare</option>
                <option value="Bills" className="bg-zinc-950">Bills</option>
                <option value="Entertainment" className="bg-zinc-950">Entertainment</option>
                <option value="Education" className="bg-zinc-950">Education</option>
                <option value="Others" className="bg-zinc-950">Others</option>
              </select>
            </div>
          </div>

          {/* Submission CTA Frame Button */}
          <div className="pt-3 border-t border-zinc-900/60">
            <button
              onClick={handleConfirmSave}
              disabled={loadingSave}
              className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3 rounded-xl text-xs transition active:scale-[0.99] disabled:opacity-50 shadow-sm"
            >
              {loadingSave ? "Saving..." : "Save Receipt"}
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: AI UPLOAD PIPELINE GRAPHICS AND PREVIEWS                    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* File Upload Target Dropzone Box */}
          <label className="group block border border-dashed border-zinc-800 bg-zinc-900/10 rounded-2xl p-8 sm:p-12 text-center cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-200">
            <div className="space-y-3">
              <div className="text-3xl transition-transform duration-200 group-hover:scale-105">📤</div>
              <h3 className="text-sm font-bold text-zinc-200">Scan via Smart OCR</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Choose a receipt image file or drag it directly here to scan content parameters.
              </p>
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>

          {/* Contextual Visualizer Workspace */}
          {preview && (
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Media File Captured Image Frame */}
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-1 mb-2.5 mr-auto">Image Capture</span>
                <img src={preview} alt="Receipt Input" className="max-h-64 w-auto rounded-lg object-contain border border-zinc-900 shadow-lg select-none pointer-events-none" />
              </div>

              {/* Live OCR Text Logger Feed Box */}
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 flex flex-col h-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-1 mb-2.5">AI OCR String Array Feed</span>
                {processStep === "ocr" ? (
                  <div className="flex flex-1 items-center justify-center py-16 text-zinc-600 text-xs animate-pulse font-mono">
                    Executing scan streams...
                  </div>
                ) : (
                  <div className="max-h-64 flex-1 overflow-y-auto rounded-lg bg-zinc-950 border border-zinc-900 p-3 font-mono text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap custom-scrollbar">
                    {ocrText || "Awaiting file inputs..."}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}