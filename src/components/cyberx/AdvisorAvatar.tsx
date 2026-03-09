import { type Advisor } from "@/data/cyberx-advisors";
import { cn } from "@/lib/utils";

interface AdvisorAvatarProps {
  advisor: Advisor;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function AdvisorAvatar({ advisor, size = "md" }: AdvisorAvatarProps) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-full border border-border/80 font-display font-semibold flex items-center justify-center text-foreground",
        SIZE_CLASSES[size],
        "bg-secondary"
      )}
      style={{ boxShadow: `0 0 12px ${advisor.glowColor}55` }}
    >
      {advisor.initials}
    </div>
  );
}
