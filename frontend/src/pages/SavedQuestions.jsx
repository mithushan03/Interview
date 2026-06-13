import { useEffect, useState } from "react";
import { dashboardApi } from "../api/api";
import QuestionCard from "../components/QuestionCard";
import Sidebar from "../components/Sidebar";

export default function SavedQuestions() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    dashboardApi.getSavedQuestions().then((response) => setQuestions(response.data));
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6">
      <Sidebar />
      <div className="flex-1 space-y-4">
        <h1 className="font-display text-3xl font-semibold">Saved Questions</h1>
        {questions.length ? questions.map((item) => <QuestionCard key={item.id ?? item.question} item={item} />) : <p className="text-slate-400">No saved questions yet.</p>}
      </div>
    </div>
  );
}
