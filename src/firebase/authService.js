import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { app } from "./config";

export const auth = getAuth(app);

const googleProvider =
  new GoogleAuthProvider();

export const registerUser = async (
  email,
  password
) => {

  return await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
};

export const loginUser = async (
  email,
  password
) => {

  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};

export const loginWithGoogle =
  async () => {

    return await signInWithPopup(
      auth,
      googleProvider
    );
  };

export const logoutUser = async () => {

  return await signOut(auth);
};