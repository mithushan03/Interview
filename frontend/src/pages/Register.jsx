import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authApi.register(form);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-panel">
        <h1 className="font-display text-3xl font-semibold text-white">Create account</h1>
        <p className="mt-2 text-slate-400">Start generating interview practice in minutes.</p>
        <div className="mt-6 space-y-4">
          <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        <button className="mt-6 w-full rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
        <p className="mt-4 text-sm text-slate-400">
          Already registered? <Link className="text-cyan-300" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
