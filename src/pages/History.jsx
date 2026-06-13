import { useEffect, useState } from "react";
import { getReceipts } from "../firebase/receiptService";

export default function History() {
  const [receipts, setReceipts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  
  // New Filter Features
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (error) {
      console.error("Failed to fetch receipts:", error);
    }
  };

  // Helper calculation for the latest added dashboard metrics
  const latestReceipts = [...receipts].reverse().slice(0, 5);

  // Consolidated Filtering Logic
  const filteredReceipts = receipts
    .filter((receipt) => {
      const matchesSearch = receipt.merchant?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || receipt.category === categoryFilter;
      
      // Date constraints filtering
      if (!receipt.date) return matchesSearch && matchesCategory;
      const receiptTime = new Date(receipt.date).getTime();
      const startConstrain = startDate ? new Date(startDate).getTime() : null;
      const endConstrain = endDate ? new Date(endDate).getTime() : null;

      const matchesStartDate = !startConstrain || receiptTime >= startConstrain;
      const matchesEndDate = !endConstrain || receiptTime <= endConstrain;

      return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.date) - new Date(a.date);
      if (sortOrder === "oldest") return new Date(a.date) - new Date(b.date);
      if (sortOrder === "highest") return Number(b.amount || 0) - Number(a.amount || 0);
      if (sortOrder === "lowest") return Number(a.amount || 0) - Number(b.amount || 0);
      return 0;
    });

  const totalSpent = filteredReceipts.reduce(
    (sum, receipt) => sum + Number(receipt.amount || 0), 
    0
  );

  // New Export Utility Feature
  const exportFilteredJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredReceipts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `receipt_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Quick reset utility handler
  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setSortOrder("newest");
    setStartDate("");
    setEndDate("");
  };

  const isFilterActive = search !== "" || categoryFilter !== "All" || startDate !== "" || endDate !== "";

  return (
    <div className="mx-auto max-w-6xl p-6 text-white animate-fade-in">
      
      {/* Header Viewport */}
      <div className="mt-10 mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">Transaction Records</p>
          <h1 className="mt-2 text-5xl font-bold tracking-tight">Receipt History</h1>
          <p className="mt-2 text-slate-400">Search, filter, and review your historical company expenses.</p>
        </div>
        <button
          onClick={exportFilteredJSON}
          className="w-full rounded-2xl bg-violet-600 px-5 py-3.5 font-medium transition hover:bg-violet-500 sm:w-auto"
        >
          📦 Export Filtered Data
        </button>
      </div>

      {/* Recents Widget Slider Accordion */}
      <div className="mb-8 rounded-3xl border border-violet-500/20 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-4 text-xl font-bold text-violet-400">Latest Added Receipts</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          {latestReceipts.map((receipt) => (
            <div key={`latest-${receipt.id}`} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <div>
                <h3 className="truncate font-bold text-slate-100">{receipt.merchant}</h3>
                <p className="text-xs text-violet-300">{receipt.category}</p>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-xs text-slate-500">{receipt.date || "No Date"}</span>
                <span className="font-bold text-emerald-400">RM {Number(receipt.amount || 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Numerical Metrics Summary Block */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-sm font-medium text-slate-400">Filtered Count</p>
          <p className="mt-2 text-3xl font-bold">{filteredReceipts.length} <span className="text-sm font-normal text-slate-500">records</span></p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-sm font-medium text-slate-400">Filtered Total Expenditure</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">RM {totalSpent.toFixed(2)}</p>
        </div>
      </div>

      {/* Controls & Filter Matrix Toolbox Panel */}
      <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">Search Filters Matrix</h3>
          {isFilterActive && (
            <button onClick={resetFilters} className="text-sm font-medium text-violet-400 hover:text-violet-300 transition">
              Reset Filters ↺
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Column 1: Search Queries */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search merchant name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white focus:outline-none focus:border-violet-500"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Groceries">Groceries</option>
              <option value="Bills">Bills</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Column 2: Date Bounds Constraints */}
          <div className="space-y-2 rounded-2xl border border-white/5 bg-black/10 p-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Date Interval Filter</label>
            <div className="flex flex-col gap-2">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-2.5 text-sm text-white focus:outline-none"
              />
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Column 3: Organizing Sorting Layout */}
          <div className="flex flex-col justify-end">
            <label className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Sort Rules</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white focus:outline-none focus:border-violet-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Filtered Database Records Map Grid List */}
      <div className="space-y-4">
        {filteredReceipts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-slate-400 backdrop-blur-xl">
            📭 No data matched your target filter configurations. Try refreshing or clearing variables.
          </div>
        ) : (
          filteredReceipts.map((receipt) => (
            <div
              key={receipt.id}
              className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-violet-500/30 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-xl text-violet-400">
                  📄
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">{receipt.merchant}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-500/15 px-3 py-0.5 text-xs text-violet-300">
                      {receipt.category}
                    </span>
                    <span className="text-xs text-slate-500">• {receipt.date || "Date Unspecified"}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-3 sm:border-none sm:pt-0">
                <span className="text-xs text-slate-400 sm:hidden">Total Billed</span>
                <p className="text-3xl font-extrabold tracking-tight text-white">
                  <span className="text-sm font-semibold text-slate-400 mr-1">RM</span>
                  {Number(receipt.amount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}