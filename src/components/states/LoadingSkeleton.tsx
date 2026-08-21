import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 5,
  className = '',
}) => {
  return (
    <div className={`w-full space-y-3 animate-pulse ${className}`}>
      {/* Top Header skeleton */}
      <div className="h-10 bg-surface-200 rounded-xl w-3/4 mb-4"></div>
      
      {/* Category or List Skeleton */}
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-surface-200 min-h-[56px]"
          >
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-surface-200 rounded w-1/2"></div>
              <div className="h-3 bg-surface-100 rounded w-1/3"></div>
            </div>
            <div className="h-6 bg-surface-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
