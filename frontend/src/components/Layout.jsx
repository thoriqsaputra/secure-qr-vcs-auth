import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-main selection:bg-primary/30 selection:text-primary-light overflow-x-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-primary-dark/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Subtle grid overlay */}
      <div className="fixed inset-0 -z-10 bg-grid opacity-30 pointer-events-none"></div>

      {/* Top gradient overlay */}
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent -z-10"></div>

      <Navbar />

      <main className="container-custom py-8 sm:py-12 lg:py-16 relative z-10 flex-grow">
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative border-t border-white/5 bg-surface/20 backdrop-blur-sm py-8 mt-auto">
        {/* Footer gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Left section */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="font-semibold text-text-main">SecureVCS</span>
              </div>
              <p className="text-sm text-text-muted text-center md:text-left">
                Visual Cryptography for Secure Authentication
              </p>
            </div>

            {/* Center section - Tech stack badges */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-2 py-1 rounded-md bg-surface-light/50 text-xs text-text-subtle border border-white/5">
                React
              </span>
              <span className="px-2 py-1 rounded-md bg-surface-light/50 text-xs text-text-subtle border border-white/5">
                FastAPI
              </span>
              <span className="px-2 py-1 rounded-md bg-surface-light/50 text-xs text-text-subtle border border-white/5">
                OpenCV
              </span>
              <span className="px-2 py-1 rounded-md bg-surface-light/50 text-xs text-text-subtle border border-white/5">
                PostgreSQL
              </span>
            </div>

            {/* Right section */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-sm text-text-muted">
                © {new Date().getFullYear()} Ahmad Thoriq Saputra
              </p>
              <p className="text-xs text-text-subtle">
                NIM: 13522141 • IF4020 Cryptography
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
