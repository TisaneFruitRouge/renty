import { cn } from "@/lib/utils"
import type { HTMLAttributes } from "react"

export function PageTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn("text-3xl font-semibold tracking-tight font-display", className)}
      {...props}
    />
  )
}

export function PageDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export function SectionTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-xs font-semibold uppercase tracking-widest text-muted-foreground", className)}
      {...props}
    />
  )
}

export function SectionDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export function FieldLabel({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs font-medium text-muted-foreground uppercase tracking-wide", className)}
      {...props}
    />
  )
}

export function FieldValue({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}
