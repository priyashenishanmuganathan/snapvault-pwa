import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../firebase/authService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await loginUser(email, password);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 antialiased font-sans flex items-center justify-center px-4 relative overflow-hidden select-none">
      
      {/* ========================================================================= */}
      {/* HIGH-CONTRAST WOW FACTOR BACKGROUND (FIX FOR EMBEDDED GRAPHICS)           */}
      {/* ========================================================================= */}
      
      {/* 1. Sharper, Highly Visible Dot Matrix Grid */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle, #27272a 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* 2. Bold, Cinematic Color Beam Flares (No longer hidden in the dark) */}
      <div className="absolute top-[-25%] left-[-15%] w-[700px] h-[700px] bg-gradient-to-br from-indigo-600/20 via-purple-600/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[600px] h-[600px] bg-gradient-to-tl from-blue-600/15 via-indigo-600/5 to-transparent rounded-full blur-[110px] pointer-events-none" />

      {/* 3. Deep Concentrated Ambient Back-Glow directly behind the login panel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* 4. Cross-Crossing Tech-Lines Layer with Boosted Opacity */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        <svg className="w-full h-full stroke-zinc-800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <line x1="-10%" y1="30%" x2="110%" y2="70%" stroke="url(#neon-grad)" strokeWidth="2" />
          <line x1="30%" y1="-10%" x2="70%" y2="110%" stroke="url(#neon-grad)" strokeWidth="2" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* GLOWING AUTHENTICATION CARD PLATFORM                                      */}
      {/* ========================================================================= */}
      <div className="w-full max-w-md border border-zinc-800/80 bg-zinc-950/80 rounded-2xl p-8 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative z-10 space-y-7 group">
        
        {/* Subtle top edge neon border border bar to break up flat cards */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative">
              {/* Vibrant pulsing neon card shadow behind the logo avatar */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-xl">
                <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img
                    src="/icon-192.png"
                    alt="SnapVault Logo"
                    className="h-10 w-10 object-contain brightness-120 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
              SnapVault
            </h1>
            <p className="text-xs text-zinc-400 font-medium tracking-wide">
              AI Powered Receipt Management
            </p>
          </div>
        </div>

        {/* Input Form Fields Wrapper */}
        <div className="space-y-4">
          
          {/* Email field input wrapper */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 px-0.5">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/30 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 p-3.5 rounded-xl text-xs font-medium outline-none focus:border-indigo-500 focus:bg-zinc-900/60 transition-all duration-150 leading-none shadow-inner"
            />
          </div>

          {/* Password field entry card frame */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 px-0.5">
              Password
            </label>
            <div className="relative w-full flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/30 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 p-3.5 pr-11 rounded-xl text-xs font-medium outline-none focus:border-indigo-500 focus:bg-zinc-900/60 transition-all duration-150 leading-none shadow-inner"
              />
              
              {/* Interactive visibility link anchor trigger toggle switch */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors focus:outline-none"
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Primary Call To Action Button Component */}
          <div className="pt-2">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3.5 rounded-xl text-xs transition-all duration-150 shadow-[0_4px_20px_rgba(255,255,255,0.08)] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-zinc-400 border-t-zinc-950 animate-spin" />
                  <span>Logging In...</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </div>

        {/* Footer Redirection Meta Links */}
        <p className="text-center text-xs text-zinc-400 font-medium">
          Don't have an account?
          <Link
            to="/register"
            className="text-indigo-400 ml-1.5 font-bold hover:text-indigo-300 hover:underline transition-all"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}