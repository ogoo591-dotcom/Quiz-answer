"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { PanelLeftClose } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { HistoryItem } from "./HIstoryItem";

type ArticleListItem = { id: string; title: string; createdAt: string };

export function AppSidebar() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleClick = (id: string) => {
    router.push(`/article/${id}`);
  };

  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    (async () => {
      try {
        setError(null);
        const res = await fetch(`/api/articles?clerkId=${user.id}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to fetch articles");
        setItems(Array.isArray(data?.articles) ? data.articles : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setItems([]);
      }
    })();
  }, [isLoaded, user?.id]);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-1">
            <SidebarGroupLabel className="p-0 text-lg font-bold">
              History
            </SidebarGroupLabel>

            <SidebarTrigger className="h-8 w-8" aria-label="Toggle sidebar">
              <PanelLeftClose className="h-4 w-4" />
            </SidebarTrigger>
          </div>

          <SidebarGroupContent>
            {error && (
              <div className="px-2 py-1 text-sm text-red-600">{error}</div>
            )}

            <SidebarMenu>
              {items.map((a) => (
                <HistoryItem
                  key={a.id}
                  title={a.title}
                  onClick={() => handleClick(a.id)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
