"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import ArticleForm from "./_components/ArticleForm";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import Sidebar from "./_components/Sidebar";
import SummaryCard from "./_components/SummaryCard";

export type Article = {
  id: string;
  title: string;
  content: string;
  summary: string;
  createdAt: string;
};

export default function Home() {
  const [selected, setSelected] = useState<Article | null>(null);
  return (
    <main className="min-h-screen bg-white">
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-4">
            <SignInButton mode="modal" forceRedirectUrl="/">
              <button className="text-black font-medium">Sign in</button>
            </SignInButton>

            <SignUpButton mode="modal" forceRedirectUrl="/">
              <button className="bg-[#6c47ff] text-white rounded-full font-medium h-10 px-5">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <SidebarProvider>
          <div className="min-h-screen flex flex-col">
            <header className="flex justify-between items-center px-6 h-16 border-b">
              <h1 className="font-semibold">Quiz app</h1>
              <UserButton />
            </header>
            <div className="flex">
              <Sidebar onSelectArticle={setSelected} />
              <main className="flex-1 p-6">
                {selected ? (
                  <SummaryCard article={selected} />
                ) : (
                  <div className="text-gray-500">
                    History-оос нэгийг сонгоорой
                  </div>
                )}
              </main>
            </div>

            <div className="flex-1 p-60 flex items-start justify-center">
              <ArticleForm />
            </div>
          </div>
        </SidebarProvider>
      </SignedIn>
    </main>
  );
}
