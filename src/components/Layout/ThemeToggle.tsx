import React, { useState, useRef, useEffect } from 'react';
import { useTheme, Theme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themeLabels: Record<Theme, { label: string; emoji: string }> = {
    'light': { label: 'Light', emoji: '☀️' },
    'green': { label: 'Green', emoji: '🌿' },
    'brown': { label: 'Brown', emoji: '🪵' },
    'red-light': { label: 'Light Red', emoji: '🔴' },
    'blue': { label: 'Blue', emoji: '🔵' },
    'grey': { label: 'Grey', emoji: '⚪' },
    'dark': { label: 'Dark', emoji: '🌙' },
    'violet': { label: 'Violet', emoji: '💜' },
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-border 
                   text-text-primary hover:bg-bg-secondary transition-colors text-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{themeLabels[theme].emoji}</span>
        <span className="hidden sm:inline">{themeLabels[theme].label}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-bg-card border border-border rounded-xl 
                        shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2
                         hover:bg-bg-secondary transition-colors
                         ${theme === t ? 'text-accent font-medium' : 'text-text-primary'}`}
            >
              <span>{themeLabels[t].emoji}</span>
              <span>{themeLabels[t].label}</span>
              {theme === t && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
