import prisma from "@/lib/prisma";
import { fallbackStore } from "@/lib/fallback-store";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { clerkId, email, name } = body ?? {};

    if (!clerkId || !email) {
      return new Response(
        JSON.stringify({ error: "clerkId and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    let user;
    try {
      const existingUser = await prisma.user.findFirst({
        where: { clerkId },
      });
      user =
        existingUser ??
        (await prisma.user.create({
          data: { clerkId, email, name: name ?? null },
        }));
    } catch {
      user = fallbackStore.upsertUser({ clerkId, email, name: name ?? null });
    }

    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error && /authentication failed|28P01|P1000/i.test(error.message)
        ? "Database auth failed. Reset DB password and update DATABASE_URL."
        : "Failed to create user";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
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
