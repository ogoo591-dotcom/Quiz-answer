import prisma from "@/lib/prisma";

export const POST = async (req: Request) => {
  const { articleId } = await req.json();

  const questions = [
    "What is the main idea?",
    "When did this happen?",
    "Who is the main person?",
    "What caused this?",
    "What was the result?",
  ];

  await prisma.quiz.createMany({
    data: questions.map((q) => ({
      question: q,
      options: ["A", "B", "C", "D"],
      answer: "A",
      articleId,
    })),
  });

  return Response.json({ success: true });
};
