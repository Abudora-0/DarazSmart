"use client";

import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/** Fades a section up the first time it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("reveal", inView && "is-visible", className)}
    >
      {children}
    </Tag>
  );
}
