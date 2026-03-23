import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body?.userId as string | undefined;
    const quizId = body?.quizId as string | undefined;
    const score =
      typeof body?.score === "number"
        ? body.score
        : typeof body?.totalScore === "number"
          ? body.totalScore
          : null;

    if (!userId || !quizId || score === null) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }

    const existing = await prisma.userScore.findFirst({
      where: { userId, quizId },
      orderBy: { createdAt: "desc" },
    });

    const result = existing
      ? await prisma.userScore.update({
          where: { id: existing.id },
          data: { score },
        })
      : await prisma.userScore.create({
          data: { userId, quizId, score },
        });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
