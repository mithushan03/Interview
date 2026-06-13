import { ArrowRight, BadgeCheck, BrainCircuit, FileText, MessageCircleMore, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Sparkles, title: "Interview-Ready Questions", text: "Generate role-specific technical, coding, scenario, and behavioral questions with stronger sample answers." },
  { icon: FileText, title: "Resume + JD Tailoring", text: "Turn resumes and job descriptions into focused practice sessions based on likely interview gaps." },
  { icon: MessageCircleMore, title: "Actionable Mock Feedback", text: "Practice one answer at a time and get score-based feedback, missing points, and a stronger revision." },
];

export default function Landing() {
  const token = localStorage.getItem("token");

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(249,115,22,0.14),_transparent_25%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)]" />
      <section className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            <BrainCircuit className="h-4 w-4" />
            AI interview practice workspace
          </div>
          <h1 className="font-display text-5xl font-semibold leading-tight text-white md:text-6xl">
            Practice better answers before the interview happens.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Generate realistic interview questions, tailor practice to your resume or target job, and study stronger sample answers with structured feedback.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to={token ? "/dashboard" : "/register"} className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
              <span className="inline-flex items-center gap-2">
                {token ? "Open Workspace" : "Start Building"}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            {!token ? (
              <Link to="/login" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Sign In
              </Link>
            ) : null}
          </div>
          <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            {["Role-specific question packs", "Readable expected answers", "Resume-tailored practice", "Actionable answer feedback"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-cyan-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="grid flex-1 gap-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
              <div className="mb-4 inline-flex rounded-2xl bg-orange-400/15 p-3 text-orange-300">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
