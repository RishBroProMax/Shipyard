import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "cyan"
    | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-zinc-800 text-zinc-200",
    secondary: "border-transparent bg-zinc-900 text-zinc-400",
    destructive: "border-rose-800/60 bg-rose-950/60 text-rose-300",
    outline: "border-zinc-800 text-zinc-300 bg-zinc-950/40",
    success: "border-emerald-800/60 bg-emerald-950/60 text-emerald-400",
    cyan: "border-cyan-800/60 bg-cyan-950/60 text-cyan-300",
    warning: "border-amber-800/60 bg-amber-950/60 text-amber-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
