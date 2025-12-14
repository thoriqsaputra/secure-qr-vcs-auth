import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`glass-panel rounded-xl p-6 border border-slate-700/50 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
