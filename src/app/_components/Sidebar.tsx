"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import type { Article } from "../page";
import { HistoryItem } from "./HIstoryItem";

type ArticleListItem = { id: string; title: string; createdAt: string };

type Props = {
  onSelectArticle: (article: Article) => void;
  refreshKey?: number;
};

export default function Sidebar({ onSelectArticle, refreshKey = 0 }: Props) {
  const { user, isLoaded } = useUser();

  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id) return;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/article?userId=${user.id}`, {
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to fetch articles");

        setItems(Array.isArray(data?.articles) ? data.articles : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [isLoaded, user?.id, refreshKey]);

  // ✅ Title дээр дарахад нэг article detail авах
  const handleClick = async (id: string) => {
    try {
      setError(null);

      const res = await fetch(`/api/article/${id}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to fetch article");

      onSelectArticle(data.article as Article);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <aside className="w-[280px] border-r min-h-[calc(100vh-64px)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">History</h2>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <div className="space-y-1">
        {items.length === 0 && !loading ? (
          <p className="text-sm text-gray-500">Одоогоор хадгалсан зүйл алга</p>
        ) : (
          items.map((a) => (
            <HistoryItem
              key={a.id}
              title={a.title}
              onClick={() => handleClick(a.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
