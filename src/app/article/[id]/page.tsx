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

  const fetchArticle = async () => {
    try {
      const data = await (
        await fetch(`/api/article/${id}`, {
          method: "GET",
        })
      ).json();
      setArticle(data.article);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, []);

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
        className="mb-4 w-12 h-12 rounded-lg border bg-white hover:bg-slate-50 flex items-center justify-center"
      >
        ←
      </button>

      <div className="bg-white shadow-sm p-8 rounded-2xl border max-w-4xl">
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
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-6 py-3  border-none hover:bg-slate-100 font-semibold"
          >
            See more
          </button>
        </div>
        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(`/article/${article.id}/quiz`)}
            className="px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
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
