import React from 'react';
import { Link } from 'react-router-dom';

const variants = {
  primary: `
    relative overflow-hidden
    bg-gradient-to-r from-primary via-primary-600 to-primary-700
    hover:from-primary-dark hover:via-primary-700 hover:to-primary-700
    text-white font-medium
    shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40
    before:absolute before:inset-0 before:bg-white/10 before:translate-y-full
    before:transition-transform before:duration-300
    hover:before:translate-y-0
    active:scale-95
  `,
  secondary: `
    bg-surface hover:bg-surface-light
    text-text-main
    border border-white/10 hover:border-white/20
    shadow-md hover:shadow-lg
    transition-all duration-200
    active:scale-95
  `,
  outline: `
    bg-transparent
    border-2 border-primary/50 hover:border-primary
    text-primary hover:text-primary-light
    hover:bg-primary/10
    transition-all duration-200
    active:scale-95
  `,
  ghost: `
    bg-transparent hover:bg-white/5
    text-text-muted hover:text-text-main
    transition-all duration-200
  `,
  accent: `
    relative overflow-hidden
    bg-gradient-to-r from-accent via-accent-dark to-cyan-600
    hover:from-accent-dark hover:via-cyan-600 hover:to-cyan-600
    text-white font-medium
    shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40
    active:scale-95
  `,
  success: `
    relative overflow-hidden
    bg-gradient-to-r from-success via-success-dark to-emerald-700
    hover:from-success-dark hover:via-emerald-700 hover:to-emerald-700
    text-white font-medium
    shadow-lg shadow-success/30 hover:shadow-xl hover:shadow-success/40
    active:scale-95
  `,
  danger: `
    relative overflow-hidden
    bg-gradient-to-r from-danger via-danger-dark to-rose-700
    hover:from-danger-dark hover:via-rose-700 hover:to-rose-700
    text-white font-medium
    shadow-lg shadow-danger/30 hover:shadow-xl hover:shadow-danger/40
    active:scale-95
  `,
};

const sizes = {
  xs: "px-2.5 py-1 text-xs",
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base font-semibold",
  xl: "px-10 py-4 text-lg font-semibold",
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  to,
  disabled,
  loading,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseClass = `
    inline-flex items-center justify-center gap-2
    font-medium tracking-tight
    transition-all duration-200
    rounded-xl
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <>
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && iconPosition === 'left' && !loading && icon}
      {children}
      {icon && iconPosition === 'right' && !loading && icon}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClass} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={baseClass} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
};

export default Button;
