import prisma from "@/lib/prisma";
import { fallbackStore } from "@/lib/fallback-store";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const geminiApiKey =
  process.env.GEMINI_API_KEY ?? process.env.KEY ?? process.env.GEMINI;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

type LetterKey = "A" | "B" | "C" | "D";
type NumericKey = "1" | "2" | "3" | "4";
type GeneratedQuestion = {
  question: string;
  options: Record<LetterKey, string>;
  answer: LetterKey;
};
type StoredQuizRow = {
  id: string;
  articleId: string;
  question: string;
  options: string[];
  answer: string;
  createdAt: Date;
  updatedAt: Date;
};
type QuizShape = { questions: GeneratedQuestion[] };

const LETTERS: LetterKey[] = ["A", "B", "C", "D"];
const NUMERIC_KEYS: NumericKey[] = ["1", "2", "3", "4"];

const buildFallbackQuiz = (content: string): QuizShape => {
  const source = content
    .replace(/\s+/g, " ")
    .trim()
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunk = (idx: number) => source[idx % Math.max(source.length, 1)] ?? "";
  const mk = (idx: number): GeneratedQuestion => {
    const text = chunk(idx);
    return {
      question: `Which statement best matches the article (item ${idx + 1})?`,
      options: {
        A: text || "This is a key point from the article.",
        B: "This statement is unrelated to the article.",
        C: "This is the exact opposite of the article.",
        D: "This detail is not mentioned in the article.",
      },
      answer: "A",
    };
  };

  return { questions: [mk(0), mk(1), mk(2), mk(3), mk(4)] };
};

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ articleId: string[] }> },
) => {
  let safeContent = "";
  let safeArticleId = "";
  try {
    const { articleId: articlePath } = await params;
    const articleId = articlePath?.[0];
    const { content } = await request.json();
    safeContent = typeof content === "string" ? content : "";
    safeArticleId = articleId ?? "";
    if (!content) {
      return new Response(JSON.stringify({ message: "Content is required" }), {
        status: 400,
      });
    }
    if (!articleId) {
      return new Response(JSON.stringify({ message: "articleId is required" }), {
        status: 400,
      });
    }
    let quiz: QuizShape | null = null;
    if (ai) {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
You are a JSON API.

Return ONLY raw JSON.
No markdown.
No explanations.
No code fences.

CRITICAL RULES:
- You MUST return EXACTLY 5 questions.
- Do NOT return more or fewer.
- Each question MUST have 4 options (A, B, C, D).
- Each answer MUST be one of: A, B, C, D.

JSON format:
{
  "questions": [
    {
      "question": "",
      "options": {
        "A": "",
        "B": "",
        "C": "",
        "D": ""
      },
      "answer": ""
    }
  ]
}
Article:
${content}
`,
              },
            ],
          },
        ],
      });
      const quizText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (quizText) {
        try {
          const cleaned = quizText.match(/\{[\s\S]*\}/)?.[0];
          if (cleaned) {
            quiz = JSON.parse(cleaned) as QuizShape;
          }
        } catch {
          quiz = null;
        }
      }
    }

    if (!quiz) {
      quiz = buildFallbackQuiz(content);
    }

    if (!Array.isArray(quiz.questions) || quiz.questions.length !== 5) {
      quiz = buildFallbackQuiz(content);
    }
    if (!Array.isArray(quiz.questions) || quiz.questions.length !== 5) {
      return new Response(
        JSON.stringify({ message: "Invalid quiz generation output" }),
        { status: 500 },
      );
    }

    const normalizedQuestions = quiz.questions.map((q) => {
      const options = LETTERS.map((letter) => q.options?.[letter] ?? "").filter(
        Boolean,
      );
      const answerText = q.options?.[q.answer];
      return {
        question: q.question,
        options,
        answerText,
      };
    });

    const isValid = normalizedQuestions.every(
      (q) => q.question && q.options.length === 4 && q.answerText,
    );
    if (!isValid) {
      const fallback = buildFallbackQuiz(content);
      quiz = fallback;
      normalizedQuestions.length = 0;
      normalizedQuestions.push(
        ...fallback.questions.map((q) => ({
          question: q.question,
          options: LETTERS.map((letter) => q.options[letter]),
          answerText: q.options[q.answer],
        })),
      );
    }

    let createdQuizzes: StoredQuizRow[];
    try {
      createdQuizzes = await prisma.$transaction(
        normalizedQuestions.map((q) =>
          prisma.quiz.create({
            data: {
              question: q.question,
              options: q.options,
              answer: q.answerText!,
              articleId,
            },
          }),
        ),
      );
    } catch {
      createdQuizzes = fallbackStore.createQuizzes(
        articleId,
        normalizedQuestions.map((q) => ({
          question: q.question,
          options: q.options,
          answer: q.answerText!,
        })),
      );
    }

    const responseQuiz = {
      questions: createdQuizzes.map((q) => {
        const answerIndex = Math.max(
          0,
          q.options.findIndex((opt) => opt === q.answer),
        );
        return {
          question: q.question,
          options: {
            "1": q.options[0] ?? "",
            "2": q.options[1] ?? "",
            "3": q.options[2] ?? "",
            "4": q.options[3] ?? "",
          } as Record<NumericKey, string>,
          answer: NUMERIC_KEYS[answerIndex],
        };
      }),
    };

    return new Response(
      JSON.stringify({
        articleId,
        quiz: responseQuiz,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("CREATE QUIZ ERROR:", error);

    const fallback = buildFallbackQuiz(safeContent || "General knowledge content");
    return new Response(
      JSON.stringify({
        articleId: safeArticleId || "fallback-article",
        quiz: {
          questions: fallback.questions.map((q) => ({
            question: q.question,
            options: {
              "1": q.options.A,
              "2": q.options.B,
              "3": q.options.C,
              "4": q.options.D,
            } as Record<NumericKey, string>,
            answer: "1" as NumericKey,
          })),
        },
        fallback: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      },
    );
  }
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ articleId: string[] }> },
) {
  const { articleId } = await params;
  const id = articleId[0];
  let quizzes;
  try {
    quizzes = await prisma.quiz.findMany({
      where: { articleId: id },
    });
  } catch {
    quizzes = fallbackStore.findQuizzesByArticleId(id);
  }

  return NextResponse.json(quizzes);
}
