export default function FeedbackCard({ feedback }) {
  if (!feedback) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-2xl font-semibold">Interview Feedback</h3>
        <div className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">
          Score: {feedback.score}/10
        </div>
      </div>
      <p className="mb-4 text-slate-300">{feedback.feedback}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 font-semibold text-emerald-300">Strengths</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            {feedback.strengths?.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold text-rose-300">Weaknesses</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            {feedback.weaknesses?.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
      <div className="mt-4">
        <p className="mb-2 font-semibold text-amber-300">Missing Points</p>
        <ul className="list-disc space-y-1 pl-5 text-slate-300">
          {feedback.missing_points?.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <div className="mt-4 rounded-2xl bg-slate-950/60 p-4">
        <p className="mb-2 font-semibold text-white">Improved Answer</p>
        <p className="text-slate-300">{feedback.improved_answer}</p>
      </div>
    </section>
  );
}
