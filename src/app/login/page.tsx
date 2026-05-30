"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("邮箱或密码错误");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">登录</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "登录中..." : "登录"}
          </button>
          </form>
          <p className="text-center text-sm mt-4">
            还没有账号？<Link href="/register" className="text-foreground font-medium hover:underline">注册</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
