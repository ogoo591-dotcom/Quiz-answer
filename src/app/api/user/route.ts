import prisma from "@/lib/prisma";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const user = await prisma.user.create({
      data: body,
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to fetch all articles", { status: 500 });
  }
};
