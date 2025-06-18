// src/components/ui/Button.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for combining class names
import { Loader2 } from 'lucide-react'; // Example for a loading spinner icon, assuming lucide-react is installed

// Define the props interface for the Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Defines the visual style of the button.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  /**
   * Defines the size of the button.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'icon'; // 'icon' for square buttons with only an icon
  /**
   * If true, shows a loading spinner and disables the button.
   * @default false
   */
  loading?: boolean;
}

// Use forwardRef to allow parent components to get a ref to the underlying button DOM element
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      children,
      disabled, // Destructure disabled explicitly
      ...props // Rest of the button HTML attributes
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none', // Styles for disabled state
          {
            // Variant Styles
            'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800': variant === 'primary',
            'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800': variant === 'secondary',
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200': variant === 'outline',
            'text-gray-700 hover:bg-gray-100 active:bg-gray-200': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 active:bg-red-800': variant === 'danger',
            'text-primary-600 underline-offset-4 hover:underline': variant === 'link',

            // Size Styles
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
            'h-10 w-10 p-0': size === 'icon', // Square button for icons
          },
          className // Custom classes passed in props
        )}
        disabled={disabled || loading} // Disable button if loading or explicitly disabled
        ref={ref}
        {...props}
      >
        {loading && (
          // Use lucide-react Loader2 icon for spinner
          // If you don't have lucide-react, you can use a simple SVG or a custom animation
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button'; // Recommended for better debugging in React DevTools