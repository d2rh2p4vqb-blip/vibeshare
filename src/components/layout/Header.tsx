"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const ThemeIcon = mounted
    ? theme === "dark"
      ? Moon
      : theme === "light"
        ? Sun
        : Monitor
    : Monitor;

  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-primary">
            VibeShare
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/discover" className="hover:text-primary transition-colors">发现</Link>
            <Link href="/leaderboard" className="hover:text-primary transition-colors">排行榜</Link>
            <Link href="/chat" className="hover:text-primary transition-colors">聊天</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="切换主题"
            >
              <ThemeIcon className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push("/submit")}>
            提交作品
          </Button>
          {isLoading ? null : isAuthenticated ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" aria-label="通知">🔔</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {(user as any)?.name?.slice(0, 2)?.toUpperCase() || "U"}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/${(user as any)?.name}`)}>
                    个人主页
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    设置
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>登出</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>登录</Button>
              <Button size="sm" onClick={() => router.push("/register")}>注册</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
