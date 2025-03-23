import * as React from "react";
import { Dialog as KendoDialog } from "@progress/kendo-react-dialogs";
import { cn } from "@/lib/utils";

// Simplified Dialog component
const Dialog = ({ children, title, open, onClose, className, ...props }) => {
  return (
    <KendoDialog
      title={title}
      visible={open}
      onClose={onClose}
      className={cn("k-dialog", className)}
      {...props}
    >
      {children}
    </KendoDialog>
  );
};

// Usage example requires state management
const DialogWrapper = ({ children, trigger }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      {React.cloneElement(trigger, { onClick: () => setOpen(true) })}
      <Dialog open={open} onClose={() => setOpen(false)}>
        {children}
      </Dialog>
    </>
  );
};

Dialog.displayName = "Dialog";

export { Dialog };