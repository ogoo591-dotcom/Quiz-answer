import prisma from "@/lib/prisma";
import { fallbackStore } from "@/lib/fallback-store";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

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

const LETTERS: LetterKey[] = ["A", "B", "C", "D"];
const NUMERIC_KEYS: NumericKey[] = ["1", "2", "3", "4"];

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ articleId: string[] }> },
) => {
  try {
    if (!ai) {
      return new Response(
        JSON.stringify({ message: "Gemini API key is missing in environment" }),
        { status: 500 },
      );
    }

    const { articleId: articlePath } = await params;
    const articleId = articlePath?.[0];
    const { content } = await request.json();
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
    if (!quizText) {
      return new Response(
        JSON.stringify({ message: "Gemini returned no quiz text" }),
        { status: 500 },
      );
    }
    let quiz: { questions: GeneratedQuestion[] };
    try {
      const cleaned = quizText.match(/\{[\s\S]*\}/)?.[0];
      if (!cleaned) throw new Error("No JSON found");
      quiz = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ message: "Invalid JSON returned by Gemini" }),
        { status: 500 },
      );
    }
    if (!Array.isArray(quiz.questions) || quiz.questions.length !== 5) {
      return new Response(
        JSON.stringify({ message: "Invalid quiz size returned by Gemini" }),
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
      return new Response(
        JSON.stringify({ message: "Invalid quiz format returned" }),
        { status: 500 },
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

    return new Response(
      JSON.stringify({
        message: "Failed to create quiz",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
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
