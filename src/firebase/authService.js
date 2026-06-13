import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { app } from "./config";

export const auth = getAuth(app);

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

export const logoutUser = async () => {

  return await signOut(auth);
};