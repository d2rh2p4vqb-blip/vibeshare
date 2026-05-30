"use client";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  if (isLoading) return null;
  if (!isAuthenticated) { router.push("/login"); return null; }

  async function onSubmit(data: any) {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const username = (user as any)?.name;
    if (username) router.push(`/${username}`);
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>编辑个人资料</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">昵称</label>
              <Input placeholder="昵称" {...register("displayName")} />
            </div>
            <div>
              <label className="text-sm font-medium">个人简介</label>
              <Textarea placeholder="介绍一下自己..." {...register("bio")} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium">GitHub URL</label>
              <Input placeholder="https://github.com/..." {...register("githubUrl")} />
            </div>
            <div>
              <label className="text-sm font-medium">Twitter URL</label>
              <Input placeholder="https://twitter.com/..." {...register("twitterUrl")} />
            </div>
            <div>
              <label className="text-sm font-medium">个人网站</label>
              <Input placeholder="https://..." {...register("websiteUrl")} />
            </div>
            <Button type="submit" className="w-full">保存</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
