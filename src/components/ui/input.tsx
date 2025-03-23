import * as React from "react";
import { Input as KendoInput } from "@progress/kendo-react-inputs";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return (
      <KendoInput
        type={type}
        className={cn("k-input flex h-10", className)} // "k-input" is KendoReact’s base class
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };