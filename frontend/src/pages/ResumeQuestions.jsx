import { useState } from "react";
import { resumeApi } from "../api/api";
import Loader from "../components/Loader";
import QuestionCard from "../components/QuestionCard";
import Sidebar from "../components/Sidebar";

export default function ResumeQuestions() {
  const [role, setRole] = useState("AI/ML Engineer");
  const [resumeText, setResumeText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadResume = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await resumeApi.upload(formData);
      setResumeText(data.text);
    } catch (err) {
      setError(err.response?.data?.detail || "Resume upload failed");
    }
  };

  const generate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await resumeApi.generate({ role, difficulty: "Intermediate", count: 5, resume_text: resumeText });
      setQuestions(data.questions);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate resume questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6">
      <Sidebar />
      <div className="flex-1 space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel">
          <h1 className="font-display text-3xl font-semibold">Resume-Based Questions</h1>
          <form className="mt-6 space-y-4" onSubmit={generate}>
            <input className="input" type="file" accept="application/pdf" onChange={uploadResume} />
            <input className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Target role" />
            <textarea className="input min-h-52" value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Extracted resume text will appear here..." />
            <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Generate Personalized Questions</button>
          </form>
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </section>
        {loading ? <Loader label="Generating questions from resume..." /> : null}
        <section className="space-y-4">
          {questions.map((item) => <QuestionCard key={item.id ?? item.question} item={item} />)}
        </section>
      </div>
    </div>
  );
}
