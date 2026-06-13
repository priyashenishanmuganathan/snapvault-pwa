import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  registerUser,
  loginWithGoogle,
} from "../firebase/authService";

export default function Register() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleRegister =
    async () => {

      if (
        !email ||
        !password ||
        !confirmPassword
      ) {

        alert(
          "Please fill all fields"
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {

        alert(
          "Passwords do not match"
        );

        return;
      }

      try {

        setLoading(true);

        await registerUser(
          email,
          password
        );

        alert(
          "Account created successfully!"
        );

        navigate("/login");

      } catch (error) {

        console.error(error);

        alert(
          error.message
        );

      } finally {

        setLoading(false);
      }
    };

  const handleGoogleSignIn =
    async () => {

      try {

        await loginWithGoogle();

        navigate("/");

      } catch (error) {

        console.error(error);

        alert(error.message);
      }
    };

  return (

    <div
      className="
        min-h-screen
        bg-[#0A0A0F]
        flex
        items-center
        justify-center
        px-4
      "
    >

      <div
        className="
          w-full
          max-w-md
          bg-white/5
          backdrop-blur-xl
          border
          border-white/10
          rounded-3xl
          p-8
          shadow-2xl
        "
      >

        <div className="text-center mb-8">

          <div className="flex justify-center mb-5">

            <img
              src="/icon-192.png"
              alt="SnapVault Logo"
              className="
                h-24
                w-24
                object-contain
              "
            />

          </div>

          <h1
            className="
              text-white
              text-4xl
              font-bold
              tracking-tight
            "
          >
            Create Account
          </h1>

          <p
            className="
              text-slate-400
              mt-2
            "
          >
            Join SnapVault
          </p>

        </div>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="
              w-full
              bg-black/20
              border
              border-white/10
              text-white
              placeholder:text-slate-500
              p-4
              rounded-2xl
              outline-none
            "
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="
              w-full
              bg-black/20
              border
              border-white/10
              text-white
              placeholder:text-slate-500
              p-4
              rounded-2xl
              outline-none
            "
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            className="
              w-full
              bg-black/20
              border
              border-white/10
              text-white
              placeholder:text-slate-500
              p-4
              rounded-2xl
              outline-none
            "
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="
              w-full
              bg-violet-600
              hover:bg-violet-500
              transition
              py-4
              rounded-2xl
              font-semibold
              shadow-lg
              shadow-violet-500/20
            "
          >
            {
              loading
                ? "Creating Account..."
                : "Create Account"
            }
          </button>

          {/* Divider */}

          <div className="flex items-center my-4">

            <div className="flex-1 border-t border-white/10"></div>

            <span
              className="
                px-4
                text-slate-400
                text-sm
              "
            >
              OR
            </span>

            <div className="flex-1 border-t border-white/10"></div>

          </div>

          {/* Google Button */}

          <button
            onClick={handleGoogleSignIn}
            className="
              w-full
              bg-white
              text-black
              hover:bg-gray-100
              py-4
              rounded-2xl
              font-semibold
              transition
            "
          >
            Continue with Google
          </button>

        </div>

        <p
          className="
            text-center
            text-slate-400
            mt-6
          "
        >
          Already have an account?

          <Link
            to="/login"
            className="
              text-violet-400
              ml-2
              hover:text-violet-300
            "
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}