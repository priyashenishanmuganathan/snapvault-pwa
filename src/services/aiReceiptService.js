export const analyzeReceipt = async (ocrText) => {

  const response = await fetch(
    "http://10.255.123.234:8000/analyze-receipt",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ocrText,
      }),
    }
  );

  if (!response.ok) {

    throw new Error(
      `HTTP ${response.status}`
    );
  }

  return await response.json();
};