'use client';

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search cards...', className = '' }: Readonly<SearchBarProps>) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Handle keyboard shortcut (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        searchInput?.focus();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          group relative flex items-center gap-2 px-4 py-2 rounded-[20px]
          bg-[color-mix(in_srgb,var(--background)_90%,transparent)]
          overflow-hidden
          transition-all duration-300 ease-out
          border border-transparent
          ${isFocused ? 'scale-[1.02]' : ''}
        `}
      >
        {/* Hover/Focus gradient shine effect */}
        <div className={`absolute inset-0 transition-opacity duration-500 backdrop-blur-md ${isFocused ? 'opacity-70' : 'opacity-0 group-hover:opacity-70'}`}>
          <div
            className="absolute inset-0 mix-blend-screen transition-opacity duration-300"
            style={{
              backgroundImage: `repeating-linear-gradient(125deg, transparent 0%, transparent 15%, color-mix(in srgb, var(--accent-primary) 25%, transparent) 25%, transparent 35%, transparent 50%)`,
              backgroundSize: '200%',
            }}
          />
        </div>
        {/* Inner plate */}
        <div className={`absolute inset-[1.5px] rounded-[18.5px] transition-colors duration-300 pointer-events-none ${isFocused ? 'bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)]' : 'bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)]'}`} />
        
        <MagnifyingGlassIcon 
          className="relative w-5 h-5 transition-all duration-300" 
          style={{ 
            color: isFocused ? 'var(--accent-primary)' : 'var(--icon-2)',
            filter: isFocused ? 'drop-shadow(0 0 10px var(--accent-primary))' : 'none'
          }} 
        />
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="relative flex-1 bg-transparent text-(--foreground) placeholder:text-gray-500 outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            className="relative p-1 rounded hover:bg-(--hover-bg) transition-colors z-10"
            aria-label="Clear search"
          >
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        )}
        <kbd
          className="relative hidden sm:inline-block px-2 py-0.5 text-xs rounded bg-(--hover-bg) text-gray-400 border border-(--card-border)"
        >
          ⌘/Ctrl+K
        </kbd>
      </div>
    </div>
  );
}
