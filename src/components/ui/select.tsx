import * as React from "react";
import { DropDownList as KendoDropDownList } from "@progress/kendo-react-dropdowns";
import { cn } from "@/lib/utils";

const Select = ({ data, value, onValueChange, className, ...props }) => (
  <KendoDropDownList
    data={data} // e.g., [{ text: "Option 1", value: "1" }, ...]
    textField="text"
    dataItemKey="value"
    value={value}
    onChange={(e) => onValueChange(e.value)}
    className={cn("k-dropdownlist", className)}
    {...props}
  />
);

Select.displayName = "Select";

export { Select };