"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useState } from "react";
import ArticleForm, { Article } from "./_components/ArticleForm";
import { SummaryCard } from "./_components/SummaryCard";

export default function Home() {
  const [selected, setSelected] = useState<Article | null>(null);

  return (
    <main className="min-h-screen bg-white">
      <ArticleForm />
    </main>
  );
}
