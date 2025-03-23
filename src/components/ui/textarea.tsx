import * as React from "react";
import { TextArea as KendoTextArea } from "@progress/kendo-react-inputs";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => (
    <KendoTextArea
      className={cn("k-textarea h-16 w-full", className)}
      ref={ref}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";

export { Textarea };