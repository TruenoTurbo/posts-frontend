import React from 'react';

export const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-bg-card rounded-xl shadow-card border border-border overflow-hidden animate-pulse">
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-bg-secondary" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-bg-secondary rounded" />
              <div className="h-3 w-32 bg-bg-secondary rounded" />
            </div>
          </div>
          <div className="h-5 w-20 bg-bg-secondary rounded-full" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-bg-secondary rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-bg-secondary rounded" />
          <div className="h-4 w-5/6 bg-bg-secondary rounded" />
          <div className="h-4 w-4/6 bg-bg-secondary rounded" />
        </div>
      </div>
      <div className="px-4 py-3 bg-bg-secondary border-t border-border">
        <div className="h-3 w-32 bg-bg-primary rounded" />
      </div>
    </div>
  );
};
