// Global type declarations to fix React/Radix UI compatibility issues

declare module '@radix-ui/react-tabs' {
  export interface TabsProps {
    className?: string;
  }
  export interface TabsListProps {
    className?: string;
  }
  export interface TabsTriggerProps {
    className?: string;
  }
  export interface TabsContentProps {
    className?: string;
  }
}

declare module '@radix-ui/react-select' {
  export interface SelectTriggerProps {
    className?: string;
  }
  export interface SelectContentProps {
    className?: string;
  }
  export interface SelectItemProps {
    className?: string;
  }
}

declare module '@radix-ui/react-scroll-area' {
  export interface ScrollAreaProps {
    className?: string;
  }
}

declare module '@radix-ui/react-dialog' {
  export interface DialogOverlayProps {
    className?: string;
  }
  export interface DialogContentProps {
    className?: string;
  }
  export interface DialogTitleProps {
    className?: string;
  }
  export interface DialogDescriptionProps {
    className?: string;
  }
}

declare module '@radix-ui/react-checkbox' {
  export interface CheckboxProps {
    className?: string;
  }
}

declare module '@radix-ui/react-slot' {
  export interface SlotProps {
    className?: string;
  }
}

// Fix React.ReactNode compatibility
declare global {
  namespace React {
    type ReactNode = import('react').ReactNode;
  }
}
