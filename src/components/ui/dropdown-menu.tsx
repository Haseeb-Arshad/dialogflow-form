import * as React from "react"
import { DropDownButton } from "@progress/kendo-react-buttons"
import { Menu, MenuItem } from "@progress/kendo-react-layout"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  trigger: React.ReactNode
  items: {
    label: string
    onClick?: () => void
    disabled?: boolean
    icon?: React.ReactNode
  }[]
  className?: string
}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ trigger, items, className }, ref) => {
    return (
      <div ref={ref} className={cn("relative", className)}>
        <DropDownButton
          text={trigger}
          onItemClick={(e) => {
            const item = items[e.item.index]
            item.onClick?.()
          }}
        >
          {items.map((item, index) => (
            <MenuItem
              key={index}
              text={item.label}
              disabled={item.disabled}
              icon={item.icon}
            />
          ))}
        </DropDownButton>
      </div>
    )
  }
)

DropdownMenu.displayName = "DropdownMenu"

export { DropdownMenu }
