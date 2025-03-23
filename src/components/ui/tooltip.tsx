import * as React from "react"
import { Tooltip as KendoTooltip } from "@progress/kendo-react-tooltip"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, className, position = 'top' }, ref) => {
    return (
      <KendoTooltip
        position={position}
        anchorElement="target"
        content={() => content}
        className={cn("k-tooltip-content", className)}
      >
        <div ref={ref}>
          {children}
        </div>
      </KendoTooltip>
    )
  }
)

Tooltip.displayName = "Tooltip"

export { Tooltip }
