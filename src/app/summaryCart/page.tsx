"use client";

import { useState } from "react";
import { Article } from "@/app/page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  article: Article;
}

export default function SummaryCard({ article }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-3xl border rounded-xl p-6 bg-white">
      <h2 className="text-2xl font-semibold">{article.title}</h2>

      <p className="mt-4 text-gray-700 leading-relaxed">{article.summary}</p>
      <div className="mt-8">
        <div className="text-sm font-medium text-gray-600 mb-2">
          Article Content
        </div>
        <p className="text-gray-800 leading-relaxed">
          {article.content.length > 180
            ? article.content.slice(0, 180) + "..."
            : article.content}
        </p>

        <div className="flex justify-end mt-3">
          <button
            onClick={() => setOpen(true)}
            className="text-sm text-gray-700 hover:underline"
          >
            See more
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {article.title}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-auto pr-2 text-gray-800 leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
