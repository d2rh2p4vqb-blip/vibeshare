"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { HotTabs } from "@/components/project/HotTabs";
import { ProjectRankItem } from "@/components/project/ProjectRankItem";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PERIOD_OPTIONS = [
  { value: "daily", label: "日榜" },
  { value: "weekly", label: "周榜" },
  { value: "monthly", label: "月榜" },
  { value: "all", label: "总榜" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "WEBSITE", label: "网站" },
  { value: "APP", label: "应用" },
  { value: "TOOL", label: "工具" },
  { value: "OTHER", label: "其他" },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("all");
  const [type, setType] = useState("all");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["leaderboard", period, type],
    queryFn: () => fetch(`/api/leaderboard?period=${period}&type=${type}`).then((r) => r.json()),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">排行榜</h1>
      <div className="flex gap-4 mb-6">
        <HotTabs value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
        <Select value={type} onValueChange={(value) => setType(value ?? "all")}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="text-center py-20">加载中...</div>
      ) : (
        <div className="space-y-1">
          {(projects ?? []).map((p: any) => <ProjectRankItem key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
