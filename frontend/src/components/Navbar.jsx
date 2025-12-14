import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './ui/Button';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-background/80 backdrop-blur-xl">
      <div className="container-custom h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-text-main">
            Secure<span className="text-primary">VCS</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className={isActive('/') ? 'text-primary bg-primary/10' : ''}>Overview</Button>
          </Link>
          <Link to="/buy">
            <Button variant="ghost" size="sm" className={isActive('/buy') ? 'text-primary bg-primary/10' : ''}>Issue Ticket</Button>
          </Link>
          <Link to="/verify">
            <Button variant="ghost" size="sm" className={isActive('/verify') ? 'text-primary bg-primary/10' : ''}>Verify</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
