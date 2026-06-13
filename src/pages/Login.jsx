import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../firebase/authService";

export default function Login() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin =
    async () => {

      try {

        setLoading(true);

        await loginUser(
          email,
          password
        );

        navigate("/");

      } catch (error) {

        console.error(error);

        alert(
          error.message
        );

      } finally {

        setLoading(false);
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
            SnapVault
          </h1>

          <p
            className="
              text-slate-400
              mt-2
            "
          >
            AI Powered Receipt Management
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

          <button
            onClick={handleLogin}
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
                ? "Logging In..."
                : "Login"
            }
          </button>

        </div>

        <p
          className="
            text-center
            text-slate-400
            mt-6
          "
        >
          Don't have an account?

          <Link
            to="/register"
            className="
              text-violet-400
              ml-2
              hover:text-violet-300
            "
          >
            Register
          </Link>

        </p>

      </div>

    </div>

  );
}