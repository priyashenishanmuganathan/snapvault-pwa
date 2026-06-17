import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserProfile, calculateFinancialScore } from "../firebase/userService";
import { getRewardHistory } from "../firebase/historyService";
import { auth } from "../firebase/authService";

// Helper function to get XP threshold per level
const getNextLevelXP = (level) => {
  switch (level) {
    case 1:
      return 500;
    case 2:
      return 1000;
    case 3:
      return 2000;
    case 4:
      return 5000;
    default:
      return 5000;
  }
};

export default function Profile() {
  const navigate = useNavigate();

  // States
  const [userData, setUserData] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Unified Data Fetching
  useEffect(() => {
    const loadData = async () => {
      if (!auth.currentUser) return;

      try {
        const profile = await getUserProfile(auth.currentUser.uid);
        setUserData(profile);

        const rewards = await getRewardHistory(auth.currentUser.uid);
        setHistory(rewards);
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    loadData();
  }, []);

  // Calculations
  const nextLevelXP = getNextLevelXP(userData?.level || 1);
  const progress = ((userData?.points || 0) / nextLevelXP) * 100;

  const financialScore = calculateFinancialScore(
    userData?.totalSpent || 0,
    userData?.totalReceipts || 0,
    userData?.points || 0
  );

  // Achievement Tracking Logic
  const achievements = [];
  if ((userData?.points || 0) >= 1) achievements.push("📸 First Receipt");
  if ((userData?.points || 0) >= 500) achievements.push("🥉 Bronze Saver");
  if ((userData?.points || 0) >= 1000) achievements.push("🥈 Silver Saver");
  if ((userData?.points || 0) >= 5000) achievements.push("🥇 Gold Saver");

  // Score-Driven AI Personality Evaluation
  const personality =
    financialScore >= 80
      ? "Strategic Saver"
      : financialScore >= 50
      ? "Balanced Spender"
      : "Impulse Explorer";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 pb-24">
      
      {/* Profile Base Heading Layout */}
      <header className="border-b border-zinc-900 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">AI Financial Identity</h1>
        <p className="text-xs text-zinc-400 mt-1">Manage and view your financial footprint and system status</p>
      </header>

      {/* Main Identity Info Summary Block */}
      <div className="grid gap-6 md:grid-cols-12 items-start">
        
        {/* Core Profile Identity Badge */}
        <div className="md:col-span-7 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl font-bold text-indigo-400 shadow-inner shrink-0">
            {auth.currentUser?.email?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white truncate">{auth.currentUser?.email?.split('@')[0]}</h2>
            <p className="text-xs text-zinc-400 font-medium truncate">{auth.currentUser?.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide uppercase">
                💎 Level {userData?.level || 1} Member
              </span>
              <span className="bg-indigo-950/40 text-indigo-300 border border-indigo-900/50 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide uppercase">
                ⭐ {userData?.points || 0} SnapPoints
              </span>
            </div>
          </div>
        </div>

        {/* SnapLevel Performance Gauge Tracker Box */}
        <div className="md:col-span-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">💎 SnapLevel</h2>
            <span className="text-xs font-bold text-indigo-400 font-mono">Level {userData?.level || 1}</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60">
              <div
                style={{ width: `${Math.min(progress, 100)}%` }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              />
            </div>
            <div className="text-right text-[11px] font-mono font-medium text-zinc-500 tracking-tight">
              {userData?.points || 0} / {nextLevelXP} XP
            </div>
          </div>
        </div>
      </div>

      {/* AI Financial Character Diagnostics */}
      <section className="border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/[0.02] rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-4">
          <span className="text-sm">🤖</span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">AI Financial Identity</h2>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h3 className="text-lg font-bold text-white tracking-tight">{personality}</h3>
            <p className="text-xs font-medium text-zinc-400">
              Financial Score: 
              <span className="text-emerald-400 ml-1.5 font-bold font-mono tracking-tight text-sm">
                {financialScore}/100
              </span>
            </p>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl">
            Generated from spending, receipts scanned, reward participation, and account activity.
          </p>
        </div>
      </section>

      {/* Grid Block: Left Side Unlocked Badges, Right Side Order Logs */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* Achievements Matrix Panel Grid Area */}
        <section className="lg:col-span-5 border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <span className="text-sm">🏆</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Achievements</h2>
          </div>

          {achievements.length > 0 ? (
            <div className="grid gap-2 max-h-[320px] overflow-y-auto pr-1">
              {achievements.map((badge, index) => (
                <div key={index} className="bg-zinc-900/40 border border-zinc-900 text-zinc-300 rounded-xl p-3 text-xs font-semibold tracking-wide flex items-center gap-2">
                  {badge}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-6 italic text-center">No achievements unlocked yet. Track expenses to begin!</p>
          )}
        </section>

        {/* Reward Management History Table Log Stream */}
        <section className="lg:col-span-7 border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <span className="text-sm">🎁</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Reward History</h2>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 italic text-center">No rewards redeemed.</p>
          ) : (
            <div className="grid gap-2 max-h-[320px] overflow-y-auto pr-1">
              {history.map((reward) => (
                <div
                  key={reward.id || reward.timestamp}
                  onClick={() => setSelectedOrder(reward)}
                  className="bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800/80 p-3.5 rounded-xl cursor-pointer flex items-center justify-between gap-4 transition-all"
                >
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-semibold text-xs text-zinc-200 truncate">{reward.rewardName}</h3>
                    <p className="text-[11px] font-medium text-zinc-500 font-mono">
                      {reward.pointsUsed} Points Used
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-md shrink-0">
                    {reward.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Shipping Details Modal Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 border-b border-zinc-800 pb-2">📦 Order Details</h2>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex py-1 border-b border-zinc-900"><span className="text-zinc-500 w-24 shrink-0 font-medium">Reward:</span> <span className="font-semibold">{selectedOrder.rewardName}</span></div>
              <div className="flex py-1 border-b border-zinc-900"><span className="text-zinc-500 w-24 shrink-0 font-medium">Status:</span> <span className="text-indigo-400 font-semibold">{selectedOrder.status || "Pending"}</span></div>
              <div className="flex py-1 border-b border-zinc-900"><span className="text-zinc-500 w-24 shrink-0 font-medium">Points:</span> <span className="font-mono">{selectedOrder.pointsUsed}</span></div>
              
              {selectedOrder.fullName && <div className="flex py-1 border-b border-zinc-900"><span className="text-zinc-500 w-24 shrink-0 font-medium">Recipient:</span> <span>{selectedOrder.fullName}</span></div>}
              {selectedOrder.phone && <div className="flex py-1 border-b border-zinc-900"><span className="text-zinc-500 w-24 shrink-0 font-medium">Phone:</span> <span className="font-mono">{selectedOrder.phone}</span></div>}
              {selectedOrder.address && <div className="flex py-1 border-b border-zinc-900"><span className="text-zinc-500 w-24 shrink-0 font-medium">Address:</span> <span className="leading-relaxed">{selectedOrder.address}</span></div>}
              {selectedOrder.postcode && <div className="flex py-1"><span className="text-zinc-500 w-24 shrink-0 font-medium">Postcode:</span> <span className="font-mono">{selectedOrder.postcode}</span></div>}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full bg-zinc-100 hover:bg-white text-zinc-950 py-2.5 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}