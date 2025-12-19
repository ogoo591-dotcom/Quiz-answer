"use client";

import { Article } from "@prisma/client";

export default function SummaryCard({ article }: { article: Article }) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <div className="text-sm text-gray-500 mb-2">📖 Summarized content</div>
      <h1 className="text-3xl font-semibold mb-4">{article.title}</h1>

      <p className="text-gray-800 leading-7 mb-8">{article.summary}</p>

      <div className="text-sm text-gray-500 mb-2">📄 Article Content</div>
      <p className="text-gray-700">
        {article.content.length > 200
          ? article.content.slice(0, 200) + "..."
          : article.content}
      </p>

      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 rounded bg-black text-white">
          Take a quiz
        </button>
      </div>
    </div>
  );
}
