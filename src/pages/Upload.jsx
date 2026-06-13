import { useState } from "react";

import { addReceipt } from "../firebase/receiptService";
import { extractReceiptText } from "../services/ocrService";
import { analyzeReceipt } from "../services/aiReceiptService";

export default function Upload() {

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  const [ocrText, setOcrText] =
    useState("");

  const [loadingOCR, setLoadingOCR] =
    useState(false);

  const [loadingSave, setLoadingSave] =
    useState(false);

  const [showReview, setShowReview] =
    useState(false);

  setReviewData({
  merchant: "",
  amount: "",
  date: "",
  category: "Others",
  });

  const handleImageChange = async (
    event
  ) => {

    const file =
      event.target.files[0];

    if (!file) return;

    setSelectedFile(file);

    setPreview(
      URL.createObjectURL(file)
    );

    setLoadingOCR(true);

    try {

      const text =
        await extractReceiptText(file);

      setOcrText(text);

      const aiResult =
        await analyzeReceipt(text);

      setReviewData({

  merchant:
    aiResult.merchant || "",

  amount:
    aiResult.amount || "",

  date:
    aiResult.date || "",

  category:
    aiResult.category ||
    "Others",

});

      setShowReview(true);

    } catch (error) {

      console.error(error);

      alert(
        "Failed to analyze receipt"
      );

    } finally {

      setLoadingOCR(false);
    }
  };

  const handleConfirmSave =
    async () => {

      if (
        reviewData.merchant.trim() === "" ||
        String(
          reviewData.amount
        ).trim() === ""
      ) {

        alert(
          "Merchant and Amount are required"
        );

        return;
      }

      try {

        setLoadingSave(true);

        await addReceipt({

          merchant:
            reviewData.merchant,

          amount:
            Number(
              reviewData.amount
            ),

          category:
            reviewData.category,

          date:
  reviewData.date,

          imageName:
            selectedFile?.name || "",

          ocrText,

        });

        alert(
          "Receipt Saved Successfully"
        );

        setShowReview(false);

        setSelectedFile(null);
        setPreview(null);
        setOcrText("");

        setReviewData({
          merchant: "",
          amount: "",
          category: "Others",
        });

      } catch (error) {

        console.error(error);

        alert(
          "Failed to save receipt"
        );

      } finally {

        setLoadingSave(false);
      }
    };

  return (

    <div className="p-6 text-white max-w-5xl mx-auto">

      <div className="mt-10 mb-8">

        <p
          className="
            text-violet-400
            uppercase
            tracking-widest
            text-sm
          "
        >
          Smart OCR
        </p>

        <h1
          className="
            text-5xl
            font-bold
            tracking-tight
            mt-2
          "
        >
          Upload Receipt
        </h1>

        <p
          className="
            text-slate-400
            mt-2
          "
        >
          AI-powered receipt extraction
        </p>

      </div>

      <div className="space-y-6">

        <label
          className="
            block

            border-2
            border-dashed
            border-violet-500/30

            bg-white/5
            backdrop-blur-xl

            rounded-3xl

            p-12

            text-center

            cursor-pointer

            hover:border-violet-400

            transition
          "
        >

          <div className="space-y-3">

            <div className="text-5xl">
              📤
            </div>

            <h2 className="text-xl font-semibold">
              Upload Receipt
            </h2>

            <p className="text-slate-400">
              Tap to choose a receipt image
            </p>

          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

        </label>

        {preview && (

          <div
            className="
              bg-white/5
              backdrop-blur-xl

              border
              border-white/10

              rounded-3xl

              p-4
            "
          >

            <img
              src={preview}
              alt="Receipt"
              className="
                w-full
                max-w-lg

                rounded-3xl

                mx-auto

                border
                border-white/10
              "
            />

          </div>

        )}

        {loadingOCR && (

          <div
            className="
              bg-violet-500/10

              border
              border-violet-500/20

              p-5

              rounded-3xl

              text-center
            "
          >
            🤖 AI Analyzing Receipt...
          </div>

        )}

        {ocrText && !loadingOCR && (

          <div
            className="
              bg-white/5

              backdrop-blur-xl

              border
              border-white/10

              p-5

              rounded-3xl

              whitespace-pre-wrap
            "
          >

            <h2
              className="
                font-bold
                mb-3
                text-lg
              "
            >
              OCR Result
            </h2>

            {ocrText}

          </div>

        )}

      </div>

      {showReview && (

        <div
          className="
            fixed
            inset-0

            bg-black/80

            flex
            items-center
            justify-center

            z-50
          "
        >

          <div
            className="
              bg-[#151520]

              backdrop-blur-xl

              border
              border-white/10

              p-6

              rounded-3xl

              w-[90%]
              max-w-md
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                mb-5
              "
            >
              Review Receipt
            </h2>

            <input
              type="text"
              placeholder="Merchant"
              value={
                reviewData.merchant
              }
              onChange={(e) =>
                setReviewData({
                  ...reviewData,
                  merchant:
                    e.target.value,
                })
              }
              className="
                w-full

                bg-black/20

                border
                border-white/10

                text-white

                p-3

                rounded-2xl

                mb-3
              "
            />

            <input
              type="number"
              placeholder="Amount"
              value={
                reviewData.amount
              }
              onChange={(e) =>
                setReviewData({
                  ...reviewData,
                  amount:
                    e.target.value,
                })
              }
              className="
                w-full

                bg-black/20

                border
                border-white/10

                text-white

                p-3

                rounded-2xl

                mb-3
              "
            />

            <input
  type="date"
  value={reviewData.date}
  onChange={(e) =>
    setReviewData({
      ...reviewData,
      date: e.target.value,
    })
  }
  className="
    w-full
    bg-black/20
    border
    border-white/10
    text-white
    p-3
    rounded-2xl
    mb-3
  "
/>

            <select
              value={
                reviewData.category
              }
              onChange={(e) =>
                setReviewData({
                  ...reviewData,
                  category:
                    e.target.value,
                })
              }
              className="
                w-full

                bg-black/20

                border
                border-white/10

                text-white

                p-3

                rounded-2xl

                mb-5
              "
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
                onClick={() =>
                  setShowReview(false)
                }
                className="
                  flex-1

                  bg-white/10

                  hover:bg-white/20

                  p-3

                  rounded-2xl
                "
              >
                Cancel
              </button>

              <button
                onClick={
                  handleConfirmSave
                }
                disabled={
                  loadingSave
                }
                className="
                  flex-1

                  bg-violet-600

                  hover:bg-violet-500

                  p-3

                  rounded-2xl

                  font-semibold

                  shadow-lg
                  shadow-violet-500/20
                "
              >
                {
                  loadingSave
                    ? "Saving..."
                    : "Save"
                }
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}