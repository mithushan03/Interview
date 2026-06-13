import { useState } from "react";
import { jobDescriptionApi } from "../api/api";
import Loader from "../components/Loader";
import QuestionCard from "../components/QuestionCard";
import Sidebar from "../components/Sidebar";

export default function JobDescription() {
  const [form, setForm] = useState({ role: "Backend Developer", job_description: "", difficulty: "Intermediate", count: 5 });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("role", form.role);
    formData.append("difficulty", form.difficulty);
    formData.append("count", String(form.count));
    formData.append("file", file);
    try {
      const { data } = await jobDescriptionApi.upload(formData);
      setForm((current) => ({ ...current, job_description: data.text }));
      setQuestions(data.result.questions);
    } catch (err) {
      setError(err.response?.data?.detail || "Job description upload failed");
    }
  };

  const generate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await jobDescriptionApi.generate(form);
      setQuestions(data.questions);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to analyze job description");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6">
      <Sidebar />
      <div className="flex-1 space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel">
          <h1 className="font-display text-3xl font-semibold">Job Description Analyzer</h1>
          <form className="mt-6 space-y-4" onSubmit={generate}>
            <input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role" />
            <textarea className="input min-h-52" value={form.job_description} onChange={(e) => setForm({ ...form, job_description: e.target.value })} placeholder="Paste the job description..." />
            <div className="flex flex-wrap gap-4">
              <input className="input max-w-40" type="number" min="1" max="20" value={form.count} onChange={(e) => setForm({ ...form, count: Number(e.target.value) })} />
              <input className="input max-w-sm" type="file" accept="application/pdf" onChange={handleUpload} />
            </div>
            <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Generate Matching Questions</button>
          </form>
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </section>
        {loading ? <Loader label="Analyzing job description..." /> : null}
        <section className="space-y-4">
          {questions.map((item) => <QuestionCard key={item.id ?? item.question} item={item} />)}
        </section>
      </div>
    </div>
  );
}
