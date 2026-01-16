import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AddStock() {
  const nav = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    stock_id: "",
    broker_id: "",
    quantity: "",
    invested: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const [sRes, bRes] = await Promise.all([
          api.get("/stocks"),
          api.get("/brokers"),
        ]);
        setStocks(sRes.data);
        setBrokers(bRes.data);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load stocks/brokers");
      }
    })();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await api.post("/holdings", {
        stock_id: form.stock_id,
        broker_id: form.broker_id,
        quantity: Number(form.quantity),
        invested: Number(form.invested),
      });
      nav("/dashboard");
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Failed to add holding");
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
              Select stock & broker, then enter quantity and buy price
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
          {/* Stock */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Stock
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              name="stock_id"
              value={form.stock_id}
              onChange={onChange}
              required
            >
              <option value="">Select stock</option>
              {stocks.map((s) => (
                <option key={s.stock_id} value={s.stock_id}>
                  {s.stock_symbol} - {s.stock_name}
                </option>
              ))}
            </select>
        
          </div>

          {/* Broker */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Broker
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              name="broker_id"
              value={form.broker_id}
              onChange={onChange}
              required
            >
              <option value="">Select broker</option>
              {brokers.map((b) => (
                <option key={b.broker_id} value={b.broker_id}>
                  {b.broker_name}
                </option>
              ))}
            </select>
            
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

          {/* Invested */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Buy Price per Share (RM)
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              name="invested"
              placeholder="e.g. 1895.00"
              value={form.invested}
              onChange={onChange}
              inputMode="decimal"
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
