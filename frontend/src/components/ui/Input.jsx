import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helpText,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-main">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          className={`
            w-full px-4 py-3
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            bg-surface border border-white/10
            rounded-xl
            text-text-main placeholder-text-subtle
            transition-all duration-200
            hover:border-white/20
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-danger focus:ring-danger/50 focus:border-danger/50' : ''}
            ${className}
          `}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-danger flex items-center gap-1.5 animate-slide-up">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {helpText && !error && (
        <p className="text-sm text-text-subtle">
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
