"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { ProjectCardSkeleton } from "@/components/project/ProjectCardSkeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
      <section className="text-center py-8 md:py-12 mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">发现 Vibecoding 佳作</h1>
        <p className="text-muted-foreground text-base md:text-lg">看看大家都用 AI 创造了什么</p>
      </section>

      <div className="flex justify-center gap-4 mb-8">
        <Button variant={sort === "hot" ? "default" : "outline"} onClick={() => setSort("hot")}>热门</Button>
        <Button variant={sort === "newest" ? "default" : "outline"} onClick={() => setSort("newest")}>最新</Button>
      </div>

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
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "加载中..." : "加载更多"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
