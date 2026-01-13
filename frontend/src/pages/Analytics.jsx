import { useEffect, useState } from "react";
import api from "../api/axios";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Analytics() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const pid = localStorage.getItem("portfolio_id");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/analytics/dashboard?portfolio_id=${pid}`);
        setData(res.data);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load analytics");
      }
    })();
  }, [pid]);

  const pieData = data?.distribution
    ? {
        labels: data.distribution.map((d) => d.label),
        datasets: [{
          data: data.distribution.map((d) => d.value),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF',
            '#4BC0C0',
            '#FF6384'
          ].slice(0, data.distribution.length),
          borderColor: '#ffffff',
          borderWidth: 1
        }],
      }
    : { labels: [], datasets: [{ data: [] }] };

  const barData = data?.pnlBySymbol
    ? {
        labels: data.pnlBySymbol.map((d) => d.symbol),
        datasets: [{
          label: 'P&L',
          data: data.pnlBySymbol.map((d) => d.pnl),
          backgroundColor: data.pnlBySymbol.map((d) => d.pnl >= 0 ? '#4CAF50' : '#F44336'),
          borderColor: data.pnlBySymbol.map((d) => d.pnl >= 0 ? '#388E3C' : '#D32F2F'),
          borderWidth: 1
        }],
      }
    : { labels: [], datasets: [{ data: [] }] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visual breakdown of distribution and profit/loss
        </p>
      </div>

      {/* Error */}
      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* If no portfolio id */}
      {!pid && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No portfolio selected yet. Go to Dashboard and create/select a portfolio.
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3">
            <div className="text-sm font-semibold">Distribution</div>
            <div className="text-xs text-slate-500">By broker</div>
          </div>
          <div className="h-[340px]">
            <Pie data={pieData} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3">
            <div className="text-sm font-semibold">Profit / Loss</div>
            <div className="text-xs text-slate-500">By symbol</div>
          </div>
          <div className="h-[340px]">
            <Bar data={barData} />
          </div>
        </div>
      </div>

      {/* Quick stats (optional UI only, uses existing data safely) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Symbols tracked</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {(data?.pnlBySymbol || []).length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Brokers in distribution</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {(data?.distribution || []).length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Holdings</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {(data?.holdings || []).length}
          </div>
        </div>
      </div>
    </div>
  );
}
