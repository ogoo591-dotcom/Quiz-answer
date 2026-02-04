import prisma from "@/lib/prisma";
export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ message: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findFirst({ where: { clerkId: userId } });

    const articles = await prisma.article.findMany({
      where: { userId: user?.id },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify({ articles }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch articles" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
