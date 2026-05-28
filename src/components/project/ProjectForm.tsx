"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

const projectSchema = z.object({
  title: z.string().min(1, "必填").max(100),
  summary: z.string().min(1, "必填").max(200),
  description: z.string().min(1, "必填").max(5000),
  type: z.enum(["WEBSITE", "APP", "TOOL", "OTHER"]),
  category: z.string().optional(),
  websiteUrl: z.string().url("请输入有效URL").optional().or(z.literal("")),
  githubUrl: z.string().url("请输入有效URL").optional().or(z.literal("")),
  tools: z.string().min(1, "至少选一个工具"),
  prompts: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const TOOL_OPTIONS = ["Claude", "Cursor", "v0", "Bolt", "Replit", "GitHub Copilot", "ChatGPT", "Windsurf", "Lovable", "其他"];
const CATEGORY_OPTIONS = ["效率工具", "AI应用", "游戏", "设计", "网站", "小程序", "开源项目", "其他"];

export function ProjectForm() {
  const router = useRouter();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { type: "WEBSITE", tools: "", category: "" },
  });

  async function onSubmit(data: ProjectFormData) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, tools: data.tools.split(",").map((t) => t.trim()).filter(Boolean) }),
    });
    if (res.ok) {
      const project = await res.json();
      router.push(`/projects/${project.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">提交作品</h1>

      <div>
        <Input placeholder="作品名称" {...register("title")} />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Textarea placeholder="一句话简介 (展示在列表中)" {...register("summary")} rows={2} />
        {errors.summary && <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>}
      </div>

      <div>
        <Textarea placeholder="详细介绍 (支持描述创作灵感、功能特点等)" {...register("description")} rows={6} />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Select onValueChange={(v) => setValue("type", v as any)} defaultValue="WEBSITE">
            <SelectTrigger><SelectValue placeholder="作品类型" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="WEBSITE">网站</SelectItem>
              <SelectItem value="APP">应用</SelectItem>
              <SelectItem value="TOOL">工具</SelectItem>
              <SelectItem value="OTHER">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select onValueChange={(v) => setValue("category", v as string)}>
            <SelectTrigger><SelectValue placeholder="分类 (可选)" /></SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Input placeholder="作品链接 (可选)" {...register("websiteUrl")} />
      </div>
      <div>
        <Input placeholder="GitHub 链接 (可选)" {...register("githubUrl")} />
      </div>

      <div>
        <Input placeholder="使用的 AI 工具，用逗号分隔，如: Claude,Cursor,v0" {...register("tools")} />
        <p className="text-xs text-muted-foreground mt-1">可选: {TOOL_OPTIONS.join(", ")}</p>
        {errors.tools && <p className="text-red-500 text-sm mt-1">{errors.tools.message}</p>}
      </div>

      <div>
        <Textarea placeholder="分享你的创作 Prompt (可选)" {...register("prompts")} rows={4} />
        <p className="text-xs text-muted-foreground mt-1">分享 Prompt 可以帮助其他人学习你的创作思路</p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "提交中..." : "发布作品"}
      </Button>
    </form>
  );
}
