import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 rounded-lg bg-surface border 
          ${error ? 'border-danger focus:border-danger' : 'border-slate-700 focus:border-primary'} 
          text-text-main placeholder-slate-500 
          focus:outline-none focus:ring-2 focus:ring-primary/20 
          transition-all duration-200
        `}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Input;
