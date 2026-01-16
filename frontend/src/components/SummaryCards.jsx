export default function SummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-medium text-slate-500">Total Value</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">
          RM{Number(summary?.totalValue ?? 0).toFixed(2)}
        </div>
        <div className="mt-1 text-xs text-slate-400">Current portfolio value</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-medium text-slate-500">Total Cost</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">
          RM{Number(summary?.totalCost ?? 0).toFixed(2)}
        </div>
        <div className="mt-1 text-xs text-slate-400">Total invested amount</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-medium text-slate-500">Total P&amp;L</div>
        <div
          className={[
            "mt-2 text-2xl font-semibold tracking-tight",
            Number(summary?.totalPnL ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600",
          ].join(" ")}
        >
          RM{Number(summary?.totalPnL ?? 0).toFixed(2)}
        </div>
        <div className="mt-1 text-xs text-slate-400">Profit / loss overall</div>
      </div>
    </div>
  );
}
