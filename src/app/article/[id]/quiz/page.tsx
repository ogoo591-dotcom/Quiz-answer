"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, X, Check, XCircle, RotateCcw, Bookmark } from "lucide-react";

type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
};
type OptKey = "1" | "2" | "3" | "4";
type QuizQuestion = {
  question: string;
  options: Record<OptKey, string>;
  answer: OptKey;
};
type QuizPayload = { questions: QuizQuestion[] };

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Record<number, OptKey>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!articleId) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/article/${articleId}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to fetch article");

        setArticle(data.article);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [articleId]);

  useEffect(() => {
    if (!article?.content || quiz || busy) return;

    (async () => {
      try {
        setBusy(true);
        setError(null);

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: article.content, articleId }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(data?.message || "Failed to generate quiz");

        const q = data?.quiz as QuizPayload;

        if (
          !q?.questions ||
          !Array.isArray(q.questions) ||
          q.questions.length !== 5
        ) {
          throw new Error("Invalid quiz format returned");
        }

        setQuiz(q);
        setIdx(0);
        setPicked({});
        setShowResult(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setBusy(false);
      }
    })();
  }, [articleId]);

  const questions = quiz?.questions ?? [];
  const total = questions.length || 5;
  const current = questions[idx];
  const currentNo = questions.length ? idx + 1 : 0;

  const score = useMemo(() => {
    if (!quiz) return 0;
    let s = 0;
    quiz.questions.forEach((q, i) => {
      if (picked[i] && picked[i] === q.answer) s += 1;
    });
    return s;
  }, [quiz, picked]);

  const done =
    quiz &&
    quiz.questions.length > 0 &&
    Object.keys(picked).length === quiz.questions.length;

  const closeClicked = () => setShowCancel(true);

  const restart = () => {
    setIdx(0);
    setPicked({});
    setShowResult(false);
  };

  const cancelQuiz = () => {
    restart();
    router.back();
  };

  const selectOption = (opt: OptKey) => {
    if (!quiz) return;

    setPicked((prev) => ({ ...prev, [idx]: opt }));

    const last = idx === quiz.questions.length - 1;
    if (last) {
      setTimeout(() => setShowResult(true), 100);
      return;
    }

    setTimeout(() => {
      setIdx((p) => Math.min(p + 1, quiz.questions.length - 1));
    }, 220);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-2xl p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult && quiz) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-slate-900" />
                <h1 className="text-3xl font-extrabold text-slate-900">
                  Quiz completed
                </h1>
              </div>
              <p className="mt-2 text-lg text-slate-500">
                Let’s see what you did
              </p>
            </div>

            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-slate-700" />
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-4xl font-extrabold text-slate-900">
              Your score: <span className="ml-2">{score}</span>{" "}
              <span className="text-slate-500 text-2xl font-semibold">
                / {quiz.questions.length}
              </span>
            </div>

            <div className="mt-8 space-y-7">
              {quiz.questions.map((q, i) => {
                const userPick = picked[i];
                const isCorrect = userPick === q.answer;

                return (
                  <div key={i} className="flex gap-4">
                    <div className="pt-1">
                      {isCorrect ? (
                        <div className="h-10 w-10 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                          <Check className="h-5 w-5 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full border-2 border-red-500 flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-lg font-semibold text-slate-700">
                        {i + 1}. {q.question}
                      </div>

                      <div className="mt-2 text-lg text-slate-900">
                        <span className="text-slate-500">Your answer: </span>
                        {userPick ? q.options[userPick] : "—"}
                      </div>

                      {!isCorrect && (
                        <div className="mt-1 text-lg text-emerald-600">
                          <span className="text-slate-500">Correct: </span>
                          {q.options[q.answer]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex items-center gap-4">
              <button
                type="button"
                onClick={restart}
                className="flex-1 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Restart quiz
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2"
              >
                <Bookmark className="h-5 w-5" />
                Save and leave
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-slate-900" />
              <h1 className="text-2xl font-extrabold text-slate-900">
                Quick test
              </h1>
            </div>
            <p className="mt-2 text-base text-slate-500">
              Take a quick test about your knowledge from your content
            </p>
          </div>

          <button
            onClick={closeClicked}
            className="h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-slate-700" />
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              {busy && !quiz
                ? "Generating questions..."
                : current?.question ?? "Preparing quiz..."}
            </h2>

            <div className="text-lg font-semibold text-slate-700 whitespace-nowrap">
              {currentNo} <span className="text-slate-400">/</span> {total}
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {current &&
              (Object.keys(current.options) as OptKey[]).map((k) => {
                const active = picked[idx] === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => selectOption(k)}
                    className={[
                      "rounded-2xl border px-6 py-6 text-left transition",
                      active
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="text-lg font-medium text-slate-900">
                      {current.options[k]}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {showCancel && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="w-1/2 max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 p-4">
            <div className="text-xl font-semibold text-slate-900">
              Are you sure?
            </div>
            <p className="mt-3 text-red-600">
              If you press ‘Cancel’, restart from the beginning.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowCancel(false)}
                className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium"
              >
                Go back
              </button>

              <button
                type="button"
                onClick={cancelQuiz}
                className="flex-1 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-medium"
              >
                Cancel quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
