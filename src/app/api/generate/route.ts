import prisma from "@/lib/prisma";

export const POST = async (req: Request) => {
  const { title, content, userId } = await req.json();

  const article = await prisma.article.create({
    data: {
      title,
      content,
      summary: content.slice(0, 300),
      userId,
    },
  });

  return Response.json({
    articleId: article.id,
    title: article.title,
    summary: article.summary,
  });
};
