import { useState } from "react";
import { mockApi } from "../api/api";
import FeedbackCard from "../components/FeedbackCard";
import Loader from "../components/Loader";
import Sidebar from "../components/Sidebar";

const difficulties = ["Beginner", "Intermediate", "Advanced"];
const questionTypes = ["Technical", "Coding", "Scenario-based", "Project-based", "System design"];

export default function MockInterview() {
  const [form, setForm] = useState({
    role: "AI/ML Engineer",
    difficulty: "Intermediate",
    question_type: ["Technical", "Scenario-based"],
    count: 5,
  });
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const toggleQuestionType = (value) => {
    const next = form.question_type.includes(value)
      ? form.question_type.filter((item) => item !== value)
      : [...form.question_type, value];
    setForm({ ...form, question_type: next.length ? next : [value] });
  };

  const startInterview = async () => {
    setStarting(true);
    setError("");
    try {
      const { data } = await mockApi.start(form);
      setQuestions(data.questions);
      setCurrentIndex(0);
      setFeedback(null);
      setAnswer("");
    } catch (err) {
      setQuestions([]);
      setFeedback(null);
      setError(err.response?.data?.detail || "Failed to start interview");
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await mockApi.evaluate({ question: questions[currentIndex].question, user_answer: answer, role: form.role });
      setFeedback(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to evaluate answer");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setCurrentIndex((index) => index + 1);
    setAnswer("");
    setFeedback(null);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6">
      <Sidebar />
      <div className="flex-1 space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel">
          <h1 className="font-display text-3xl font-semibold">Mock Interview</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Practice one answer at a time and get structured feedback on clarity, depth, and missing points.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {difficulties.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
            </select>
            <div>
              <label className="mb-2 block text-sm text-slate-400">Question Count</label>
              <input className="input" type="number" min="1" max="10" value={form.count} onChange={(e) => setForm({ ...form, count: Number(e.target.value) })} />
            </div>
            <div className="flex items-end">
              <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70" onClick={startInterview} disabled={starting}>
                {starting ? "Starting..." : "Start Interview"}
              </button>
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
          </div>
          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
              <p className="font-semibold text-rose-100">Mock interview error</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : null}
        </section>
        {currentQuestion ? (
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-400">Question {currentIndex + 1} of {questions.length}</p>
                <p className="text-sm text-slate-500">{currentQuestion.category} | {currentQuestion.question_type}</p>
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold">{currentQuestion.question}</h2>
              <textarea className="input mt-6 min-h-48" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here..." />
              <div className="mt-4 flex gap-3">
                <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70" onClick={submitAnswer} disabled={loading || !answer.trim()}>
                  Submit Answer
                </button>
                {feedback && currentIndex < questions.length - 1 ? (
                  <button className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-white" onClick={nextQuestion}>
                    Next Question
                  </button>
                ) : null}
              </div>
            </div>
            {loading ? <Loader label="Evaluating your answer..." /> : <FeedbackCard feedback={feedback} />}
          </section>
        ) : !starting ? (
          <section className="rounded-3xl border border-dashed border-white/10 bg-slate-950/30 p-8 text-center shadow-panel">
            <h2 className="font-display text-2xl font-semibold text-white">Start a Practice Session</h2>
            <p className="mt-3 text-slate-400">
              Choose a role and question mix, then answer each prompt as if you were in the interview.
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
