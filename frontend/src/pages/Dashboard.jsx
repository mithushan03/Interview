import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import { dashboardApi } from "../api/api";

const cards = [
  { key: "total_questions_generated", label: "Questions Generated" },
  { key: "mock_interviews_completed", label: "Mock Interviews" },
  { key: "average_score", label: "Average Score" },
  { key: "saved_questions", label: "Saved Questions" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardApi.getDashboard().then((response) => setData(response.data)).catch(() => setData({ recent_sessions: [] }));
  }, []);

  const deleteSession = async (event, sessionId) => {
    event.stopPropagation();
    if (!window.confirm("Delete this session?")) {
      return;
    }

    await dashboardApi.deleteSession(sessionId);
    setData((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        total_questions_generated: Math.max(
          0,
          current.total_questions_generated - (current.recent_sessions.find((item) => item.id === sessionId)?.question_count ?? 0),
        ),
        recent_sessions: current.recent_sessions.filter((item) => item.id !== sessionId),
      };
    });
  };

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6">
      <Sidebar />
      <div className="flex-1 space-y-8">
        <section>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Overview</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Interview preparation dashboard</h1>
        </section>
        {!data ? (
          <Loader label="Loading dashboard metrics..." />
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <div key={card.key} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-panel">
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <p className="mt-3 font-display text-4xl font-semibold text-white">{data[card.key]}</p>
                </div>
              ))}
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-panel">
              <h2 className="font-display text-2xl font-semibold text-white">Recent sessions</h2>
              <div className="mt-4 space-y-3">
                {data.recent_sessions.length ? data.recent_sessions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/history?session=${item.id}`)}
                    className="flex w-full items-start justify-between gap-4 rounded-2xl border border-white/5 bg-slate-950/60 p-4 text-left transition hover:border-cyan-400/40 hover:bg-slate-950"
                  >
                    <div className="min-w-0 flex-1 cursor-pointer">
                      <p className="font-semibold text-white">{item.role}</p>
                      <p className="text-sm text-slate-400">{item.difficulty} | {item.question_type} | {item.source}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => deleteSession(event, item.id)}
                      className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
                      aria-label="Delete session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )) : <p className="text-slate-400">No sessions yet.</p>}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
