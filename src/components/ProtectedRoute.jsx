import { Navigate } from "react-router-dom";
import { auth } from "../firebase/authService";

export default function ProtectedRoute({
  children,
}) {

  if (!auth.currentUser) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}