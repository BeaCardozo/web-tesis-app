'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, rightIcon, onRightIconClick, className = '', ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-green">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full
            bg-gray-100
            rounded-2xl
            py-4
            ${icon ? 'pl-12' : 'pl-4'}
            ${rightIcon ? 'pr-12' : 'pr-4'}
            text-gray-800
            placeholder-gray-500
            outline-none
            focus:ring-2
            focus:ring-accent-green
            transition-all
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-accent-green transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
