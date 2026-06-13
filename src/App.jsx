import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Home, Upload, ScanLine, History, Wallet } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/authService";

import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/Upload";
import HistoryPage from "./pages/History";
import Budget from "./pages/Budget";
import Scan from "./pages/Scan";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AIChat from "./pages/AIChat";

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
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// --- Main Application Component ---
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
      <div className="min-h-screen bg-[#0A0A0F] pb-32">
        
        {/* Route Configuration */}
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ai-chat" element={<AIChat />} />
        </Routes>

        {/* Global Floating Navigation Bar */}
        {user && (
          <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex justify-around py-4 shadow-2xl z-50">
            <Link to="/">
              <Home className="text-white hover:text-violet-400 transition-colors" />
            </Link>

            <Link to="/upload">
              <Upload className="text-white hover:text-violet-400 transition-colors" />
            </Link>

            <Link to="/scan">
              <ScanLine className="text-violet-400 hover:text-violet-300 transition-colors" />
            </Link>

            <Link to="/history">
              <History className="text-white hover:text-violet-400 transition-colors" />
            </Link>

            <Link to="/budget">
              <Wallet className="text-white hover:text-violet-400 transition-colors" />
            </Link>
          </nav>
        )}

      </div>
    </BrowserRouter>
  );
}