import { useState } from "react";
import { exportApi, questionApi } from "../api/api";
import Loader from "../components/Loader";
import QuestionCard from "../components/QuestionCard";
import Sidebar from "../components/Sidebar";

const roles = ["AI/ML Engineer", "Data Scientist", "Data Analyst", "Backend Developer", "Java Spring Boot Developer", "Frontend Developer", "Full Stack Developer", "DevOps Engineer", "Cloud Engineer", "Cybersecurity Analyst"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];
const questionTypes = ["Technical", "Coding", "System design", "HR/behavioral", "Scenario-based", "Project-based"];

export default function QuestionGenerator() {
  const [form, setForm] = useState({ role: roles[0], difficulty: difficulties[1], question_type: ["Technical"], count: 5 });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const toggleQuestionType = (value) => {
    const next = form.question_type.includes(value)
      ? form.question_type.filter((item) => item !== value)
      : [...form.question_type, value];
    setForm({ ...form, question_type: next.length ? next : [value] });
  };

  const generate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const { data } = await questionApi.generate(form);
      setQuestions(data.questions);
      setStatus(`Generated ${data.questions.length} questions for ${form.role}.`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (item) => {
    await questionApi.save({ question_id: item.id, saved: !item.saved });
    setQuestions((current) => current.map((question) => (question.id === item.id ? { ...question, saved: !question.saved } : question)));
  };

  const exportPdf = async () => {
    const { data } = await exportApi.questionsPdf({ title: "Interview Questions", questions });
    const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "interview-questions.pdf";
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    setQuestions([]);
    setError("");
    setStatus("");
  };

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6">
      <Sidebar />
      <div className="flex-1 space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel">
          <h1 className="font-display text-3xl font-semibold">Question Generator</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Generate realistic interview questions with structured expected answers. Choose the role, difficulty, and interview styles you want to practice.
          </p>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={generate}>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {roles.map((role) => <option key={role}>{role}</option>)}
            </select>
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {difficulties.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
            </select>
            <div>
              <label className="mb-2 block text-sm text-slate-400">Question Count</label>
              <input className="input" type="number" min="1" max="20" value={form.count} onChange={(e) => setForm({ ...form, count: Number(e.target.value) })} />
            </div>
            <div className="flex items-end gap-3">
              <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70" disabled={loading}>
                {loading ? "Generating..." : "Generate Questions"}
              </button>
              {(questions.length || error || status) ? (
                <button type="button" className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-white" onClick={clearResults}>
                  Clear
                </button>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <p className="mb-3 text-sm text-slate-400">Question Types</p>
              <div className="flex flex-wrap gap-3">
                {questionTypes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleQuestionType(item)}
                    className={`rounded-full px-4 py-2 text-sm ${form.question_type.includes(item) ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-slate-200"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </form>
          {status ? <p className="mt-4 text-sm text-emerald-300">{status}</p> : null}
          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
              <p className="font-semibold text-rose-100">Generation failed</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : null}
        </section>
        {loading ? <Loader label="Generating interview questions..." /> : null}
        {questions.length ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Generated Questions</h2>
              <div className="flex items-center gap-3">
                <p className="text-sm text-slate-400">{questions.length} questions ready</p>
                <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white" onClick={exportPdf}>
                  Export PDF
                </button>
              </div>
            </div>
            {questions.map((item, index) => (
              <QuestionCard
                key={item.id ?? `${item.question}-${item.question_type}-${index}`}
                item={item}
                onToggleSave={toggleSave}
              />
            ))}
          </section>
        ) : !loading ? (
          <section className="rounded-3xl border border-dashed border-white/10 bg-slate-950/30 p-8 text-center shadow-panel">
            <h2 className="font-display text-2xl font-semibold text-white">No Questions Yet</h2>
            <p className="mt-3 text-slate-400">
              Start with one or two question types, generate a short set, and refine from there.
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
