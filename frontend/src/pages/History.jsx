import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { dashboardApi } from "../api/api";
import FeedbackCard from "../components/FeedbackCard";
import QuestionCard from "../components/QuestionCard";
import Sidebar from "../components/Sidebar";

export default function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const [history, setHistory] = useState([]);
  const itemRefs = useRef({});
  const selectedSessionId = useMemo(() => new URLSearchParams(location.search).get("session"), [location.search]);

  useEffect(() => {
    dashboardApi.getHistory().then((response) => setHistory(response.data));
  }, []);

  const selectedSession = useMemo(
    () => history.find((item) => item.type === "question_session" && String(item.id) === selectedSessionId),
    [history, selectedSessionId],
  );

  useEffect(() => {
    if (!selectedSessionId || !history.length || selectedSession) {
      return;
    }

    const target = itemRefs.current[`question_session-${selectedSessionId}`];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [history, selectedSession, selectedSessionId]);

  const deleteHistoryItem = async (type, id) => {
    const message = type === "question_session" ? "Delete this session?" : "Delete this mock answer?";
    if (!window.confirm(message)) {
      return;
    }

    if (type === "question_session") {
      await dashboardApi.deleteSession(id);
      setHistory((current) => current.filter((item) => !(item.type === type && item.id === id)));
      if (String(id) === selectedSessionId) {
        navigate("/history", { replace: true });
      }
      return;
    }

    await dashboardApi.deleteMockAnswer(id);
    setHistory((current) => current.filter((item) => !(item.type === type && item.id === id)));
  };

  if (selectedSession) {
    return (
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6">
        <Sidebar />
        <div className="flex-1 space-y-6">
          <section className="rounded-3xl border border-cyan-400/30 bg-white/5 p-6 shadow-panel">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Question Session</p>
                <h1 className="mt-2 font-display text-3xl font-semibold text-white">{selectedSession.role}</h1>
                <p className="mt-2 text-slate-400">
                  {selectedSession.payload.difficulty} | {selectedSession.payload.question_type} | {selectedSession.payload.source}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">{new Date(selectedSession.created_at).toLocaleString()}</p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => deleteHistoryItem("question_session", selectedSession.id)}
                    className="inline-flex rounded-full border border-rose-400/20 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-400/10"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </span>
                  </button>
                  <Link className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10" to="/history">
                    Back to History
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <section className="space-y-4">
            {selectedSession.payload.questions?.map((question, index) => (
              <QuestionCard
                key={question.id ?? `${question.question}-${index}`}
                item={{
                  ...question,
                  difficulty: question.difficulty ?? selectedSession.payload.difficulty,
                  question_type: question.question_type ?? selectedSession.payload.question_type,
                  category: question.category ?? `Question ${index + 1}`,
                }}
              />
            ))}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6">
      <Sidebar />
      <div className="flex-1 space-y-4">
        <h1 className="font-display text-3xl font-semibold">History</h1>
        {history.map((item) => (
          item.type === "question_session" ? (
            <article
              key={`${item.type}-${item.id}`}
              ref={(node) => {
                itemRefs.current[`${item.type}-${item.id}`] = node;
              }}
              className={`rounded-3xl border bg-white/5 p-6 shadow-panel transition ${
                String(item.id) === selectedSessionId ? "border-cyan-400/60 ring-2 ring-cyan-300/30" : "border-white/10"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Question Session</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white">{item.role}</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {item.payload.difficulty} | {item.payload.question_type} | {item.payload.source}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {item.payload.questions?.length ?? 0} questions in this session
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => deleteHistoryItem("question_session", item.id)}
                      className="inline-flex rounded-full border border-rose-400/20 px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                      to={`/history?session=${item.id}`}
                    >
                      Open Session
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-950/60 p-4">
                <p className="mb-2 text-sm font-semibold text-white">Questions Preview</p>
                <div className="space-y-2">
                  {item.payload.questions?.slice(0, 3).map((question) => (
                    <p key={question.id ?? question.question} className="text-sm text-slate-300">
                      {question.question}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          ) : (
            <article
              key={`${item.type}-${item.id}`}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-panel"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Mock Answer</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white">{item.role}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
                  <button
                    type="button"
                    onClick={() => deleteHistoryItem("mock_answer", item.id)}
                    className="inline-flex rounded-full border border-rose-400/20 p-2 text-rose-300 transition hover:bg-rose-400/10"
                    aria-label="Delete mock answer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-5">
                <p className="mb-2 font-semibold text-white">Question</p>
                <p className="text-slate-300">{item.payload.question}</p>
                <p className="mb-2 mt-5 font-semibold text-white">Your Answer</p>
                <p className="whitespace-pre-wrap text-slate-300">{item.payload.user_answer}</p>
              </div>
              <div className="mt-4">
                <FeedbackCard feedback={item.payload} />
              </div>
            </article>
          )
        ))}
      </div>
    </div>
  );
}
