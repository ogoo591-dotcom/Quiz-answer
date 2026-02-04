import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: process.env.KEY,
});
export const POST = async (request: Request) => {
  try {
    const { title, content, userId } = await request.json();
    const user = await prisma.user.findFirst({ where: { clerkId: userId } });
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `this article is article please summarize to me this: ${content}`,
    });
    const { candidates } = res as any;
    const summary = candidates[0].content.parts[0].text;
    console.log(summary, "sad");
    const article = await prisma.article.create({
      data: {
        title: title,
        content: content,
        userId: user?.id || "",
        summary: summary,
      },
    });
    return new Response(JSON.stringify({ result: article }), {
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
    const articles = await prisma.article.findMany();

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
