import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-main selection:bg-primary/30 selection:text-primary-light">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Ambient glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
      
      <Navbar />
      
      <main className="container-custom py-12 relative z-10 flex-grow">
        {children}
      </main>

      <footer className="border-t border-slate-800 bg-surface/30 backdrop-blur-sm py-8 mt-auto">
        <div className="container-custom text-center md:text-left md:flex justify-between items-center">
          <div>
            <p className="text-sm text-text-muted">
              &copy; {new Date().getFullYear()} Thoriq 13522141. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0 text-sm text-text-muted">
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
