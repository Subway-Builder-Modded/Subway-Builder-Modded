import type { MDXComponents } from "mdx/types"
import Link from "next/link"

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

import {
  Admonition,
  Note,
  Tip,
  Important,
  Warning,
  Caution,
  Danger,
  Info,
  Success,
  Question,
  Bug,
  Example,
  Announcement,
} from "@/components/ui/admonition"

const components: MDXComponents = {
  Admonition,
  Note,
  Tip,
  Important,
  Warning,
  Caution,
  Danger,
  Info,
  Success,
  Question,
  Bug,
  Example,
  Announcement,
  a: ({ href = "", ...props }) => (
    <Link
      href={href}
      className="font-medium text-primary underline underline-offset-4"
      {...props}
    />
  ),
  h1: (props) => (
    <h1 className="scroll-m-20 text-4xl font-black tracking-tight" {...props} />
  ),
  h2: (props) => (
    <h2 className="scroll-m-20 border-b border-border pb-2 text-3xl font-bold tracking-tight first:mt-0" {...props} />
  ),
  h3: (props) => (
    <h3 className="scroll-m-20 text-2xl font-bold tracking-tight" {...props} />
  ),
  p: (props) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
  ),
  ul: (props) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: (props) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  code: (props) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props} />
  ),
  pre: (props) => (
    <pre className="my-6 overflow-x-auto rounded-xl border bg-muted p-4" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic text-muted-foreground" {...props} />
  ),
}

function textFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(textFromChildren).join("")
  if (children && typeof children === "object" && "props" in children) {
    return textFromChildren((children as { props?: { children?: React.ReactNode } }).props?.children)
  }
  return ""
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href = "", ...props }) => (
      <Link
        href={href}
        className="font-medium text-primary underline underline-offset-4"
        {...props}
      />
    ),
    h2: ({ children, ...props }) => {
      const id = slugify(textFromChildren(children))
      return (
        <h2
          id={id}
          className="mt-10 scroll-m-20 border-b border-border pb-2 text-3xl font-bold tracking-tight"
          {...props}
        >
          {children}
        </h2>
      )
    },
    h3: ({ children, ...props }) => {
      const id = slugify(textFromChildren(children))
      return (
        <h3
          id={id}
          className="mt-8 scroll-m-20 text-2xl font-bold tracking-tight"
          {...props}
        >
          {children}
        </h3>
      )
    },
    h4: ({ children, ...props }) => {
      const id = slugify(textFromChildren(children))
      return (
        <h4
          id={id}
          className="mt-6 scroll-m-20 text-xl font-semibold tracking-tight"
          {...props}
        >
          {children}
        </h4>
      )
    },
    p: (props) => (
      <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
    ),
    ul: (props) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
    ),
    ol: (props) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
    ),
    code: (props) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props} />
    ),
    pre: (props) => (
      <pre className="my-6 overflow-x-auto rounded-xl border bg-muted p-4" {...props} />
    ),
    ...components,
  }
}