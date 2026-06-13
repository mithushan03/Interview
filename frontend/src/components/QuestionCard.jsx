import { Bookmark, BookmarkCheck } from "lucide-react";

function renderInline(text, keyPrefix) {
  return text.split(/(\*\*.*?\*\*|`.*?`)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-b-${index}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={`${keyPrefix}-c-${index}`} className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-t-${index}`}>{part}</span>;
  });
}

function renderFormattedText(text) {
  const lines = text.split("\n");
  const blocks = [];
  let bulletItems = [];
  let numberedItems = [];

  const flushLists = () => {
    if (bulletItems.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc space-y-2 pl-5 text-slate-200">
          {bulletItems.map((item, index) => (
            <li key={`bullet-${index}`} className="leading-7">
              {renderInline(item, `bullet-${index}`)}
            </li>
          ))}
        </ul>,
      );
      bulletItems = [];
    }
    if (numberedItems.length) {
      blocks.push(
        <ol key={`ol-${blocks.length}`} className="list-decimal space-y-2 pl-5 text-slate-200">
          {numberedItems.map((item, index) => (
            <li key={`number-${index}`} className="leading-7">
              {renderInline(item, `number-${index}`)}
            </li>
          ))}
        </ol>,
      );
      numberedItems = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushLists();
      return;
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      numberedItems.length && flushLists();
      bulletItems.push(bulletMatch[1]);
      return;
    }

    const numberedMatch = line.match(/^\d+\.\s+(.+)/);
    if (numberedMatch) {
      bulletItems.length && flushLists();
      numberedItems.push(numberedMatch[1]);
      return;
    }

    flushLists();
    blocks.push(
      <p key={`p-${index}`} className="leading-7 text-slate-200">
        {renderInline(line, `p-${index}`)}
      </p>,
    );
  });

  flushLists();
  return blocks;
}

export default function QuestionCard({ item, onToggleSave }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-panel">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-cyan-300">{item.category}</span>
            <span className="rounded-full bg-orange-400/15 px-3 py-1 text-orange-300">{item.difficulty}</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-slate-300">{item.question_type}</span>
          </div>
          <h3 className="font-display text-xl font-semibold text-white">{item.question}</h3>
        </div>
        {onToggleSave ? (
          <button
            className="rounded-full border border-white/10 p-3 text-slate-200 transition hover:bg-white/10"
            onClick={() => onToggleSave(item)}
          >
            {item.saved ? <BookmarkCheck className="h-5 w-5 text-cyan-300" /> : <Bookmark className="h-5 w-5" />}
          </button>
        ) : null}
      </div>
      {item.explanation ? <p className="mb-4 text-sm text-slate-300">{item.explanation}</p> : null}
      <div className="space-y-3 text-sm text-slate-200">
        <div>
          <p className="mb-1 font-semibold text-white">Expected Answer</p>
          <div className="mt-3 space-y-4 rounded-2xl border border-cyan-400/10 bg-slate-950/50 p-4">
            {renderFormattedText(item.expected_answer)}
          </div>
        </div>
        <div>
          <p className="mb-1 font-semibold text-white">Key Points</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            {item.key_points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        {item.details ? (
          <div className="rounded-2xl bg-slate-950/60 p-4">
            <p className="mb-3 font-semibold text-white">Coding Details</p>
            <div className="grid gap-3 text-slate-300 md:grid-cols-2">
              {Object.entries(item.details).map(([key, value]) => (
                <div key={key}>
                  <p className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-500">{key.replaceAll("_", " ")}</p>
                  <p className="whitespace-pre-wrap">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
