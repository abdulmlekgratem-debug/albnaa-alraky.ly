import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Search, List } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'الرئيسية', icon: Home, end: true },
    { to: '/materials', label: 'التصنيفات', icon: LayoutGrid, end: false },
    { to: '/search', label: 'بحث', icon: Search, end: false },
    { to: '/prices', label: 'الأسعار', icon: List, end: false },
  ];

  return (
    <nav
      aria-label="شريط التنقل السفلي"
      className="pointer-events-none fixed bottom-2 left-3 right-3 z-40 md:hidden pb-safe"
    >
      <div className="pointer-events-auto mx-auto grid h-[60px] max-w-md grid-cols-4 rounded-[20px] border border-surface-200 bg-white/95 p-1 shadow-[0_14px_38px_rgba(12,30,53,0.24)] backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex min-h-[50px] flex-col items-center justify-center gap-0.5 rounded-[15px] py-0.5 transition-colors ${
                  isActive
                    ? 'bg-brand-navy font-extrabold text-white shadow-md shadow-brand-950/15'
                    : 'font-semibold text-surface-600 hover:bg-brand-50 hover:text-brand-navy'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-[18px] w-[18px] transition-transform ${
                      isActive ? 'scale-105 text-sand-200' : 'text-surface-500'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className="text-[11px] leading-tight tracking-tight">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
