import { useEffect, useState } from "react";
import { getReceipts } from "../firebase/receiptService";

export default function History() {
  const [receipts, setReceipts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination Architecture
  const [currentPage, setCurrentPage] = useState(1);
  const nodesPerPage = 8;

  useEffect(() => {
    loadReceipts();
  }, []);

  // Reset page layout matrix whenever structural filter states change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, startDate, endDate, sortOrder]);

  const loadReceipts = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (error) {
      console.error("Failed to fetch receipts:", error);
    }
  };

  // Consolidated Filtering Logic Block
  const filteredReceipts = receipts
    .filter((receipt) => {
      const matchesSearch = receipt.merchant?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || receipt.category === categoryFilter;
      
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

  // Calculate local paginated boundaries
  const indexOfLastNode = currentPage * nodesPerPage;
  const indexOfFirstNode = indexOfLastNode - nodesPerPage;
  const currentPaginatedNodes = filteredReceipts.slice(indexOfFirstNode, indexOfLastNode);
  const totalPages = Math.ceil(filteredReceipts.length / nodesPerPage);

  const totalSpent = filteredReceipts.reduce(
    (sum, receipt) => sum + Number(receipt.amount || 0), 
    0
  );

  const exportFilteredJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredReceipts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `receipt_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setSortOrder("newest");
    setStartDate("");
    setEndDate("");
  };

  const isFilterActive = search !== "" || categoryFilter !== "All" || startDate !== "" || endDate !== "";

  return (
    <div className="min-h-screen bg-[#07070C] text-[#F2F3F7] p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-6 pb-24 selection:bg-[#5B8CFF]/30">
      
      {/* ── Page Header Module ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1E27]/60 pb-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#5C6072]">Data Ingestion History</div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Transaction Records</h1>
          <p className="text-xs text-[#9498A8] mt-0.5">Review, filter, and export verified ledger objects.</p>
        </div>
        <button
          onClick={exportFilteredJSON}
          className="bg-[#1C1E27] hover:bg-[#252834] text-xs font-mono text-[#F2F3F7] border border-[#2D313F] px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <span>⚡</span> EXPORT DATABASE (.JSON)
        </button>
      </header>

      {/* ── Telemetry Quick-Look Summary Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0D0E14] border border-[#1C1E27] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#5C6072]">Match Count</span>
          <span className="text-lg font-bold font-mono text-white mt-1">
            {filteredReceipts.length} <span className="text-xs font-normal text-[#5C6072]">nodes matched</span>
          </span>
        </div>
        <div className="bg-[#0D0E14] border border-[#1C1E27] rounded-xl p-4 flex flex-col justify-between sm:col-span-2 bg-gradient-to-r from-[#0D0E14] to-[#5B8CFF]/[0.02]">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#5C6072]">Aggregate Billed Outflow</span>
          <span className="text-lg font-bold font-mono text-[#5B8CFF] mt-1">
            RM {totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* ── Modern Centralized Filter Matrix Console ── */}
      <section className="bg-[#0D0E14] border border-[#1C1E27] rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1C1E27]/50 pb-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#9498A8]">Query Sorting & Filter Array</div>
          {isFilterActive && (
            <button onClick={resetFilters} className="text-[10px] font-mono text-[#5B8CFF] hover:underline transition">
              CLEAR CONFIGS ↺
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Merchant Search & Category Selection (6 Cols) */}
          <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Search merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#1C1E27] bg-[#07070C] p-3 px-4 text-xs font-medium text-white placeholder:text-[#5C6072] focus:outline-none focus:border-[#5B8CFF] transition"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-[#1C1E27] bg-[#07070C] p-3 px-4 text-xs font-medium text-[#9498A8] focus:outline-none focus:border-[#5B8CFF] transition cursor-pointer"
            >
              <option value="All">All Segments</option>
              {["Food", "Transport", "Shopping", "Groceries", "Bills", "Entertainment", "Healthcare", "Education", "Others"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date Bounds Inputs (4 Cols) */}
          <div className="md:col-span-4 flex items-center gap-1.5 bg-[#07070C] border border-[#1C1E27] rounded-xl p-1.5">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent text-[11px] font-mono text-[#9498A8] focus:outline-none p-1 invert-[0.8] brightness-75"
            />
            <span className="text-[#5C6072] text-xs font-mono">→</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent text-[11px] font-mono text-[#9498A8] focus:outline-none p-1 invert-[0.8] brightness-75"
            />
          </div>

          {/* Sort Architecture Rules Selector (2 Cols) */}
          <div className="md:col-span-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-xl border border-[#1C1E27] bg-[#07070C] p-3 px-4 text-xs font-medium text-[#9498A8] focus:outline-none focus:border-[#5B8CFF] transition cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Price</option>
              <option value="lowest">Lowest Price</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Main Ingestion Invariant Records Ledger ── */}
      <div className="space-y-2">
        {filteredReceipts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#1C1E27] bg-[#0D0E14]/40 p-12 text-center text-xs font-mono text-[#5C6072]">
            Telemetry target array returned 0 variables matching your set constraints.
          </div>
        ) : (
          currentPaginatedNodes.map((receipt) => (
            <div
              key={receipt.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#1C1E27]/70 bg-[#0D0E14] p-4 transition-all duration-150 hover:border-[#1C1E27] hover:bg-gradient-to-r hover:from-[#0D0E14] hover:to-[#5B8CFF]/[0.01]"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1C1E27]/60 border border-[#1C1E27] text-xs text-[#9498A8] font-mono">
                  NODE
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-[#F2F3F7] group-hover:text-white truncate transition-colors">
                    {receipt.merchant || "Unknown Entity"}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-[#5B8CFF] bg-[#5B8CFF]/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide text-[8px]">
                      {receipt.category}
                    </span>
                    <span className="text-[#5C6072]">•</span>
                    <span className="text-[#5C6072]">{receipt.date || "NO_DATE_VECTOR"}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end border-t border-[#1C1E27]/40 pt-2.5 sm:border-none sm:pt-0 shrink-0">
                <span className="text-[10px] font-mono text-[#5C6072] sm:hidden">BALANCE MATRICES</span>
                <p className="text-sm font-bold font-mono text-white tracking-tight">
                  <span className="text-[10px] font-normal text-[#5C6072] mr-1">RM</span>
                  {Number(receipt.amount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Futuristic Pagination Control Deck ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#1C1E27]/40 font-mono text-xs text-[#5C6072]">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="bg-[#0D0E14] border border-[#1C1E27] text-[#9498A8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition"
          >
            ◀ PREV
          </button>
          
          <span>
            PAGE <span className="text-white font-bold">{currentPage}</span> OF <span className="text-[#9498A8]">{totalPages}</span>
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="bg-[#0D0E14] border border-[#1C1E27] text-[#9498A8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition"
          >
            NEXT ▶
          </button>
        </div>
      )}

    </div>
  );
}