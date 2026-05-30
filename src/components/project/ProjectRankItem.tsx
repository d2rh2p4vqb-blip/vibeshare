import Link from "next/link";
import { formatNumber } from "@/lib/utils";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function ProjectRankItem({ project }: { project: any }) {
  const medal = MEDALS[project.rank] || `#${project.rank}`;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-foreground/20 hover:-translate-y-0.5 transition-all duration-200 bg-card">
        <span className="text-2xl w-10 text-center shrink-0">{medal}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{project.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{project.summary}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-semibold text-foreground tabular-nums">
            {formatNumber(Math.floor(project.hotScore || 0))}
          </div>
          <div className="text-xs text-muted-foreground">热度分</div>
        </div>
      </div>
    </Link>
  );
}
