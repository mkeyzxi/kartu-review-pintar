import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg shadow-md p-6 ${className}`}
        {...props}
      >
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        )}
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
