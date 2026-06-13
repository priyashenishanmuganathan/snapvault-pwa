import Tesseract from "tesseract.js";

export const extractReceiptText = async (
  file
) => {

  try {

    const result =
      await Tesseract.recognize(
        file,
        "eng",
        {
          logger: (m) => {
            console.log(m);
          },
        }
      );

    return result.data.text;

  } catch (error) {

    console.error(
      "OCR ERROR:",
      error
    );

    return "";
  }
};