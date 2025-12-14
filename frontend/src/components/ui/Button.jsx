import React from 'react';
import { Link } from 'react-router-dom';

const variants = {
  primary: "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20",
  secondary: "bg-surface hover:bg-slate-700 text-text-main border border-slate-700",
  outline: "bg-transparent border border-primary/50 text-primary hover:bg-primary/10",
  ghost: "bg-transparent hover:bg-white/5 text-text-muted hover:text-text-main",
  accent: "bg-accent hover:bg-emerald-600 text-white shadow-lg shadow-accent/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3 text-base font-medium",
};

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  to, 
  disabled,
  ...props 
}) => {
  const baseClass = `inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={baseClass} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClass} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
