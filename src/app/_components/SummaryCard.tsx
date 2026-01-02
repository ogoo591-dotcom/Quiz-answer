"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export function SummaryCard({
  article,
  onBack,
}: {
  article: { title: string; summary: string; content: string };
  onBack: () => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  return (
    <div className="bg-white shadow-sm p-6 rounded-xl border w-[1000px]">
      <button onClick={onBack} className="mb-4 px-3 py-2 border rounded">
        ←
      </button>

      <h1 className="text-3xl font-bold">{article.title}</h1>
      <p className="mt-4 leading-7">{article.summary}</p>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-3 rounded-lg border bg-white hover:bg-slate-50 font-medium"
        >
          See content
        </button>

        <button
          className="px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold"
          onClick={() => router.push(`/quizApp`)}
          aria-label="Go quiz"
        >
          Take a quiz
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded border hover:bg-gray-50"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-3">{article.title}</h2>
            <div className="whitespace-pre-wrap leading-7 text-slate-800 max-h-[70vh] overflow-auto">
              {article.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
