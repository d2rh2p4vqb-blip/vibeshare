"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { ProjectCardSkeleton } from "@/components/project/ProjectCardSkeleton";
import { useState } from "react";

function SegmentedControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: "hot" | "newest") => void;
}) {
  return (
    <div className="inline-flex gap-0.5 bg-white/10 p-1 rounded-xl">
      <button
        onClick={() => onChange("hot")}
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
          value === "hot"
            ? "bg-white text-black"
            : "text-white/50 hover:text-white/80"
        }`}
      >
        热门
      </button>
      <button
        onClick={() => onChange("newest")}
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
          value === "newest"
            ? "bg-white text-black"
            : "text-white/50 hover:text-white/80"
        }`}
      >
        最新
      </button>
    </div>
  );
}

export default function HomePage() {
  const [sort, setSort] = useState<"hot" | "newest">("hot");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["projects", sort],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/projects?sort=${sort}&page=${pageParam}&limit=12`);
      return res.json();
    },
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
  });

  const projects = data?.pages.flatMap((p) => p.projects) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-16 md:py-24 mb-8 bg-foreground text-background -mx-4 px-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/60 text-xs tracking-widest uppercase mb-6">
          AI Creation Showcase
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          发现 Vibecoding 佳作
        </h1>
        <p className="text-white/50 text-base md:text-lg max-w-md mx-auto mb-8">
          AI 创造的灵感在这里汇聚，发现最棒的作品
        </p>
        <SegmentedControl value={sort} onChange={setSort} />
      </section>

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <ProjectGrid projects={projects} />
          {hasNextPage && (
            <div className="text-center mt-8">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-6 py-3 rounded-full border border-border text-sm text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-50 transition-all"
              >
                {isFetchingNextPage ? "加载中..." : "加载更多"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
