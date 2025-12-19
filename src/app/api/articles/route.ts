import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAi.getGenerativeModel({ model: "gemini-2.5-flash" });

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
      });
    }

    const articles = await prisma.article.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true },
    });

    return new Response(JSON.stringify({ articles }), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: "Failed to create article" }), {
      status: 500,
    });
  }
};

export const POST = async (req: Request) => {
  try {
    const { title, content, userId } = await req.json();

    if (!title || !content || !userId) {
      return new Response(
        JSON.stringify({ error: "title/content/userId required" }),
        { status: 400 }
      );
    }

    const res = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Summarize briefly in 5-6 sentences:\nTitle:${title}\nContent:${content}`,
            },
          ],
        },
      ],
    });

    const summary = res.response.text() || "";

    const article = await prisma.article.create({
      data: { title, content, summary, userId },
    });

    return new Response(JSON.stringify({ article }), { status: 201 });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: "Failed to create article" }), {
      status: 500,
    });
  }
};
