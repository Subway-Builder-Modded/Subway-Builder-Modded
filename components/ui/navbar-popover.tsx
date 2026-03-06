"use client"

import * as React from "react"
import { twMerge } from "tailwind-merge"
import { PopoverContent, type PopoverContentProps } from "./popover"

export type NavbarPopoverContentProps = PopoverContentProps & {
  isNonModal?: boolean
  shouldCloseOnScroll?: boolean
}

export function NavbarPopoverContent({
  className,
  isNonModal = true,
  shouldCloseOnScroll = false,
  ...props
}: NavbarPopoverContentProps) {
  return (
    <PopoverContent
      {...props}
      isNonModal={isNonModal}
      shouldCloseOnScroll={shouldCloseOnScroll}
      className={twMerge("z-50", className)}
    />
  )
}
