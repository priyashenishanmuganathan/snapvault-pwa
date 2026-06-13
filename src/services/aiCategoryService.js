console.log(
  "TEST:",
  import.meta.env.VITE_TEST
);

console.log(
  "KEY:",
  import.meta.env.VITE_OPENROUTER_API_KEY
);

export const aiCategorizeReceipt = async (
  merchant
) => {

  try {

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: "liquid/lfm-2.5-1.2b-thinking:free",

          messages: [
            {
              role: "system",
              content:
                "You are an expense categorization assistant. Return ONLY the category name."
            },
            {
              role: "user",
              content: `
Merchant: ${merchant}

Choose ONLY ONE category:

Food
Transport
Shopping
Groceries
Healthcare
Bills
Entertainment
Education
Others

Return ONLY the category name.
`
            }
          ]
        })
      }
    );

    console.log(
      "STATUS:",
      response.status
    );

    const text =
      await response.text();

    console.log(
      "RESULT:",
      text
    );

    if (!response.ok) {

      console.error(
        "OpenRouter Error:",
        text
      );

      return fallbackCategory(
        merchant
      );
    }

    const data =
      JSON.parse(text);

    const category =
      data.choices?.[0]
        ?.message?.content
        ?.trim();

    return (
      category ||
      fallbackCategory(
        merchant
      )
    );

  } catch (error) {

    console.error(
      "AI Error:",
      error
    );

    return fallbackCategory(
      merchant
    );
  }
};

function fallbackCategory(
  merchant
) {

  const name =
    merchant.toLowerCase();

  if (
    name.includes("kfc") ||
    name.includes("mcd") ||
    name.includes("mcdonald") ||
    name.includes("burger king") ||
    name.includes("starbucks") ||
    name.includes("tealive") ||
    name.includes("subway")
  ) {
    return "Food";
  }

  if (
    name.includes("shell") ||
    name.includes("petronas") ||
    name.includes("caltex")
  ) {
    return "Transport";
  }

  if (
    name.includes("watsons") ||
    name.includes("guardian")
  ) {
    return "Healthcare";
  }

  if (
    name.includes("mr diy") ||
    name.includes("shopee") ||
    name.includes("lazada") ||
    name.includes("aeon")
  ) {
    return "Shopping";
  }

  if (
    name.includes("lotus") ||
    name.includes("tesco") ||
    name.includes("giant") ||
    name.includes("jaya grocer")
  ) {
    return "Groceries";
  }

  return "Others";
}