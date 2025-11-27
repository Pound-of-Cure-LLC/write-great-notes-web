"use client"

import * as React from "react"

export interface RadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    const enhanceChildren = (children: React.ReactNode): React.ReactNode => {
      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return child
        }

        // If this is a RadioGroupItem, enhance it
        const childElement = child as React.ReactElement<any>;
        if (childElement.type === RadioGroupItem && childElement.props.value !== undefined) {
          return React.cloneElement(childElement, {
            checked: childElement.props.value === value,
            onCheckedChange: () => onValueChange?.(childElement.props.value),
          })
        }

        // If this element has children, recursively enhance them
        if (childElement.props.children) {
          return React.cloneElement(childElement, {
            children: enhanceChildren(childElement.props.children)
          })
        }

        return child
      })
    }

    return (
      <div
        ref={ref}
        role="radiogroup"
        className={className}
        {...props}
      >
        {enhanceChildren(children)}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onCheckedChange?: () => void
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, onCheckedChange, checked, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="radio"
          className="sr-only"
          ref={ref}
          value={value}
          checked={checked}
          onChange={() => onCheckedChange?.()}
          {...props}
        />
        <div
          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
            checked
              ? 'border-primary bg-primary'
              : 'border-gray-300 bg-white hover:border-gray-400'
          } ${className}`}
          onClick={() => onCheckedChange?.()}
        >
          {checked && (
            <div className="h-2 w-2 rounded-full bg-white" />
          )}
        </div>
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
