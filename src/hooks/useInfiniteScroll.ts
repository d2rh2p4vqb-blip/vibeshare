"use client";
import { useEffect, useRef, useCallback } from "react";

export function useInfiniteScroll(callback: () => void, hasNextPage: boolean) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!hasNextPage) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [callback, hasNextPage]
  );

  return lastElementRef;
}
