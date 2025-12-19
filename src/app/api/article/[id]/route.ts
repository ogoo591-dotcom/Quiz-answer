import prisma from "@/lib/prisma";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export const GET = async (req: Request, { params }: Ctx) => {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
      });
    }

    const article = await prisma.article.findFirst({
      where: { id: params.id, userId },
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        createdAt: true,
      },
    });

    if (!article) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ article }), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: "Failed to fetch article" }), {
      status: 500,
    });
  }
};
