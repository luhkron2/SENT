import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const animatedButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:from-blue-700 hover:to-blue-800',
        destructive:
          'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:from-red-700 hover:to-red-800',
        outline:
          'border-2 border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800',
        secondary:
          'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 hover:-translate-y-0.5 hover:shadow-md dark:from-slate-800 dark:to-slate-700 dark:text-white',
        ghost:
          'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white',
        link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400',
        success:
          'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(animatedButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="transition-transform group-hover:scale-110">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="transition-transform group-hover:scale-110">{icon}</span>
        )}
      </Comp>
    );
  }
);
AnimatedButton.displayName = 'AnimatedButton';

export { AnimatedButton, animatedButtonVariants };
