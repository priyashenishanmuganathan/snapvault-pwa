import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getReceipts } from "../firebase/receiptService";

export default function CalendarPage() {
  const [value, setValue] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    const selectedDate = value.toLocaleDateString("sv-SE");
    const filtered = expenses.filter((expense) => expense.date === selectedDate);
    setSelectedExpenses(filtered);
  }, [value, expenses]);

  const fetchExpenses = async () => {
    try {
      const data = await getReceipts();
      setExpenses(data);
    } catch (error) {
      console.error("Failed to fetch receipts:", error);
    }
  };

  const monthlyTotal = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Filter the selected day's expenses based on user search query
  const filteredSelectedExpenses = selectedExpenses.filter((e) => {
    const matchMerchant = (e.merchant || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = (e.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchMerchant || matchCategory;
  });

  const selectedDayTotal = filteredSelectedExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#07080F] text-[#E2E8F0] p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 pb-24 antialiased selection:bg-indigo-500/30">
      
      {/* Premium Glassmorphic Calendar Grid Overrides */}
      <style>{`
        .react-calendar {
          background: rgba(15, 17, 28, 0.7) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.04) !important;
          font-family: system-ui, -apple-system, sans-serif !important;
          border-radius: 2rem !important;
          padding: 1.5rem;
          width: 100% !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .react-calendar__navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .react-calendar__navigation button {
          color: #FFF !important;
          font-weight: 700;
          font-size: 1.05rem;
          border-radius: 1rem;
          padding: 0.5rem;
          transition: all 0.2s ease;
        }
        .react-calendar__navigation button:enabled:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          transform: scale(1.05);
        }
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none !important;
          color: #4A4F6E !important;
          font-weight: 800;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .react-calendar__tile {
          color: #94A3B8 !important;
          padding: 1.25rem 0.25rem 0.75rem 0.25rem !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: 85px;
          border-radius: 1.25rem;
          transition: all 0.2s ease;
          position: relative;
          font-weight: 600;
        }
        @media (max-width: 640px) {
          .react-calendar__tile {
            min-height: 70px;
            padding: 0.75rem 0.1rem !important;
          }
        }
        .react-calendar__tile:enabled:hover {
          background: rgba(99, 102, 241, 0.1) !important;
          color: #FFF !important;
        }
        .react-calendar__tile--now {
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #818CF8 !important;
        }
        .react-calendar__tile--active {
          background: linear-gradient(135deg, #4F46E5 0%, #3730A3 100%) !important;
          color: #FFF !important;
          box-shadow: 0 12px 20px -6px rgba(79, 70, 229, 0.5);
          border-radius: 1.25rem !important;
        }
        .glow-indicator {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          position: absolute;
          bottom: 10px;
        }
      `}</style>

      {/* Overview Cards Header */}
      <header className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121526] to-[#1C1F3B] border border-white/[0.04] p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent This Month</span>
          <p className="text-2xl font-black text-[#818CF8] mt-2 font-mono">
            RM {monthlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121526] to-[#1C1F3B] border border-white/[0.04] p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Logs</span>
          <p className="text-2xl font-black text-white mt-2 font-mono">
            {expenses.length} {expenses.length === 1 ? "Receipt" : "Receipts"}
          </p>
        </div>
      </header>

      {/* Main Responsive Split Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand Container: Standard Calendar Layout Grid */}
        <main className="lg:col-span-7 xl:col-span-8">
          <Calendar
            onChange={setValue}
            value={value}
            onClickDay={(date) => setValue(date)}
            tileContent={({ date, view }) => {
              if (view !== "month") return null;
              const day = date.toLocaleDateString("sv-SE");
              const dayExpenses = expenses.filter((e) => e.date === day);
              const total = dayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

              if (total > 0) {
                const isHigh = total > 100;
                return (
                  <div className="flex flex-col items-center w-full mt-1.5 space-y-1">
                    <span className="amount-badge text-[9px] font-extrabold px-1 rounded-md bg-white/5 text-slate-200 transition-colors hidden sm:inline-block">
                      RM{total.toFixed(0)}
                    </span>
                    <span className={`glow-indicator ${
                      isHigh ? "bg-rose-400 shadow-[0_0_8px_#F43F5E]" : "bg-emerald-400 shadow-[0_0_8px_#10B981]"
                    }`} />
                  </div>
                );
              }
              return null;
            }}
          />
        </main>

        {/* Right Hand Container: Selected Day Ledger View & Live Text Search Panel */}
        <section className="lg:col-span-5 xl:col-span-4 bg-[#0F111C]/80 border border-white/[0.04] backdrop-blur-xl rounded-3xl p-5 md:p-6 space-y-4 shadow-2xl lg:sticky lg:top-6">
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Selected Date</p>
              <h3 className="text-base font-bold text-white mt-0.5">
                {value.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </h3>
            </div>
            {selectedDayTotal > 0 && (
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Day Total</p>
                <p className="text-base font-black text-indigo-400 font-mono mt-0.5">RM {selectedDayTotal.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Quick Real-time Text Filter Field */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Filter by store or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#07080F] border border-white/[0.06] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition duration-150"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Individual Interactive Receipts Loop */}
          <div className="space-y-2.5 max-h-[350px] lg:max-h-[480px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
            {filteredSelectedExpenses.length === 0 ? (
              <div className="py-14 text-center border border-dashed border-white/[0.06] rounded-2xl flex flex-col items-center justify-center p-4">
                <span className="text-xl mb-1.5">🍃</span>
                <p className="text-xs font-semibold text-slate-500">No matching items found.</p>
              </div>
            ) : (
              filteredSelectedExpenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] hover:border-indigo-500/20 rounded-2xl transition duration-150 group"
                >
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition truncate">
                      {expense.merchant || "Unknown Merchant"}
                    </p>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-white/[0.04] text-slate-400 px-2 py-0.5 rounded border border-white/[0.04]">
                      {expense.category || "General"}
                    </span>
                  </div>
                  <div className="shrink-0 ml-4">
                    <span className="text-xs font-black text-white bg-white/[0.02] border border-white/[0.04] px-2.5 py-1.5 rounded-xl font-mono">
                      RM {Number(expense.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}