import { initializeApp } from "firebase/app";

import {
  getFirestore,
} from "firebase/firestore";

import {
  getStorage,
} from "firebase/storage";

const firebaseConfig = {

  apiKey:
    "AIzaSyA_LDYe3fkOoutSk8k7_S_NBwfVUnmzXCw",

  authDomain:
    "snapvault-9b68f.firebaseapp.com",

  projectId:
    "snapvault-9b68f",

  storageBucket:
    "snapvault-9b68f.firebasestorage.app",

  messagingSenderId:
    "510435018697",

  appId:
    "1:510435018697:web:d5139d798ba1cefcbf0a18",
};

export const app =
  initializeApp(
    firebaseConfig
  );

export const db =
  getFirestore(app);

export const storage =
  getStorage(app);