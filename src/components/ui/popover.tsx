import * as React from "react";
import { Popup as KendoPopup } from "@progress/kendo-react-popup";
import { cn } from "@/lib/utils";

const Popover = ({ children, trigger, open, onOpenChange, className }) => {
  const anchorRef = React.useRef(null);

  return (
    <>
      {React.cloneElement(trigger, { ref: anchorRef, onClick: () => onOpenChange(true) })}
      <KendoPopup
        anchor={anchorRef.current}
        show={open}
        className={cn("k-popup", className)}
        popupClass="w-72 p-4"
      >
        {children}
      </KendoPopup>
    </>
  );
};

Popover.displayName = "Popover";

export { Popover };