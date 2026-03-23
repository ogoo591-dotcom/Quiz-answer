import prisma from "@/lib/prisma";
import { fallbackStore } from "@/lib/fallback-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Article id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let article = null;
    try {
      article = await prisma.article.findUnique({
        where: { id },
      });
    } catch {
      article = fallbackStore.findArticleById(id);
    }

    if (!article) {
      return new Response(JSON.stringify({ error: "Article not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ article }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch article" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
