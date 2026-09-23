import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = true 
}) => {
  return (
    <div 
      className={`bg-bg-card rounded-xl shadow-card border border-border overflow-hidden 
                 ${hoverable ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''} 
                 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
