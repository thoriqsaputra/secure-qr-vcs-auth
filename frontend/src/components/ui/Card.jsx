import React from 'react';

const Card = ({ children, className = '', hover = false, gradient = false }) => {
  return (
    <div
      className={`
        glass-card rounded-2xl p-6
        ${hover ? 'hover-lift glass-hover cursor-pointer' : ''}
        ${gradient ? 'border-gradient-hover' : 'border border-white/10'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
