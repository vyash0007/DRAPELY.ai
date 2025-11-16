import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
          {
            'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg focus-visible:ring-gray-900': variant === 'default',
            'border-2 border-gray-900 bg-transparent text-gray-900 hover:bg-gray-900 hover:text-white shadow-sm hover:shadow-md': variant === 'outline',
            'hover:bg-gray-100 text-gray-700 hover:text-gray-900': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg focus-visible:ring-red-600': variant === 'destructive',
            'bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm hover:shadow-md': variant === 'secondary',
          },
          {
            'h-10 px-5 py-2.5': size === 'default',
            'h-9 px-4 py-2 text-xs': size === 'sm',
            'h-12 px-8 py-3 text-base': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
