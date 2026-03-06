"use client"

import * as React from "react"
import { Overlay, useOverlay } from "react-aria"
import { useOverlayPosition } from "react-aria"

export type NavbarPopoverPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top start"
  | "top end"
  | "bottom start"
  | "bottom end"
  | "left start"
  | "left end"
  | "right start"
  | "right end"

export interface NavbarPopoverContentProps {
  children: React.ReactNode
  className?: string

  placement?: NavbarPopoverPlacement
  offset?: number
  crossOffset?: number
  shouldFlip?: boolean

  triggerRef: React.RefObject<HTMLElement>

  isOpen: boolean
  onOpenChange: (open: boolean) => void
  
  shouldCloseOnScroll?: boolean
  shouldCloseOnInteractOutside?: (element: Element) => boolean
}

export function NavbarPopoverContent(props: NavbarPopoverContentProps) {
  if (!props.triggerRef?.current || !props.isOpen) return null
  return <NavbarPopoverInner {...props} />
}

function pxToNumber(v: unknown): number | undefined {
  if (typeof v === "number") return v
  if (typeof v === "string") {
    const n = Number.parseFloat(v)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function toPx(n: number) {
  return `${n}px`
}

function normalizeToViewportFixed(style: React.CSSProperties): React.CSSProperties {
  const top = pxToNumber(style.top)
  const left = pxToNumber(style.left)
  const bottom = pxToNumber(style.bottom)
  const right = pxToNumber(style.right)

  const out: React.CSSProperties = { ...style, position: "fixed" }

  if (top !== undefined) out.top = toPx(top - window.scrollY)
  if (left !== undefined) out.left = toPx(left - window.scrollX)
  if (bottom !== undefined) out.bottom = toPx(bottom + window.scrollY)
  if (right !== undefined) out.right = toPx(right + window.scrollX)

  return out
}

function NavbarPopoverInner({
  children,
  className,
  placement = "bottom start",
  offset = 8,
  crossOffset = 0,
  shouldFlip = true,
  triggerRef,
  isOpen,
  onOpenChange,
  shouldCloseOnScroll = false,
  shouldCloseOnInteractOutside,
}: NavbarPopoverContentProps) {
  const popoverRef = React.useRef<HTMLDivElement>(null)

  const { overlayProps } = useOverlay(
    {
      isOpen,
      onClose: () => onOpenChange(false),
      isDismissable: true,
      shouldCloseOnBlur: false,
      shouldCloseOnInteractOutside,
    },
    popoverRef,
  )

  const { overlayProps: positionProps, placement: finalPlacement, updatePosition } =
    useOverlayPosition({
      targetRef: triggerRef,
      overlayRef: popoverRef,
      placement,
      offset,
      crossOffset,
      isOpen,
      shouldFlip,
      shouldCloseOnScroll,
    })

  React.useEffect(() => {
    if (!isOpen) return
    const onResize = () => updatePosition()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [isOpen, updatePosition])

  const baseStyle = (positionProps.style ?? {}) as React.CSSProperties
  const mergedStyle = normalizeToViewportFixed(baseStyle)

  return (
    <Overlay>
      <div
        {...overlayProps}
        {...positionProps}
        data-placement={finalPlacement}
        ref={popoverRef}
        style={mergedStyle}
        className={["z-50", className].filter(Boolean).join(" ")}
      >
        {children}
      </div>
    </Overlay>
  )
}
