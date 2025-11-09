// @ts-nocheck
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as React from 'react';

import { cn } from '@/lib/utils';

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    // Prevent scroll chaining to parent (page) and keep element scroll contained
    className={cn('relative overflow-hidden overscroll-contain', className)}
    {...props}
  >
    {/* Make the viewport actually scrollable on Y axis */}
    <ScrollAreaPrimitive.Viewport className='h-full w-full rounded-[inherit] overflow-y-auto'>
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      orientation='vertical'
      className='flex touch-none select-none p-0.5 transition-colors bg-transparent'
    >
      <ScrollAreaPrimitive.Thumb className='relative flex-1 rounded-full bg-gray-300 dark:bg-gray-600' />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner className='bg-gray-300 dark:bg-gray-600' />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export { ScrollArea };
