"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizPage({
  params,
}: {
  params: { articleId: string };
}) {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: params.articleId }),
    });
  }, []);

  return <div>Quiz loading...</div>;
}
