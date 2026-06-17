import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Home, Upload, ScanLine, History, Wallet, Gift, MessageSquareCode, User } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, logoutUser } from "./firebase/authService";

import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/Upload";
import HistoryPage from "./pages/History";
import Budget from "./pages/Budget";
import Scan from "./pages/Scan";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AIChat from "./pages/AIChat";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";

// --- Protected Route Guard ---
function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-zinc-400 font-medium text-sm">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// --- App Navigation Sidebar Layout Manager ---
function AppLayout({ user }) {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Helper component for matching links cleanly with their labels
  const SidebarLink = ({ to, label, icon: Icon }) => {
    const isActive = location.pathname === to || (to === "/" && location.pathname === "/dashboard");
    return (
      <Link 
        to={to} 
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 relative border border-transparent ${
          isActive 
            ? "bg-zinc-900 border-zinc-800 text-white shadow-inner" 
            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-indigo-400" : "text-zinc-500"}`} strokeWidth={2} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen w-screen bg-[#0A0A0F] text-zinc-100 overflow-hidden">
      
      {/* PERSISTENT FULL-WIDTH APP SIDEBAR */}
      {user && (
        <aside className="w-64 border-r border-zinc-900 bg-[#09090e]/80 backdrop-blur-xl flex flex-col justify-between p-6 shrink-0 z-40">
          
          <div className="space-y-8">
            {/* Logo Heading Container */}
            <div className="flex items-center gap-3 px-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                <span className="text-xs font-black text-white">S</span>
              </div>
              <span className="text-sm font-bold tracking-tight text-white">SnapVault</span>
            </div>

            {/* Structured Navigation Hub Stack */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-2 mb-2">Menu</p>
              
              <SidebarLink to="/" label="Dashboard" icon={Home} />
              <SidebarLink to="/upload" label="Upload Receipt" icon={Upload} />
              <SidebarLink to="/scan" label="Quick Scan" icon={ScanLine} />
              <SidebarLink to="/history" label="Activity Ledger" icon={History} />
              <SidebarLink to="/budget" label="Budget Wallet" icon={Wallet} />
              <SidebarLink to="/rewards" label="Rewards Store" icon={Gift} />
              <SidebarLink to="/ai-chat" label="AI Assistant" icon={MessageSquareCode} />
            </div>
          </div>

          {/* User Section Identity Footprint Container */}
          <div className="border-t border-zinc-900 pt-4 space-y-3">
            <Link 
              to="/profile" 
              className={`flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/60 transition-all ${
                location.pathname === "/profile" ? "bg-zinc-900/40 border border-zinc-800" : ""
              }`}
            >
              <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-sm text-indigo-400 shrink-0">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-200 truncate">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user.email}</p>
              </div>
            </Link>

            {/* Quick Session Management Footer Links */}
            <div className="flex items-center justify-between px-2 text-[10px] font-medium text-zinc-500">
              <Link to="/profile" className="hover:text-zinc-200 transition flex items-center gap-1">
                <User className="h-3 w-3" /> Profile
              </Link>
              <span className="text-zinc-800">•</span>
              <button onClick={handleLogout} className="hover:text-red-400 transition">
                Sign Out
              </button>
            </div>
          </div>

        </aside>
      )}

      {/* CORE CONTENT APP SLOT VIEWPORT */}
      <main className="flex-1 overflow-y-auto relative min-w-0">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
        </Routes>
      </main>

    </div>
  );
}

// --- Main Root Core Bootstrapper Entry Point ---
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <AppLayout user={user} />
    </BrowserRouter>
  );
}