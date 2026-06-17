import {
  collection,
  addDoc,
} from "firebase/firestore";

import { db } from "./config";

export const redeemReward =
  async (
    reward,
    user,
    formData
  ) => {

    return await addDoc(
      collection(
        db,
        "redemptions"
      ),
      {

        rewardName:
          reward.name,

        pointsUsed:
          reward.points,

        rewardType:
          reward.type,

        status:
          reward.type ===
          "voucher"
            ? "Delivered"
            : "Processing",

        userId:
          user.uid,

        userEmail:
          user.email,

        fullName:
          formData?.fullName || "",

        phone:
          formData?.phone || "",

        address:
          formData?.address || "",

        postcode:
          formData?.postcode || "",

        createdAt:
          new Date()
            .toISOString(),

      }
    );
  };