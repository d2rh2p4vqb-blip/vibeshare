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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Monitor, Menu } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/discover", label: "发现" },
  { href: "/leaderboard", label: "排行榜" },
  { href: "/chat", label: "聊天" },
];

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const ThemeIcon = mounted
    ? theme === "dark"
      ? Moon
      : theme === "light"
        ? Sun
        : Monitor
    : Monitor;

  const username = (user as any)?.name || "U";

  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-primary">
            VibeShare
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Desktop Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="切换主题"
              className="shrink-0"
            >
              <ThemeIcon className="h-4 w-4" />
            </Button>
          )}

          {/* Desktop: Submit + Auth */}
          <div className="hidden md:flex items-center gap-2">
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
                      {username.slice(0, 2).toUpperCase()}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/${username}`)}>
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
              <>
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>登录</Button>
                <Button size="sm" onClick={() => router.push("/register")}>注册</Button>
              </>
            )}
          </div>

          {/* Mobile: Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            aria-label="菜单"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left text-primary">VibeShare</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-6">
                {NAV_LINKS.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="justify-start text-base"
                    onClick={() => {
                      router.push(link.href);
                      setMobileOpen(false);
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
                <div className="my-2 border-t" />
                <Button
                  variant="ghost"
                  className="justify-start text-base"
                  onClick={() => {
                    router.push("/submit");
                    setMobileOpen(false);
                  }}
                >
                  提交作品
                </Button>
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start text-base"
                      onClick={() => {
                        router.push(`/${username}`);
                        setMobileOpen(false);
                      }}
                    >
                      个人主页
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-base"
                      onClick={() => {
                        router.push("/settings");
                        setMobileOpen(false);
                      }}
                    >
                      设置
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-base"
                      onClick={() => {
                        router.push("/notifications");
                        setMobileOpen(false);
                      }}
                    >
                      通知
                    </Button>
                    <div className="my-2 border-t" />
                    <Button
                      variant="ghost"
                      className="justify-start text-base text-muted-foreground"
                      onClick={() => signOut()}
                    >
                      登出
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button onClick={() => { router.push("/register"); setMobileOpen(false); }}>
                      注册
                    </Button>
                    <Button variant="outline" onClick={() => { router.push("/login"); setMobileOpen(false); }}>
                      登录
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
