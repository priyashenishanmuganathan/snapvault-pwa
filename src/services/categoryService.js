export const detectCategory = (merchant) => {

  if (!merchant) {
    return "Others";
  }

  const name =
    merchant.toLowerCase();

  // FOOD
  if (
    name.includes("kfc") ||
    name.includes("mcd") ||
    name.includes("mcdonald") ||
    name.includes("starbucks") ||
    name.includes("tealive") ||
    name.includes("subway") ||
    name.includes("pizza")
  ) {
    return "Food";
  }

  // TRANSPORT
  if (
    name.includes("shell") ||
    name.includes("petronas") ||
    name.includes("caltex") ||
    name.includes("esso")
  ) {
    return "Transport";
  }

  // HEALTHCARE
  if (
    name.includes("watsons") ||
    name.includes("guardian") ||
    name.includes("caring")
  ) {
    return "Healthcare";
  }

  // SHOPPING
  if (
    name.includes("shopee") ||
    name.includes("lazada") ||
    name.includes("uniqlo") ||
    name.includes("aeon")
  ) {
    return "Shopping";
  }

  return "Others";
};