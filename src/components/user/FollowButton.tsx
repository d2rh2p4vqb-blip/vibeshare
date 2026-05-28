"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function FollowButton({ username }: { username: string }) {
  const { isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(false);

  if (!isAuthenticated) return null;

  async function handleFollow() {
    const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
    const data = await res.json();
    setFollowing(data.following);
    toast(data.following ? `已关注 @${username}` : `已取消关注 @${username}`);
  }

  return (
    <Button variant={following ? "outline" : "default"} onClick={handleFollow}>
      {following ? "已关注" : "关注"}
    </Button>
  );
}
