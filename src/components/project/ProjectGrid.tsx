import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: any[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">还没有作品，快来提交第一个吧！</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
