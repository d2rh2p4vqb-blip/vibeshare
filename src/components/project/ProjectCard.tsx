import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, timeAgo } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    summary: string;
    type: string;
    tools: string[];
    thumbnailUrl: string | null;
    likeCount: number;
    commentCount: number;
    hotScore: number;
    createdAt: string;
    author: { username: string; displayName: string | null; avatarUrl: string | null };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow h-full">
        {project.thumbnailUrl && (
          <img src={project.thumbnailUrl} alt={project.title} className="w-full h-40 object-cover rounded-t-xl" />
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg leading-tight">{project.title}</h3>
            <Badge variant="secondary" className="text-xs shrink-0 ml-2">{project.type}</Badge>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{project.summary}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tools.slice(0, 4).map((tool) => (
              <Badge key={tool} variant="outline" className="text-xs">{tool}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium">
                {(project.author.displayName || project.author.username).slice(0, 2).toUpperCase()}
              </div>
              <span>{project.author.displayName || project.author.username}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>❤️ {formatNumber(project.likeCount)}</span>
              <span>💬 {formatNumber(project.commentCount)}</span>
              <span>{timeAgo(new Date(project.createdAt))}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
