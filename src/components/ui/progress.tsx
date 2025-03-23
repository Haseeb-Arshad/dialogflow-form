import * as React from "react";
import { ProgressBar as KendoProgressBar } from "@progress/kendo-react-progressbars";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(
  ({ className, value, ...props }, ref) => (
    <KendoProgressBar
      value={value}
      max={100}
      className={cn("k-progressbar", className)}
      {...props}
    />
  )
);

Progress.displayName = "Progress";

export { Progress };