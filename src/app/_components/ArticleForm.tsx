"use client";

import { useState } from "react";
import { LuSparkles } from "react-icons/lu";
import { FaRegFileAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function ArticleForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  return (
    <div className="bg-white shadow-sm p-6 rounded-xl border">
      <div className="flex items-center gap-2">
        <LuSparkles className="w-5 h-5 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-900">
          Article Quiz Generator
        </h2>
      </div>
      <p className="text-l text-slate-600 mt-1">
        Paste your article below to generate a summarize and quiz question. Your
        articles will saved in the sidebar for future reference.
      </p>

      <div className="mb-4 ">
        <label className=" text-black mb-1 text-l font-medium flex items-center gap-1 mt-5 ">
          {" "}
          <FaRegFileAlt />
          Article Title
        </label>
        <input
          className="w-full border rounded px-3 py-2 text-gray-600 border-gray-200"
          placeholder="Enter a title for your article..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 text-l font-medium text-black flex items-center gap-1 mt-5">
          <FaRegFileAlt />
          Article Content
        </label>
        <textarea
          className="w-full border rounded border-gray-200 px-3 py-2 h-[150px] text-gray-600"
          placeholder="Paste your article content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="flex gap-3 justify-end">
        <button
          disabled={!title || !content}
          className="px-4 py-2 rounded bg-gray-800 text-white disabled:bg-gray-300"
          onClick={() => {
            router.push("/quiz-answer");
          }}
        >
          Generate summary
        </button>
      </div>
    </div>
  );
}
