import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: process.env.KEY!,
});
export const POST = async (request: Request) => {
  try {
    const { content, articleId } = await request.json();
    if (!content) {
      return new Response(JSON.stringify({ message: "Content is required" }), {
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
    let quiz;
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
    const createdQuizzes = await prisma.$transaction(
      quiz.questions.map((q: any) => {
        const correctAnswerText = q.options[q.answer];
        return prisma.quiz.create({
          data: {
            question: q.question,
            options: Object.values(q.options),
            answer: correctAnswerText,
            articleId,
          },
        });
      }),
    );

    return new Response(
      JSON.stringify({
        articleId,
        quiz: createdQuizzes,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("CREATE QUIZ ERROR:", error);

    return new Response(
      JSON.stringify({
        message: "Failed to create quiz",
        error: error.message,
      }),
      { status: 500 },
    );
  }
};
import { NextResponse } from "next/server";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ articleId: string[] }> },
) {
  const { articleId } = await params;
  const id = articleId[0];
  const quizzes = await prisma.quiz.findMany({
    where: { articleId: id },
  });

  return NextResponse.json(quizzes);
}
