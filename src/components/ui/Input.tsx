// src/components/ui/Input.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for combining class names

// Define the props interface for the Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * An optional error message to display below the input.
   */
  error?: string;
  /**
   * If true, applies styles to indicate the input is disabled.
   * Inherited from React.InputHTMLAttributes, but explicitly noted here.
   */
  disabled?: boolean;
}

// Use forwardRef to allow parent components to get a ref to the underlying input DOM element
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      disabled, // Destructure disabled explicitly
      type = 'text', // Default type to text
      ...props // Rest of the input HTML attributes
    },
    ref
  ) => {
    return (
      <div>
        <input
          type={type} // Apply the type prop
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-60', // Styles for disabled state
            error && 'border-red-500 focus:ring-red-500', // Error specific styles
            className // Custom classes passed in props
          )}
          disabled={disabled} // Apply disabled prop
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; // Recommended for better debugging in React DevTools