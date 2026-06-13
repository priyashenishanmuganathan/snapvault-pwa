import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { storage } from "./config";

export async function uploadReceiptImage(
  file
) {

  const imageRef =
    ref(
      storage,
      `receipts/${Date.now()}_${file.name}`
    );

  await uploadBytes(
    imageRef,
    file
  );

  return await getDownloadURL(
    imageRef
  );
}