import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

// Collection Reference Helper
const getUserRef = (uid) => doc(db, "users", uid);

// ====================
// LEVEL CALCULATOR
// ====================
/**
 * Calculates user level based on total points.
 */
const calculateLevel = (points) => {
  if (points >= 5000) return 5;
  if (points >= 2000) return 4;
  if (points >= 1000) return 3;
  if (points >= 500) return 2;
  return 1;
};

// ====================
// CREATE USER PROFILE
// ====================
export const createUserProfile = async (user) => {
  try {
    const userRef = getUserRef(user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const newUserProfile = {
        email: user.email,
        points: 0,
        level: 1,
        financialScore: 0,
        totalSpent: 0,
        totalReceipts: 0,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, newUserProfile);
    }
  } catch (error) {
    console.error("Create Profile Error:", error.message);
    throw error;
  }
};

// ====================
// GET USER PROFILE
// ====================
export const getUserProfile = async (uid) => {
  try {
    const userRef = getUserRef(uid);
    const snapshot = await getDoc(userRef);

    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    throw error;
  }
};

// ====================
// UPDATE POINTS (Internal Helper)
// ====================
/**
 * Updates points and level, ensuring the user exists.
 */
const updateUserPointsAndLevel = async (uid, newPoints) => {
  const userRef = getUserRef(uid);
  const level = calculateLevel(newPoints);

  await updateDoc(userRef, { points: newPoints, level });
};

// ====================
// ADD POINTS
// ====================
export const addPoints = async (uid, pointsToAdd) => {
  try {
    const profile = await getUserProfile(uid);
    if (!profile) return null;

    const currentPoints = profile.points || 0;
    const newPoints = currentPoints + pointsToAdd;

    await updateUserPointsAndLevel(uid, newPoints);

    return newPoints;
  } catch (error) {
    console.error("Add Points Error:", error.message);
    throw error;
  }
};

// ====================
// DEDUCT POINTS
// ====================
export const deductPoints = async (uid, pointsToDeduct) => {
  try {
    const profile = await getUserProfile(uid);
    if (!profile) return false;

    const currentPoints = profile.points || 0;

    if (currentPoints < pointsToDeduct) {
      return false; // Insufficient points
    }

    const newPoints = currentPoints - pointsToDeduct;

    await updateUserPointsAndLevel(uid, newPoints);

    return true; // Success
  } catch (error) {
    console.error("Deduct Points Error:", error.message);
    throw error;
  }
};

// ====================
// UPDATE FINANCIAL SCORE
// ====================
export const updateFinancialScore = async (uid, score) => {
  try {
    const userRef = getUserRef(uid);
    await updateDoc(userRef, { financialScore: score });
  } catch (error) {
    console.error("Update Financial Score Error:", error.message);
    throw error;
  }
};

// ====================
// CALCULATE FINANCIAL SCORE
// ====================
export const calculateFinancialScore = (totalSpent, totalReceipts, points) => {
  let score = 50;

  // Receipt Activity
  score += Math.min(totalReceipts * 5, 20);

  // Engagement
  score += Math.min(Math.floor(points / 50), 20);

  // Spending Behaviour
  if (totalSpent < 500) score += 10;
  else if (totalSpent > 2000) score -= 10;

  return Math.max(0, Math.min(score, 100));
};

// ====================
// UPDATE USER STATS
// ====================
export const updateUserStats = async (uid, receiptAmount) => {
  try {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    const totalSpent = (data.totalSpent || 0) + Number(receiptAmount);
    const totalReceipts = (data.totalReceipts || 0) + 1;

    await updateDoc(userRef, {
      totalSpent,
      totalReceipts,
    });
  } catch (error) {
    console.error("Update User Stats Error:", error.message);
    throw error;
  }
};