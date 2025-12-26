import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './ui/Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`
      sticky top-0 z-50 transition-all duration-300
      ${scrolled
        ? 'bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-lg'
        : 'bg-background/80 backdrop-blur-xl border-b border-white/5'
      }
    `}>
      <div className="container-custom">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-primary blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary-dark to-primary-700 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all group-hover:scale-110 duration-300">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-bold text-xl tracking-tight text-text-main group-hover:text-primary transition-colors">
                Secure<span className="text-gradient">VCS</span>
              </span>
              <span className="text-[10px] text-text-subtle uppercase tracking-widest">Cryptography</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className={`
                  relative overflow-hidden group
                  ${isActive('/') ? 'text-primary bg-primary/10' : ''}
                `}
              >
                {isActive('/') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
                )}
                <span className="relative z-10">Overview</span>
              </Button>
            </Link>
            <Link to="/buy">
              <Button
                variant="ghost"
                size="sm"
                className={`
                  relative overflow-hidden group
                  ${isActive('/buy') ? 'text-primary bg-primary/10' : ''}
                `}
              >
                {isActive('/buy') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
                )}
                <span className="relative z-10">Issue Ticket</span>
              </Button>
            </Link>
            <Link to="/verify">
              <Button
                variant="ghost"
                size="sm"
                className={`
                  relative overflow-hidden group
                  ${isActive('/verify') ? 'text-primary bg-primary/10' : ''}
                `}
              >
                {isActive('/verify') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  Verify
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-10 w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-surface/50 transition-colors group"
            aria-label="Toggle menu"
          >
            <span className={`w-5 h-0.5 bg-text-main rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-text-main rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-text-main rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`
        md:hidden overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="container-custom pb-4 space-y-2 animate-slide-down">
          <Link
            to="/"
            className={`
              block px-4 py-3 rounded-lg transition-all
              ${isActive('/')
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-surface/50 text-text-muted hover:text-text-main'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Overview
            </div>
          </Link>
          <Link
            to="/buy"
            className={`
              block px-4 py-3 rounded-lg transition-all
              ${isActive('/buy')
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-surface/50 text-text-muted hover:text-text-main'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Issue Ticket
            </div>
          </Link>
          <Link
            to="/verify"
            className={`
              block px-4 py-3 rounded-lg transition-all
              ${isActive('/verify')
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-surface/50 text-text-muted hover:text-text-main'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify Ticket
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
