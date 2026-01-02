import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAi.getGenerativeModel({ model: "gemini-2.5-flash" });

export const POST = async (request: Request) => {
  try {
    const { content, articleId } = await request.json();

    if (!content) {
      return new Response(JSON.stringify({ message: "Content is required" }), {
        status: 400,
      });
    }

    const result = await model.generateContent({
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
- Each question MUST have 4 options (1, 2, 3, 4).
- Each answer MUST be one of: 1, 2, 3, 4.
 
JSON format:
{
  "questions": [
    {
      "question": "",
      "options": {
        "1": "",
        "2": "",
        "3": "",
        "4": ""
      },
      "answer": "1"
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

    const quizText = result.response.text() || "";
    if (!quizText) {
      return new Response(
        JSON.stringify({ message: "Gemini returned no quiz text" }),
        { status: 500 }
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
        { status: 403 }
      );
    }
    try {
      if (!quiz) {
        return Response.json({ error: "unauthorized" }, { status: 401 });
      }

      const quizes = quiz.questions;

      const article = await prisma.quiz.createMany({
        data: quizes.map((q: any) => ({
          question: q.question,
          options: Object.values(q.options),
          articleId: articleId,
          answer: q.answer,
        })),
      });
      return Response.json({ article }, { status: 201 });
    } catch (err) {
      console.log(err);
    }
  } catch (error: any) {
    console.error("CREATE QUIZ ERROR:", error);

    return new Response(
      JSON.stringify({
        message: "Failed to create quiz",
        error: error.message,
      }),
      { status: 500 }
    );
  }
};
