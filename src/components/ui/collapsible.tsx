"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsible(): CollapsibleContextValue {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) throw new Error("Collapsible components must be used within <Collapsible>.");
  return ctx;
}

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open, defaultOpen = false, onOpenChange, disabled, className, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const controlled = open !== undefined;
    const isOpen = controlled ? open : internalOpen;

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (disabled) return;
        if (!controlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [controlled, disabled, onOpenChange],
    );

    const value = React.useMemo(() => ({ open: isOpen, setOpen }), [isOpen, setOpen]);

    return (
      <CollapsibleContext.Provider value={value}>
        <div ref={ref} data-state={isOpen ? "open" : "closed"} data-disabled={disabled ? "" : undefined} className={className} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  },
);
Collapsible.displayName = "Collapsible";

export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ asChild = false, onClick, className, children, ...props }, ref) => {
    const { open, setOpen } = useCollapsible();
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        aria-expanded={open}
        data-state={open ? "open" : "closed"}
        className={cn(className)}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(!open);
        }}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, children, forceMount, ...props }, ref) => {
    const { open } = useCollapsible();
    if (!open && !forceMount) return null;
    return (
      <div
        ref={ref}
        role="region"
        data-state={open ? "open" : "closed"}
        hidden={!open}
        className={cn(className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
