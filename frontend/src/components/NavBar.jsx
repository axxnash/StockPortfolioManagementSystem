import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Navbar() {
  const { token, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const isActive = (path) => loc.pathname === path;

  const linkClass = (path) =>
    [
      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      isActive(path)
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <Link to={token ? "/dashboard" : "/login"} className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">
            S
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">SPMS</div>
            <div className="text-[11px] text-slate-500 -mt-0.5">Portfolio Tracker</div>
          </div>
        </Link>

        {token ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-50 p-1 border border-slate-200">
              <Link className={linkClass("/dashboard")} to="/dashboard">
                Dashboard
              </Link>
              <Link className={linkClass("/add")} to="/add">
                Add Stock
              </Link>
              <Link className={linkClass("/analytics")} to="/analytics">
                Analytics
              </Link>
            </nav>

            {/* Mobile nav */}
            <nav className="flex sm:hidden items-center gap-1">
              <Link className={linkClass("/dashboard")} to="/dashboard">Dash</Link>
              <Link className={linkClass("/add")} to="/add">Add</Link>
              <Link className={linkClass("/analytics")} to="/analytics">Charts</Link>
            </nav>

            <button
              className="ml-1 inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
              onClick={() => {
                logout();
                nav("/login");
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              className={[
                "px-3 py-2 rounded-lg text-sm font-medium transition",
                isActive("/login")
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
              ].join(" ")}
              to="/login"
            >
              Login
            </Link>
            <Link
              className={[
                "px-3 py-2 rounded-lg text-sm font-medium border transition",
                isActive("/register")
                  ? "border-slate-900 text-slate-900"
                  : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
              to="/register"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
