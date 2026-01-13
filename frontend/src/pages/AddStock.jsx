import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AddStock() {
  const nav = useNavigate();
  const portfolio_id = Number(localStorage.getItem("portfolio_id"));

  const stockOptions = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "NFLX", name: "Netflix Inc." },
    { symbol: "BABA", name: "Alibaba Group Holding Ltd." },
    { symbol: "ORCL", name: "Oracle Corporation" },
    { symbol: "CRM", name: "Salesforce Inc." },
    { symbol: "AMD", name: "Advanced Micro Devices Inc." },
    { symbol: "INTC", name: "Intel Corporation" },
    { symbol: "UBER", name: "Uber Technologies Inc." },
    { symbol: "SPOT", name: "Spotify Technology S.A." },
    { symbol: "PYPL", name: "PayPal Holdings Inc." },
    { symbol: "ADBE", name: "Adobe Inc." },
    { symbol: "CSCO", name: "Cisco Systems Inc." },
    { symbol: "IBM", name: "International Business Machines Corp." },
    { symbol: "DIS", name: "The Walt Disney Company" },
  ];

  const [form, setForm] = useState({
    symbol: "",
    stock_name: "",
    broker_platform: "",
    quantity: "",
    buy_price: "",
    buy_date: "",
  });
  const [err, setErr] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSymbolChange = (e) => {
    const selectedSymbol = e.target.value;
    const selectedStock = stockOptions.find(stock => stock.symbol === selectedSymbol);
    setForm({
      ...form,
      symbol: selectedSymbol,
      stock_name: selectedStock ? selectedStock.name : "",
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/holdings", {
        portfolio_id,
        symbol: form.symbol.toUpperCase(),
        stock_name: form.stock_name,
        broker_platform: form.broker_platform,
        quantity: Number(form.quantity),
        buy_price: Number(form.buy_price),
        buy_date: form.buy_date,
      });
      nav("/dashboard");
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Failed to add stock");
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Add Stock</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter purchase details to add a new holding
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => nav("/dashboard")}
          >
            Back
          </button>
        </div>

        {/* Error */}
        {err && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Symbol */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Symbol
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              name="symbol"
              value={form.symbol}
              onChange={onSymbolChange}
              required
            >
              <option value="">Select a symbol</option>
              {stockOptions.map((stock) => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">Choose from popular stocks</p>
          </div>

          {/* Stock Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Stock Name
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
              name="stock_name"
              value={form.stock_name}
              readOnly
            />
          </div>

          {/* Broker */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Broker Platform
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              name="broker_platform"
              placeholder="e.g. IBKR, Moomoo, Rakuten"
              value={form.broker_platform}
              onChange={onChange}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Quantity
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              name="quantity"
              placeholder="e.g. 10"
              value={form.quantity}
              onChange={onChange}
              inputMode="decimal"
              required
            />
          </div>

          {/* Buy Price */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Buy Price
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              name="buy_price"
              placeholder="e.g. 189.50"
              value={form.buy_price}
              onChange={onChange}
              inputMode="decimal"
              required
            />
          </div>

          {/* Buy Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Buy Date
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              type="date"
              name="buy_date"
              value={form.buy_date}
              onChange={onChange}
              required
            />
          </div>

          {/* Actions */}
          <div className="sm:col-span-2 mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="w-full sm:w-auto rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => nav("/dashboard")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
            >
              Add Holding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
