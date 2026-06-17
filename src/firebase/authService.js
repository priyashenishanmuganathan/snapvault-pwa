import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { app } from "./config";

import { createUserProfile }
  from "./userService";

export const auth = getAuth(app);

const googleProvider =
  new GoogleAuthProvider();

export const registerUser = async (
  email,
  password
) => {

  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  await createUserProfile(
    userCredential.user
  );

  return userCredential;
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

    const result =
      await signInWithPopup(
        auth,
        googleProvider
      );

    await createUserProfile(
      result.user
    );

    return result;
  };

export const logoutUser = async () => {

  return await signOut(auth);
};