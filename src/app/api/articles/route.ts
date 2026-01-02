import prisma from "@/lib/prisma";

export const GET = async (req: Request) => {
  try {
    const articles = await prisma.article.findMany();
    return Response.json({ articles }, { status: 200 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const { clerkId, title, content, summary } = await req.json();

    const user = await prisma.user.findFirst({ where: { clerkId } });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const article = await prisma.article.create({
      data: {
        userId: user.id,
        title: title ?? "",
        content: content ?? "",
        summary: summary ?? "",
      },
    });

    return new Response(JSON.stringify({ article }), { status: 201 });
  } catch (err: any) {
    console.log(err);
    return Response.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
};
