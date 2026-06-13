import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./config";
import { auth } from "./authService";

// ====================
// SAVE RECEIPT
// ====================

export const addReceipt = async (
  receipt
) => {

  try {

    if (
      !auth.currentUser
    ) {

      throw new Error(
        "User not logged in"
      );
    }

    const docRef =
      await addDoc(
        collection(
          db,
          "receipts"
        ),
        {
          ...receipt,

          userId:
            auth.currentUser.uid,

          userEmail:
            auth.currentUser.email,

          createdAt:
            new Date()
              .toISOString(),
        }
      );

    console.log(
      "Receipt Saved:",
      docRef.id
    );

    return docRef.id;

  } catch (error) {

    console.error(
      "Save Error:",
      error
    );

    throw error;
  }
};

// ====================
// GET USER RECEIPTS
// ====================

export const getReceipts =
  async () => {

    try {

      if (
        !auth.currentUser
      ) {

        return [];
      }

      const q =
        query(
          collection(
            db,
            "receipts"
          ),
          where(
            "userId",
            "==",
            auth.currentUser.uid
          )
        );

      const querySnapshot =
        await getDocs(q);

      const receipts = [];

      querySnapshot.forEach(
        (doc) => {

          receipts.push({
            id: doc.id,
            ...doc.data(),
          });

        }
      );

      return receipts;

    } catch (error) {

      console.error(
        "Fetch Error:",
        error
      );

      return [];
    }
  };

// ====================
// DASHBOARD STATS
// ====================

export const getDashboardStats =
  async () => {

    try {

      const receipts =
        await getReceipts();

      const totalExpenses =
        receipts.reduce(
          (
            sum,
            receipt
          ) =>
            sum +
            Number(
              receipt.amount ||
                0
            ),
          0
        );

      const receiptCount =
        receipts.length;

      const averageExpense =
        receiptCount > 0
          ? totalExpenses /
            receiptCount
          : 0;

      return {

        totalExpenses,

        receiptCount,

        averageExpense,

      };

    } catch (error) {

      console.error(
        "Dashboard Error:",
        error
      );

      return {

        totalExpenses: 0,

        receiptCount: 0,

        averageExpense: 0,

      };
    }
  };