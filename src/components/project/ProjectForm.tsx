"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { X, Plus, Upload } from "lucide-react";

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

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("上传失败");
  const data = await res.json();
  return data.url;
}

interface ProjectFormProps {
  project?: {
    id: string;
    title: string;
    summary: string;
    description: string;
    type: string;
    category: string | null;
    websiteUrl: string | null;
    githubUrl: string | null;
    tools: string[];
    prompts: string | null;
    thumbnailUrl: string | null;
    screenshots: string[];
  } | null;
}

export function ProjectForm({ project }: ProjectFormProps = {}) {
  const router = useRouter();
  const isEdit = !!project;
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          summary: project.summary,
          description: project.description,
          type: project.type as ProjectFormData["type"],
          category: project.category || "",
          websiteUrl: project.websiteUrl || "",
          githubUrl: project.githubUrl || "",
          tools: project.tools.join(", "),
          prompts: project.prompts || "",
        }
      : { type: "WEBSITE", tools: "", category: "" },
  });

  const [thumbnail, setThumbnail] = useState<string | null>(project?.thumbnailUrl || null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>(project?.screenshots || []);
  const [screenshotsUploading, setScreenshotsUploading] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailUploading(true);
    try {
      const url = await uploadFile(file);
      setThumbnail(url);
    } catch { /* ignore */ }
    setThumbnailUploading(false);
  }

  async function handleScreenshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setScreenshotsUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadFile));
      setScreenshots(prev => [...prev, ...urls]);
    } catch { /* ignore */ }
    setScreenshotsUploading(false);
    if (screenshotInputRef.current) screenshotInputRef.current.value = "";
  }

  function removeScreenshot(index: number) {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: ProjectFormData) {
    const url = isEdit ? `/api/projects/${project!.id}` : "/api/projects";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        tools: data.tools.split(",").map((t) => t.trim()).filter(Boolean),
        thumbnailUrl: thumbnail,
        screenshots,
      }),
    });
    if (res.ok) {
      const result = await res.json();
      router.push(`/projects/${result.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{isEdit ? "编辑作品" : "提交作品"}</h1>

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

      {/* Thumbnail upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">封面图片</label>
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          onChange={handleThumbnailUpload}
          className="hidden"
        />
        {thumbnail ? (
          <div className="relative inline-block">
            <img src={thumbnail} alt="封面" className="h-32 w-auto rounded-lg object-cover border" />
            <button
              type="button"
              onClick={() => setThumbnail(null)}
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => thumbnailInputRef.current?.click()}
            disabled={thumbnailUploading}
            className="flex items-center gap-2 border-2 border-dashed rounded-lg p-6 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
          >
            <Upload className="size-4" />
            {thumbnailUploading ? "上传中..." : "点击上传封面图"}
          </button>
        )}
      </div>

      {/* Screenshots upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">截图 (可选多张)</label>
        <input
          ref={screenshotInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleScreenshotUpload}
          className="hidden"
        />
        <div className="flex flex-wrap gap-3">
          {screenshots.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt={`截图 ${i + 1}`} className="h-24 w-auto rounded-lg object-cover border" />
              <button
                type="button"
                onClick={() => removeScreenshot(i)}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => screenshotInputRef.current?.click()}
            disabled={screenshotsUploading}
            className="flex items-center gap-2 border-2 border-dashed rounded-lg p-6 h-24 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="size-4" />
            {screenshotsUploading ? "上传中..." : "添加截图"}
          </button>
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {isSubmitting ? "保存中..." : isEdit ? "保存修改" : "发布作品"}
      </button>
    </form>
  );
}
