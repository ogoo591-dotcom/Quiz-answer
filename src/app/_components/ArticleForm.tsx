"use client";

import { useState } from "react";
import { LuSparkles } from "react-icons/lu";
import { FaRegFileAlt } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { FiBookOpen } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type Step = "form" | "summary";

export type Article = {
  id: string;
  title: string;
  content: string;
  summary: string;
};

type Props = {
  onCreated?: (article: Article) => void;
};

export default function ArticleForm({ onCreated }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [article, setArticle] = useState<Article | null>(null);
  const [showFullContent, setShowFullContent] = useState(false);

  const { user, isLoaded } = useUser();
  const router = useRouter();

  const safeReadJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      const text = await res.text().catch(() => "");
      return { error: text || "Invalid server response" };
    }
  };

  const handleGenerate = async () => {
    if (!isLoaded) return;
    if (!user?.id) {
      setError("Please sign in first.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const payload = {
        title,
        content,
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      };

      let lastError: string | null = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await safeReadJson(res);

        if (res.ok) {
          const created: Article | undefined = data?.article;
          if (!created?.id) throw new Error("API did not return article");

          setArticle(created);
          setStep("summary");
          setShowFullContent(false);
          onCreated?.(created);
          router.refresh();
          return;
        }
        if (res.status === 503) {
          lastError =
            data?.error || "Service temporarily unavailable. Retrying...";
          await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
          continue;
        }
        throw new Error(data?.error || `Request failed: ${res.status}`);
      }

      throw new Error(lastError || "Service unavailable. Please try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const backToForm = () => {
    setStep("form");
    setArticle(null);
    setShowFullContent(false);
    setError(null);
    setTitle("");
    setContent("");
  };
  if (step === "summary" && article) {
    return (
      <div className="bg-white shadow-sm p-6 rounded-xl border w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LuSparkles className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-900">
              Article Quiz Generator
            </h2>
          </div>

          <button
            onClick={backToForm}
            className="px-3 py-2 rounded-lg border hover:bg-slate-50 text-slate-900"
          >
            Back
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-slate-600">
          <FiBookOpen className="w-5 h-5" />
          <span className="font-medium">Summarized content</span>
        </div>

        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          {article.title}
        </h1>

        <p className="mt-4 text-slate-800 leading-7">
          {article.summary || "No summary yet."}
        </p>

        {showFullContent && (
          <div className="mt-6 rounded-lg border bg-slate-50 p-4 text-slate-800 leading-7 whitespace-pre-wrap">
            {article.content}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setShowFullContent((v) => !v)}
            className="px-5 py-3 rounded-lg border bg-white hover:bg-slate-50 text-slate-900 font-medium"
          >
            {showFullContent ? "Hide content" : "See content"}
          </button>

          <button
            onClick={() => router.push(`/quiz/${article.id}`)} // ✅ эндээ route-оо тааруул
            className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
          >
            Take a quiz
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white shadow-sm p-6 rounded-xl border w-full">
      <div className="flex items-center gap-2">
        <LuSparkles className="w-5 h-5 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-900">
          Article Quiz Generator
        </h2>
      </div>

      <p className="text-l text-slate-600 mt-1">
        Paste your article below to generate a summarize and quiz question. Your
        articles will saved in the sidebar for future reference.
      </p>

      <div className="mb-4">
        <label className="text-black mb-1 text-l font-medium flex items-center gap-1 mt-5">
          <FaRegFileAlt />
          Article Title
        </label>
        <input
          className="w-full border rounded px-3 py-2 text-gray-600 border-gray-200"
          placeholder="Enter a title for your article..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 text-l font-medium text-black flex items-center gap-1 mt-5">
          <FaRegFileAlt />
          Article Content
        </label>
        <textarea
          className="w-full border rounded border-gray-200 px-3 py-2 h-[150px] text-gray-600"
          placeholder="Paste your article content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button
          disabled={!title.trim() || !content.trim() || isGenerating}
          className="px-4 py-2 rounded bg-gray-800 text-white disabled:bg-gray-300"
          onClick={handleGenerate}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <MdRefresh className="w-4 h-4 animate-spin" />
              Generating...
            </span>
          ) : (
            "Generate summary"
          )}
        </button>
      </div>
    </div>
  );
}
