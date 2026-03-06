import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  InfoIcon,
  LightbulbIcon,
  StarIcon,
  TriangleAlertIcon,
  FlameIcon,
  ShieldAlertIcon,
  CircleHelpIcon,
  CircleCheckBigIcon,
  BugIcon,
  FlaskConicalIcon,
  MegaphoneIcon,
  ArchiveX,
} from "lucide-react"

import { cn } from "@/lib/utils"

const admonitionVariants = cva(
  "my-6 flex gap-3 rounded-lg border-l-[3px] px-4 py-3 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        note: "border-l-blue-500 bg-blue-500/5 text-blue-900 dark:bg-blue-500/10 dark:text-blue-200 [&>svg]:text-blue-500",
        tip:
          "border-l-emerald-500 bg-emerald-500/5 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200 [&>svg]:text-emerald-500",
        important:
          "border-l-purple-500 bg-purple-500/5 text-purple-900 dark:bg-purple-500/10 dark:text-purple-200 [&>svg]:text-purple-500",
        warning:
          "border-l-amber-500 bg-amber-500/5 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200 [&>svg]:text-amber-500",
        caution:
          "border-l-orange-500 bg-orange-500/5 text-orange-900 dark:bg-orange-500/10 dark:text-orange-200 [&>svg]:text-orange-500",
        danger:
          "border-l-red-500 bg-red-500/5 text-red-900 dark:bg-red-500/10 dark:text-red-200 [&>svg]:text-red-500",
        info:
          "border-l-cyan-500 bg-cyan-500/5 text-cyan-900 dark:bg-cyan-500/10 dark:text-cyan-200 [&>svg]:text-cyan-500",
        success:
          "border-l-green-500 bg-green-500/5 text-green-900 dark:bg-green-500/10 dark:text-green-200 [&>svg]:text-green-500",
        deprecated:
          "border-l-zinc-500 bg-zinc-500/5 text-zinc-900 dark:bg-zinc-500/10 dark:text-zinc-200 [&>svg]:text-zinc-500",
        bug:
          "border-l-pink-500 bg-pink-500/5 text-pink-900 dark:bg-pink-500/10 dark:text-pink-200 [&>svg]:text-pink-500",
        example:
          "border-l-sky-500 bg-sky-500/5 text-sky-900 dark:bg-sky-500/10 dark:text-sky-200 [&>svg]:text-sky-500",
        announcement:
          "border-l-fuchsia-500 bg-fuchsia-500/5 text-fuchsia-900 dark:bg-fuchsia-500/10 dark:text-fuchsia-200 [&>svg]:text-fuchsia-500",
      },
    },
    defaultVariants: {
      variant: "note",
    },
  }
)

const admonitionTitleVariants = cva("font-semibold", {
  variants: {
    variant: {
      note: "text-blue-700 dark:text-blue-300",
      tip: "text-emerald-700 dark:text-emerald-300",
      important: "text-purple-700 dark:text-purple-300",
      warning: "text-amber-700 dark:text-amber-300",
      caution: "text-orange-700 dark:text-orange-300",
      danger: "text-red-700 dark:text-red-300",
      info: "text-cyan-700 dark:text-cyan-300",
      success: "text-green-700 dark:text-green-300",
      deprecated: "text-zinc-700 dark:text-zinc-300",
      bug: "text-pink-700 dark:text-pink-300",
      example: "text-sky-700 dark:text-sky-300",
      announcement: "text-fuchsia-700 dark:text-fuchsia-300",
    },
  },
  defaultVariants: {
    variant: "note",
  },
})

type AdmonitionVariant = NonNullable<
  VariantProps<typeof admonitionVariants>["variant"]
>

const icons: Record<
  AdmonitionVariant,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  note: InfoIcon,
  tip: LightbulbIcon,
  important: StarIcon,
  warning: TriangleAlertIcon,
  caution: FlameIcon,
  danger: ShieldAlertIcon,
  info: InfoIcon,
  success: CircleCheckBigIcon,
  deprecated: ArchiveX,
  bug: BugIcon,
  example: FlaskConicalIcon,
  announcement: MegaphoneIcon,
}

const labels: Record<AdmonitionVariant, string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
  danger: "Danger",
  info: "Info",
  success: "Success",
  deprecated: "Deprecated",
  bug: "Bug",
  example: "Example",
  announcement: "Announcement",
}

interface AdmonitionProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof admonitionVariants> {
  title?: string
}

function Admonition({
  className,
  variant = "note",
  title,
  children,
  ...props
}: AdmonitionProps) {
  const resolvedVariant = variant ?? "note"
  const Icon = icons[resolvedVariant]
  const defaultTitle = labels[resolvedVariant]

  return (
    <div
      data-slot="admonition"
      data-variant={resolvedVariant}
      className={cn(admonitionVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      <Icon />
      <div className="flex-1 space-y-1.5">
        <p
          className={cn(
            "leading-none",
            admonitionTitleVariants({ variant: resolvedVariant })
          )}
        >
          {title ?? defaultTitle}
        </p>
        <div className="text-current/80 [&>p]:leading-relaxed [&>p:first-child]:mt-0">
          {children}
        </div>
      </div>
    </div>
  )
}

function Note(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="note" {...props} />
}

function Tip(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="tip" {...props} />
}

function Important(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="important" {...props} />
}

function Warning(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="warning" {...props} />
}

function Caution(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="caution" {...props} />
}

function Danger(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="danger" {...props} />
}

function Info(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="info" {...props} />
}

function Success(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="success" {...props} />
}

function Deprecated(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="deprecated" {...props} />
}

function Bug(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="bug" {...props} />
}

function Example(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="example" {...props} />
}

function Announcement(props: Omit<AdmonitionProps, "variant">) {
  return <Admonition variant="announcement" {...props} />
}

export {
  Admonition,
  Note,
  Tip,
  Important,
  Warning,
  Caution,
  Danger,
  Info,
  Success,
  Deprecated,
  Bug,
  Example,
  Announcement,
}
