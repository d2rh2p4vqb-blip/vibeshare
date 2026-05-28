import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

export function ProjectRankItem({ project }: { project: any }) {
  const medal = project.rank === 1 ? "🥇" : project.rank === 2 ? "🥈" : project.rank === 3 ? "🥉" : `#${project.rank}`;
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="flex items-center gap-4 p-4 hover:bg-muted rounded-lg transition-colors">
        <span className="text-2xl font-bold w-12 text-center">{medal}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{project.title}</h3>
            <Badge variant="secondary" className="text-xs">{project.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{project.summary}</p>
        </div>
        <div className="flex items-center gap-2 text-sm shrink-0">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium">
            {(project.author?.displayName || project.author?.username || "U").slice(0, 2).toUpperCase()}
          </div>
          <span className="text-muted-foreground">{project.author?.displayName || project.author?.username}</span>
        </div>
        <div className="text-right shrink-0 w-20">
          <div className="font-bold">{formatNumber(Math.floor(project.hotScore || 0))}</div>
          <div className="text-xs text-muted-foreground">热度分</div>
        </div>
      </div>
    </Link>
  );
}
