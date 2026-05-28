import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-16 w-16" };

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const initials = (user.name || user.email || "U").slice(0, 2).toUpperCase();
  return (
    <Avatar className={sizeMap[size]}>
      <AvatarImage src={user.image || undefined} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
