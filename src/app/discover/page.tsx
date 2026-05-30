"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectGrid } from "@/components/project/ProjectGrid";

export default function DiscoverPage() {
  const [q, setQ] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=projects`).then((r) => r.json()),
    enabled: searchQuery.length > 0,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-3 mb-8">
        <input
          placeholder="搜索作品..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setSearchQuery(q)}
          className="flex-1 px-5 py-3 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
        />
        <button
          onClick={() => setSearchQuery(q)}
          className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          搜索
        </button>
      </div>
      {isLoading ? (
        <div className="text-center py-20">搜索中...</div>
      ) : data ? (
        <>
          <p className="text-muted-foreground mb-4">找到 {data.total} 个结果</p>
          <ProjectGrid projects={data.results} />
        </>
      ) : (
        <div className="text-center py-20 text-muted-foreground">输入关键词搜索作品</div>
      )}
    </div>
  );
}
