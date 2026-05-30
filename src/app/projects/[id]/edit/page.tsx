"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ProjectForm } from "@/components/project/ProjectForm";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}`);
      if (!res.ok) throw new Error("Project not found");
      return res.json();
    },
  });

  if (authLoading || isLoading) {
    return <div className="text-center py-20">加载中...</div>;
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (!project || project.error) {
    return <div className="text-center py-20">作品不存在</div>;
  }

  // Verify ownership
  if (project.authorId !== user?.id) {
    return <div className="text-center py-20 text-muted-foreground">无权编辑此作品</div>;
  }

  return <ProjectForm project={project} />;
}
