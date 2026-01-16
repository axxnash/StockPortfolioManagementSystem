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
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  // for edit UI
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    stock_id: "",
    broker_id: "",
    quantity: "",
    invested: "", // (your "buy price per share" for now)
  });

  const [stocks, setStocks] = useState([]);
  const [brokers, setBrokers] = useState([]);

  const loadDashboard = async () => {
    const res = await api.get(`/analytics/dashboard`);
    setData(res.data);
  };

  const loadDropdowns = async () => {
    const [sRes, bRes] = await Promise.all([api.get("/stocks"), api.get("/brokers")]);
    setStocks(sRes.data);
    setBrokers(bRes.data);
  };

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        await loadDropdowns();
        await loadDashboard();
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load dashboard");
      }
    })();
  }, []);

  const downloadCsv = async () => {
    const res = await api.get(`/export/portfolio`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // ===== Edit / Delete actions =====
  const startEdit = (h) => {
    setEditingId(h.portfolio_id);
    setEditForm({
      stock_id: h.stock_id || "",
      broker_id: h.broker_id || "",
      quantity: String(h.quantity ?? ""),
      invested: String(h.invested ?? ""), // buy price/share for now
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ stock_id: "", broker_id: "", quantity: "", invested: "" });
  };

  const saveEdit = async (portfolio_id) => {
    try {
      setErr("");

      await api.put(`/holdings/${portfolio_id}`, {
        stock_id: editForm.stock_id,
        broker_id: editForm.broker_id,
        quantity: Number(editForm.quantity),
        invested: Number(editForm.invested),
      });

      cancelEdit();
      await loadDashboard();
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to update holding");
    }
  };

  const deleteHolding = async (portfolio_id) => {
    const ok = window.confirm("Delete this holding?");
    if (!ok) return;

    try {
      setErr("");
      await api.delete(`/holdings/${portfolio_id}`);
      await loadDashboard();
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to delete holding");
    }
  };

  // ===== Charts =====
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
              "#C9CBCF",
            ].slice(0, data.distribution.length),
            borderColor: "#ffffff",
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [{ data: [] }] };

  const barData = data?.pnlBySymbol
    ? {
        labels: data.pnlBySymbol.map((d) => `${d.symbol} (${d.broker})`),
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
            onClick={downloadCsv}
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
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(data?.holdings || []).map((h) => {
                const isEditing = editingId === h.portfolio_id;

                return (
                  <tr key={h.portfolio_id} className="group hover:bg-slate-50/60 transition">
                    {/* Symbol */}
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {isEditing ? (
                        <select
                          className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
                          value={editForm.stock_id}
                          onChange={(e) => setEditForm({ ...editForm, stock_id: e.target.value })}
                          required
                        >
                          <option value="">Select</option>
                          {stocks.map((s) => (
                            <option key={s.stock_id} value={s.stock_id}>
                              {s.stock_symbol} - {s.stock_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        h.stock_symbol
                      )}
                    </td>

                    {/* Broker */}
                    <td className="px-5 py-3 text-slate-600">
                      {isEditing ? (
                        <select
                          className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
                          value={editForm.broker_id}
                          onChange={(e) => setEditForm({ ...editForm, broker_id: e.target.value })}
                          required
                        >
                          <option value="">Select</option>
                          {brokers.map((b) => (
                            <option key={b.broker_id} value={b.broker_id}>
                              {b.broker_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        h.broker_name || "-"
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="px-5 py-3 text-slate-700">
                      {isEditing ? (
                        <input
                          className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                          value={editForm.quantity}
                          onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                          inputMode="decimal"
                          required
                        />
                      ) : (
                        Number(h.quantity).toFixed(2)
                      )}
                    </td>

                    {/* Buy Price (invested) */}
                    <td className="px-5 py-3 text-slate-700">
                      {isEditing ? (
                        <input
                          className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                          value={editForm.invested}
                          onChange={(e) => setEditForm({ ...editForm, invested: e.target.value })}
                          inputMode="decimal"
                          required
                        />
                      ) : (
                        `RM${Number(h.buy_price ?? h.invested ?? 0).toFixed(2)}`
                      )}
                    </td>

                    {/* Current */}
                    <td className="px-5 py-3 text-slate-700">RM{Number(h.current).toFixed(2)}</td>

                    {/* Value */}
                    <td className="px-5 py-3 text-slate-700">RM{Number(h.value).toFixed(2)}</td>

                    {/* PnL */}
                    <td
                      className={[
                        "px-5 py-3 font-medium",
                        Number(h.pnl) >= 0 ? "text-emerald-600" : "text-rose-600",
                      ].join(" ")}
                    >
                      RM{Number(h.pnl).toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <div className="flex gap-1.5">
                          <button
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                            onClick={() => saveEdit(h.portfolio_id)}
                          >
                            Save
                          </button>
                          <button
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            onClick={() => startEdit(h)}
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => deleteHolding(h.portfolio_id)}
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!data?.holdings?.length && (
                <tr>
                  <td className="px-5 py-6 text-slate-500" colSpan="8">
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
                    beginAtZero: false,
                    ticks: {
                      callback: function (value) {
                        return "RM" + Number(value).toFixed(2);
                      },
                    },
                  },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
