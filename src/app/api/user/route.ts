import prisma from "@/lib/prisma";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    const existingUser = await prisma.user.findFirst({
      where: { clerkId: body.clerkId },
    });
    if (existingUser) return new Response("User exists");
    const user = await prisma.user.create({ data: body });

    return new Response(JSON.stringify({ user }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Failed to create article" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

export const GET = async () => {
  try {
    const articles = await prisma.user.findMany();

    return new Response(JSON.stringify({ articles }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch all articles" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
