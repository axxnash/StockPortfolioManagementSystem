import { useEffect, useState } from "react";
import api from "../api/axios";
import SummaryCards from "../components/SummaryCards";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [portfolioId, setPortfolioId] = useState(() => localStorage.getItem("portfolio_id") || "");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const loadPortfolios = async () => {
    const res = await api.get("/portfolios");
    setPortfolios(res.data);

    // auto-create if none
    if (!res.data.length) {
      const created = await api.post("/portfolios", { name: "My Portfolio" });
      const newId = created.data.portfolio_id;
      localStorage.setItem("portfolio_id", newId);
      setPortfolioId(String(newId));
      return newId;
    }

    // pick saved or first
    if (!portfolioId) {
      const first = res.data[0].portfolio_id;
      localStorage.setItem("portfolio_id", first);
      setPortfolioId(String(first));
      return first;
    }
    return Number(portfolioId);
  };

  const loadDashboard = async (pid) => {
    const res = await api.get(`/analytics/dashboard?portfolio_id=${pid}`);
    setData(res.data);
  };

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const pid = await loadPortfolios();
        await loadDashboard(pid);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load dashboard");
      }
    })();
    // eslint-disable-next-line
  }, []);

  const onPortfolioChange = async (e) => {
    const pid = e.target.value;
    setPortfolioId(pid);
    localStorage.setItem("portfolio_id", pid);
    await loadDashboard(pid);
  };

  const exportCsv = () => {
    const pid = portfolioId;
    downloadCsv(pid);
  };

  const downloadCsv = async (pid) => {
    const res = await api.get(`/export/portfolio?portfolio_id=${pid}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio_${pid}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const pieData = data?.distribution
    ? {
        labels: data.distribution.map((d) => d.label),
        datasets: [
          {
            data: data.distribution.map((d) => d.value),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#FF6384",
              "#C9CBCF",
              "#4BC0C0",
              "#FF6384",
            ].slice(0, data.distribution.length),
            borderColor: "#ffffff",
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [{ data: [] }] };

  const barData = data?.pnlBySymbol
    ? {
        labels: data.pnlBySymbol.map((d) => d.symbol),
        datasets: [
          {
            label: "P&L",
            data: data.pnlBySymbol.map((d) => d.pnl),
            backgroundColor: data.pnlBySymbol.map((d) => (d.pnl >= 0 ? "#4CAF50" : "#F44336")),
            borderColor: data.pnlBySymbol.map((d) => (d.pnl >= 0 ? "#388E3C" : "#D32F2F")),
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [{ data: [] }] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your portfolio performance and holdings
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            className="sm:mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
            onClick={exportCsv}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Summary */}
      <SummaryCards summary={data?.summary} />

      {/* Holdings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-sm font-semibold">Holdings</div>
            <div className="text-xs text-slate-500">All current positions</div>
          </div>
          <div className="text-xs text-slate-400">
            {data?.holdings?.length ? `${data.holdings.length} items` : ""}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3">Symbol</th>
                <th className="px-5 py-3">Broker</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Buy Price</th>
                <th className="px-5 py-3">Current Price</th>
                <th className="px-5 py-3">Total Value</th>
                <th className="px-5 py-3">P&amp;L</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(data?.holdings || []).map((h) => (
                <tr key={h.holding_id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3 font-medium text-slate-900">{h.symbol}</td>
                  <td className="px-5 py-3 text-slate-600">{h.broker_platform || "-"}</td>
                  <td className="px-5 py-3 text-slate-700">{Math.floor(h.quantity)}</td>
                  <td className="px-5 py-3 text-slate-700">RM{Number(h.buy_price).toFixed(2)}</td>
                  <td className="px-5 py-3 text-slate-700">RM{Number(h.currentPrice ?? h.current).toFixed(2)}</td>
                  <td className="px-5 py-3 text-slate-700">RM{Number(h.marketValue ?? h.value).toFixed(2)}</td>
                  <td
                    className={[
                      "px-5 py-3 font-medium",
                      Number(h.pnl) >= 0 ? "text-emerald-600" : "text-rose-600",
                    ].join(" ")}
                  >
                    RM{Number(h.pnl).toFixed(2)}
                  </td>
                </tr>
              ))}

              {!data?.holdings?.length && (
                <tr>
                  <td className="px-5 py-6 text-slate-500" colSpan="7">
                    No holdings yet. Add stocks to see charts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Portfolio Distribution</div>
              <div className="text-xs text-slate-500">By broker</div>
            </div>
          </div>
          <div className="h-[320px]">
            <Pie data={pieData} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Profit / Loss</div>
              <div className="text-xs text-slate-500">By symbol</div>
            </div>
          </div>
          <div className="h-[320px]">
            <Bar 
              data={barData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false, // Allow negative values to show
                    ticks: {
                      callback: function(value) {
                        return 'RM' + Number(value).toFixed(2);
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
