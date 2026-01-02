import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id: id[0] },
    });

    if (!article) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ article }, { status: 200 });
  } catch (e) {
    console.error("GET /api/articles/[id] error:", e);
    return Response.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export const POST = async (req: Request) => {
  try {
    const { title, content, clerkId } = await req.json();

    if (!title || !content || !clerkId) {
      return Response.json(
        { error: "title/content/clerkId required" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    const userId =
      dbUser?.id ??
      (
        await prisma.user.create({
          data: {
            clerkId,
            email: `${clerkId}@placeholder.local`,
          },
          select: { id: true },
        })
      ).id;

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

    return Response.json({ article }, { status: 201 });
  } catch (err: any) {
    console.log(err);
    return Response.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
};
