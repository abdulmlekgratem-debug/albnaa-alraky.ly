import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { BackToTop } from '../navigation/BackToTop';

export const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 text-surface-900 font-sans antialiased">
      {/* Main content container with 0 bottom padding so footer touches the bottom */}
      <main className="flex-1 pb-0">
        <Outlet />
      </main>

      {/* Global Footer on non-home pages */}
      {!isHomePage && <Footer />}

      <BackToTop />
    </div>
  );
};
