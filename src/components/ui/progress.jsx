import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({ className, value = 0, indicatorClassName, ...props }, ref) => {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={cn("relative h-2 w-full overflow-hidden rounded-sm bg-muted", className)}
      {...props}
    >
      <div
        className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
