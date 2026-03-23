import prisma from "@/lib/prisma";
import { fallbackStore } from "@/lib/fallback-store";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type GeminiSummaryResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

const geminiApiKey =
  process.env.GEMINI_API_KEY ?? process.env.KEY ?? process.env.GEMINI;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
export const POST = async (request: Request) => {
  try {
    const { title, content, clerkId } = await request.json();

    if (!title || !content || !clerkId) {
      return new Response(
        JSON.stringify({ error: "title, content and clerkId are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    let summary = "";
    if (ai) {
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Summarize this article:\n\n${content}`,
      });
      const parsed = res as GeminiSummaryResponse;
      summary = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }

    if (!summary) {
      summary =
        content.length > 240 ? `${content.slice(0, 240).trim()}...` : content;
    }

    let article;
    try {
      const user = await prisma.user.findUnique({ where: { clerkId } });
      if (!user) throw new Error("User not found in DB");
      article = await prisma.article.create({
        data: {
          title,
          content,
          userId: user.clerkId,
          summary,
        },
      });
    } catch {
      const fallbackUser =
        fallbackStore.findUserByClerkId(clerkId) ??
        fallbackStore.upsertUser({
          clerkId,
          email: `${clerkId}@fallback.local`,
          name: null,
        });
      article = fallbackStore.createArticle({
        title,
        content,
        summary,
        userId: fallbackUser.clerkId,
      });
    }

    return new Response(JSON.stringify({ article }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error &&
      /authentication failed|28P01|P1000|ENOTFOUND|ECONNREFUSED|P1001/i.test(
        error.message,
      )
        ? "Database connection/auth failed. Update DATABASE_URL."
        : "Failed to create article";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return new Response(JSON.stringify({ articles: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    let articles;
    try {
      articles = await prisma.article.findMany({
        where: { userId: clerkId },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      articles = fallbackStore.findArticlesByUserId(clerkId);
    }

    return new Response(JSON.stringify({ articles }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error &&
      /authentication failed|28P01|P1000|ENOTFOUND|ECONNREFUSED|P1001/i.test(
        error.message,
      )
        ? "Database connection/auth failed. Update DATABASE_URL."
        : "Failed to fetch articles";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
};
