import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./config";

export const getRewardHistory =
  async (uid) => {

    const q = query(
      collection(
        db,
        "redemptions"
      ),
      where(
        "userId",
        "==",
        uid
      )
    );

    const snapshot =
      await getDocs(q);

    return snapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    );
  };