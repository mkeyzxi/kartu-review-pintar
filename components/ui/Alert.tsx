import { HTMLAttributes, forwardRef } from 'react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', variant = 'info', title, children, ...props }, ref) => {
    const variants = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
      <div
        ref={ref}
        className={`border rounded-md p-4 ${variants[variant]} ${className}`}
        {...props}
      >
        {title && <p className="font-medium mb-1">{title}</p>}
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
