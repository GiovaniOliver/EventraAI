"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
  secondaryActionLabel?: string
  secondaryActionHref?: string
  secondaryActionOnClick?: () => void
  className?: string
  iconClassName?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionHref,
  secondaryActionOnClick,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 rounded-lg border border-border/40 bg-background shadow-sm",
      className
    )}>
      {Icon && (
        <div className="mb-4">
          <Icon className={cn("h-12 w-12 text-muted-foreground", iconClassName)} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      )}
      
      <div className="flex flex-wrap gap-4 justify-center">
        {(actionLabel && (actionHref || actionOnClick)) && (
          actionHref ? (
            <Link href={actionHref}>
              <Button className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white hover:shadow-md transition-all">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={actionOnClick}
              className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white hover:shadow-md transition-all"
            >
              {actionLabel}
            </Button>
          )
        )}
        
        {(secondaryActionLabel && (secondaryActionHref || secondaryActionOnClick)) && (
          secondaryActionHref ? (
            <Link href={secondaryActionHref}>
              <Button variant="outline" className="border-border/60 hover:bg-muted/50 hover:text-[hsl(var(--eventra-blue))] hover:border-[hsl(var(--eventra-blue))/50]">
                {secondaryActionLabel}
              </Button>
            </Link>
          ) : (
            <Button 
              variant="outline" 
              onClick={secondaryActionOnClick}
              className="border-border/60 hover:bg-muted/50 hover:text-[hsl(var(--eventra-blue))] hover:border-[hsl(var(--eventra-blue))/50]"
            >
              {secondaryActionLabel}
            </Button>
          )
        )}
      </div>
    </div>
  )
} 