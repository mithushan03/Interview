import { BrainCircuit, LayoutDashboard, LogOut, ScrollText } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard", auth: true },
  { to: "/generate", label: "Generator", auth: true },
  { to: "/resume", label: "Resume", auth: true },
  { to: "/mock-interview", label: "Mock", auth: true },
  { to: "/history", label: "History", auth: true },
];

export default function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to={token ? "/dashboard" : "/"} className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/15 p-2 text-cyan-300">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">AI Interview Coach</p>
            <p className="text-xs text-slate-400">Question generator and mock evaluator</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {links
            .filter((link) => !link.auth || token)
            .map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm transition ${
                  location.pathname === link.to ? "text-cyan-300" : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
        </nav>
        <div className="flex items-center gap-3">
          {!token ? (
            <>
              <Link className="text-sm text-slate-300 hover:text-white" to="/login">
                Login
              </Link>
              <Link className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950" to="/register">
                Start Free
              </Link>
            </>
          ) : (
            <>
              <Link className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200" to="/saved">
                <span className="inline-flex items-center gap-2">
                  <ScrollText className="h-4 w-4" />
                  Saved
                </span>
              </Link>
              <button className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-100" onClick={logout}>
                <span className="inline-flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
