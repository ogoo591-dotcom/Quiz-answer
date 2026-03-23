"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
};

export default function ArticlePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [article, setArticle] = useState<Article | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/article/${id}`, { method: "GET" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "Failed to fetch article");
        }
        setArticle(data.article);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    })();
  }, [id]);

  if (error)
    return (
      <div className="p-6">
        <div className="bg-white shadow-sm p-6 rounded-xl border max-w-3xl">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-4 px-5 py-3 rounded-lg border bg-white hover:bg-slate-50 font-medium"
          >
            ← Back
          </button>
        </div>
      </div>
    );

  if (!article) return null;

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
      >
        ←
      </button>

      <div className="max-w-4xl rounded-2xl border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <h2 className="text-2xl font-bold text-slate-900">
            Article Quiz Generator
          </h2>
        </div>

        <div className="mt-4 flex items-center gap-2 text-slate-500">
          <span className="text-lg">📖</span>
          <span className="font-medium">Summarized content</span>
        </div>

        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          {article.title}
        </h1>

        <p className="mt-4 text-slate-800 leading-7">{article.summary}</p>

        <div className="mt-8 flex items-center gap-2 text-slate-500">
          <span className="text-base">📄</span>
          <span className="font-medium">Article Content</span>
        </div>

        <p className="mt-2 text-slate-700 leading-7">
          {article.content.length > 320
            ? `${article.content.slice(0, 320).trim()}...`
            : article.content}
        </p>

        <div className="mt-1 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-3 py-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            See more
          </button>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(`/article/${article.id}/quiz`)}
            className="rounded-xl bg-slate-900 px-7 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Take a quiz
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border p-6 relative">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-lg border hover:bg-gray-50"
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
