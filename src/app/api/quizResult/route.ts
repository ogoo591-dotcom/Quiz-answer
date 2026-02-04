import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { userId, quizId, totalScore } = await req.json();

    if (!userId || !quizId) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }
    const result = await prisma.userScores.upsert({
      where: {
        userId_quizId: {
          userId,
          quizId,
        },
      },
      update: {
        totalScore,
      },
      create: {
        userId,
        quizId,
        totalScore,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
