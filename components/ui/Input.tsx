import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-bold-display text-google-text mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input-field ${error ? 'border-google-red' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs font-bold text-google-red">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
