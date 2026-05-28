"use client";
import { useQuery } from "@tanstack/react-query";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
    refetchInterval: 30000,
  });
}
