"use client"

import * as React from "react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      {children}
    </div>
  )
}

const DialogContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`relative z-50 bg-background border border-border rounded-[2rem] shadow-lg p-6 max-w-md w-full mx-4 ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

const DialogHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

const DialogTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`} {...props}>
      {children}
    </h2>
  )
}

const DialogDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={`text-sm text-muted-foreground ${className || ''}`} {...props}>
      {children}
    </p>
  )
}

const DialogFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
