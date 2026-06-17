import { useEffect, useState } from "react";
import { getUserProfile, deductPoints } from "../firebase/userService";
import { auth } from "../firebase/authService";
import { redeemReward } from "../firebase/rewardService";

// Asset Imports
import shirt from "../assets/rewards/shirt.png";
import laptopbag from "../assets/rewards/laptopbag.png";
import mug from "../assets/rewards/mug.png";
import powerbank from "../assets/rewards/powerbank.png";
import hoodie from "../assets/rewards/hoodie.png";
import zus from "../assets/rewards/zus.jpg";
import starbucks from "../assets/rewards/starbucks.jpg";

// Rewards Data Array
const rewards = [
  {
    id: 1,
    name: "ZUS Voucher",
    points: 200,
    image: zus,
    type: "voucher",
  },
  {
    id: 2,
    name: "Starbucks Voucher",
    points: 300,
    image: starbucks,
    type: "voucher",
  },
  {
    id: 3,
    name: "SnapVault Mug",
    points: 800,
    image: mug,
    type: "physical",
  },
  {
    id: 4,
    name: "SnapVault T-Shirt",
    points: 1000,
    image: shirt,
    type: "physical",
  },
  {
    id: 5,
    name: "SnapVault Hoodie",
    points: 2500,
    image: hoodie,
    type: "physical",
  },
  {
    id: 6,
    name: "SnapVault Laptop Bag",
    points: 3500,
    image: laptopbag,
    type: "physical",
  },
  {
    id: 7,
    name: "SnapVault Power Bank",
    points: 5000,
    image: powerbank,
    type: "physical",
  },
];

export default function Rewards() {
  // States
  const [userData, setUserData] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    postcode: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      if (!auth.currentUser) return;

      const data = await getUserProfile(auth.currentUser.uid);
      setUserData(data);
    };

    loadUser();
  }, []);

  // Action Handlers
  const handleRedeem = (reward) => {
    setSelectedReward(reward);
    setShowModal(true);
  };

  const confirmRedeem = async () => {
    try {
      const success = await deductPoints(
        auth.currentUser.uid,
        selectedReward.points
      );

      if (!success) {
        alert("Not enough points");
        return;
      }

      await redeemReward(selectedReward, auth.currentUser, formData);
      alert("Reward Redeemed Successfully!");
      setShowModal(false);

      // Refresh user profile points display
      const updated = await getUserProfile(auth.currentUser.uid);
      setUserData(updated);
    } catch (error) {
      console.error(error);
      alert("Redemption Failed");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 pb-24">
      
      {/* Top Main Heading Container Block */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-6 relative overflow-hidden">
        <div className="absolute -left-12 -top-12 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none" />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Rewards Store</h1>
          <p className="text-xs text-zinc-400 mt-1">Redeem exclusive SnapVault rewards</p>
        </div>

        {/* User Balance Cards Overlay Frame */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 px-4 min-w-[110px]">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">SnapPoints</span>
            <span className="text-sm font-bold text-amber-400 block mt-0.5 font-mono tracking-tight">
              ⭐ {userData?.points || 0}
            </span>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 px-4 min-w-[110px]">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Member Level</span>
            <span className="text-sm font-bold text-indigo-400 block mt-0.5 font-mono tracking-tight">
              💎 {userData?.level || 1}
            </span>
          </div>
        </div>
      </header>

      {/* Marketplace Multi-Column Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const canRedeem = (userData?.points || 0) >= reward.points;

          return (
            <div
              key={reward.id}
              className="group bg-zinc-900/10 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Media Card Section Viewport */}
              <div className="relative w-full h-48 bg-zinc-950 overflow-hidden shrink-0 border-b border-zinc-900">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300 select-none pointer-events-none"
                />
                {/* Micro Item Category Tag overlay */}
                <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                  {reward.type}
                </span>
              </div>

              {/* Typography Details Area */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-zinc-100 group-hover:text-white transition">{reward.name}</h2>
                  <p className="text-xs font-bold text-amber-400 font-mono tracking-tight">
                    ⭐ {reward.points} Points
                  </p>
                </div>

                {/* State Driven Interactive Action Buttons */}
                {canRedeem ? (
                  <button
                    onClick={() => handleRedeem(reward)}
                    className="w-full bg-zinc-100 hover:bg-white text-zinc-950 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-[0.99]"
                  >
                    Redeem Reward
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-zinc-950 border border-dashed border-zinc-800 py-2 rounded-xl text-[11px] font-semibold text-zinc-500 cursor-not-allowed"
                  >
                    🔒 Need {reward.points - (userData?.points || 0)} More Points
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shipping / Redemption Form Modal Frame */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            
            <div className="border-b border-zinc-800 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Redeem {selectedReward?.name}
              </h2>
            </div>

            {selectedReward?.type === "physical" && (
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-zinc-950 text-xs font-medium text-white placeholder:text-zinc-600 border border-zinc-900 focus:border-indigo-500/50 focus:outline-none transition"
                />

                <input
                  type="text"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-zinc-950 text-xs font-medium text-white placeholder:text-zinc-600 border border-zinc-900 focus:border-indigo-500/50 focus:outline-none transition"
                />

                <textarea
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-zinc-950 text-xs font-medium text-white placeholder:text-zinc-600 border border-zinc-900 focus:border-indigo-500/50 focus:outline-none transition h-20 resize-none leading-relaxed"
                />

                <input
                  type="text"
                  placeholder="Postcode"
                  value={formData.postcode}
                  onChange={(e) =>
                    setFormData({ ...formData, postcode: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-zinc-950 text-xs font-medium text-white placeholder:text-zinc-600 border border-zinc-900 focus:border-indigo-500/50 focus:outline-none transition"
                />
              </div>
            )}

            {/* Modal Dialog Confirm Handles */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 py-2 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRedeem}
                className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-[0.99]"
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}