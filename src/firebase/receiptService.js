import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { auth } from "./authService";
import { addPoints, updateUserStats } from "./userService";

// Collection Reference
const receiptsCollection = collection(db, "receipts");

/**
 * Ensures the user is authenticated, otherwise throws an error.
 */
const requireAuth = () => {
  if (!auth.currentUser) {
    throw new Error("User not logged in");
  }
};

/**
 * Saves a receipt, adds SnapPoints, and updates accumulated user stats.
 */
export const addReceipt = async (receiptData) => {
  try {
    requireAuth();

    const newReceipt = {
      ...receiptData,
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(receiptsCollection, newReceipt);

    // Add points in the background
    await addPoints(
      auth.currentUser.uid,
      Math.floor(Number(receiptData.amount || 0))
    );

    // Update user's aggregate spending and receipt count data fields
    await updateUserStats(
      auth.currentUser.uid,
      Number(receiptData.amount || 0)
    );

    return docRef.id;
  } catch (error) {
    console.error("Save Error:", error.message);
    throw error; // Re-throw to handle error in UI
  }
};

/**
 * Retrieves the current user's receipts.
 */
export const getReceipts = async () => {
  try {
    requireAuth();

    const q = query(
      receiptsCollection,
      where("userId", "==", auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Fetch Error:", error.message);
    return []; // Return empty array on failure
  }
};

/**
 * Calculates dashboard statistics.
 */
export const getDashboardStats = async () => {
  try {
    const receipts = await getReceipts();

    const totalExpenses = receipts.reduce(
      (sum, receipt) => sum + Number(receipt.amount || 0),
      0
    );

    const receiptCount = receipts.length;
    const averageExpense = receiptCount > 0 ? totalExpenses / receiptCount : 0;

    return { totalExpenses, receiptCount, averageExpense };
  } catch (error) {
    console.error("Dashboard Error:", error.message);
    return { totalExpenses: 0, receiptCount: 0, averageExpense: 0 };
  }
};