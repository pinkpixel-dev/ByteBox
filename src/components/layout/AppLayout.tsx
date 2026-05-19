/**
 * ByteBox - Main App Layout
 * Made with ❤️ by Pink Pixel
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  TagIcon,
  FolderIcon,
  Cog6ToothIcon,
  PlusIcon,
  FunnelIcon,
  StarIcon,
  CircleStackIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { SearchBar } from '@/components/ui/SearchBar';
import { DataModal } from '@/components/ui/DataModal';
import { ViewModeSelector, type ViewMode } from '@/components/ui/ViewModeSelector';
import { useTheme } from '@/contexts/ThemeContext';

interface AppLayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  onToggleFilters?: () => void;
  showFiltersToggle?: boolean;
  onQuickAdd?: () => void;
  showStarredOnly?: boolean;
  onToggleStarred?: () => void;
  starredCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  disableScroll?: boolean;
}

export function AppLayout({
  children,
  onSearch,
  onToggleFilters,
  showFiltersToggle = false,
  onQuickAdd,
  showStarredOnly = false,
  onToggleStarred,
  starredCount = 0,
  viewMode = 'all',
  onViewModeChange,
  hasActiveFilters = false,
  onClearFilters,
  disableScroll = false,
}: Readonly<AppLayoutProps>) {
  const SIDEBAR_MIN_WIDTH = 240;
  const SIDEBAR_MAX_WIDTH = 460;
  const SIDEBAR_DEFAULT_WIDTH = 240;
  const SIDEBAR_COLLAPSED_WIDTH = 96;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const { getIconColor, accentTheme, mode, fontConfig, setFontConfig } = useTheme();
  const fontConfigRef = useRef(fontConfig);

  useEffect(() => {
    fontConfigRef.current = fontConfig;
  }, [fontConfig]);

  const sidebarWidth = useMemo(() => {
    const width = fontConfig.sidebarWidth ?? SIDEBAR_DEFAULT_WIDTH;
    return Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, width));
  }, [fontConfig.sidebarWidth]);

  const updateSidebarWidth = useCallback((width: number) => {
    const clamped = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, Math.round(width)));
    const currentConfig = fontConfigRef.current;
    if (currentConfig.sidebarWidth === clamped) return;
    setFontConfig({ ...currentConfig, sidebarWidth: clamped });
  }, [setFontConfig]);

  const handleSidebarResizeStart = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = sidebarWidth;
    setIsSidebarResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = startWidth + (moveEvent.clientX - startX);
      updateSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => {
      globalThis.removeEventListener('mousemove', handleMouseMove);
      globalThis.removeEventListener('mouseup', handleMouseUp);
      setIsSidebarResizing(false);
    };

    globalThis.addEventListener('mousemove', handleMouseMove);
    globalThis.addEventListener('mouseup', handleMouseUp);
  }, [sidebarWidth, updateSidebarWidth]);

  // Handle Add Card click - navigate to dashboard if not already there
  const handleAddCardClick = () => {
    if (onQuickAdd) {
      // If we have a handler, use it directly
      onQuickAdd();
    } else {
      // Navigate to dashboard
      globalThis.location.href = '/';
    }
  };

  // Keyboard shortcuts for view modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if Cmd/Ctrl is pressed and no input is focused
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Cmd/Ctrl+1-4 for view modes
      if (onViewModeChange) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            onViewModeChange('all');
            break;
          case '2':
            e.preventDefault();
            onViewModeChange('recent');
            break;
          case '3':
            e.preventDefault();
            onViewModeChange('starred');
            break;
          case '4':
            e.preventDefault();
            onViewModeChange('by-tag');
            break;
        }
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [onViewModeChange]);

  // Only apply shadow in dark mode - light mode doesn't need it and causes visual doubling
  const logoShadow =
    mode === 'dark'
      ? 'drop-shadow(0 18px 35px rgba(5,6,11,0.6)) drop-shadow(0 0 1px rgba(255,255,255,0.4))'
      : 'none';

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, href: '/', active: true },
    { name: 'Search', icon: MagnifyingGlassIcon, href: '/search' },
    { name: 'Categories', icon: FolderIcon, href: '/categories' },
    { name: 'Tags', icon: TagIcon, href: '/tags' },
    { name: 'Settings', icon: Cog6ToothIcon, href: '/settings' },
  ];

  return (
    <div className="flex h-screen text-(--foreground) overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'glass-header relative flex flex-col border border-transparent rounded-r-3xl',
          isSidebarResizing ? 'select-none' : '',
          sidebarOpen
            ? isSidebarResizing
              ? ''
              : 'transition-[width] duration-300 ease-out'
            : 'transition-[width] duration-300 ease-out'
        )}
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : `${SIDEBAR_COLLAPSED_WIDTH}px` }}
      >
        {/* Sidebar Header */}
        <div className={cn(
          "flex items-center py-4 border-b border-white/10",
          sidebarOpen ? "justify-between px-4" : "flex-col gap-2 px-2"
        )}>
          {/* Logo: Show banner when expanded, icon when collapsed - Clickable to collapse/expand */}
          {sidebarOpen ? (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="relative shrink-0 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] flex items-center gap-3"
              aria-label="Collapse sidebar"
            >
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  key={`logo-icon-expanded-${mode}`}
                  src="/icon.png"
                  alt="ByteBox Logo"
                  fill
                  sizes="48px"
                  priority
                  className="object-contain"
                  style={{ filter: logoShadow }}
                />
              </div>
              <span className="font-bold text-2xl tracking-tight text-(--text-strong)" style={{ fontFamily: 'var(--font-space-grotesk)', filter: logoShadow }}>
                ByteBox
              </span>
            </button>
          ) : (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="relative h-10 w-10 shrink-0 cursor-pointer transition-all duration-300 hover:scale-110 hover:brightness-110 active:scale-95"
              aria-label="Expand sidebar"
            >
              <Image
                key={`logo-icon-${mode}`}
                src="/icon.png"
                alt="ByteBox"
                fill
                sizes="48px"
                priority
                className="object-contain"
                style={{ filter: logoShadow }}
              />
            </button>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl transition-all duration-300 hover:bg-(--hover-bg) hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-[color-mix(in_srgb,var(--accent-primary)_15%,transparent)]"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeftIcon className="w-5 h-5 transition-transform duration-300" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* Add Card Button - Moved up */}
        <div className="px-3 py-4">
          <button
            onClick={handleAddCardClick}
            className={cn(
              'group relative w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[20px]',
              'bg-[color-mix(in_srgb,var(--background)_90%,transparent)]',
              'overflow-hidden',
              'hover:scale-[1.03] active:scale-95',
              'font-semibold text-dynamic-ui transition-all duration-300 ease-out'
            )}
          >
            {/* Hover gradient border effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-500 backdrop-blur-md">
              <div
                className="absolute inset-0 mix-blend-screen transition-opacity duration-300"
                style={{
                  backgroundImage: `repeating-linear-gradient(125deg, transparent 0%, transparent 15%, color-mix(in srgb, var(--accent-primary) 25%, transparent) 25%, transparent 35%, transparent 50%)`,
                  backgroundSize: '200%',
                }}
              />
            </div>
            {/* Inner plate */}
            <div className="absolute inset-[1.5px] rounded-[18.5px] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
            {/* Content */}
            <div className="relative flex items-center justify-center gap-2">
              <PlusIcon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_var(--accent-primary)]" style={{ color: 'var(--accent-primary)' }} />
              {sidebarOpen && <span className="transition-colors duration-300" style={{ color: 'var(--accent-primary)' }}>Add Card</span>}
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const iconColor = getIconColor(item.name);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-3 rounded-[20px] overflow-hidden transition-all duration-300 ease-out border border-transparent',
                  'bg-[color-mix(in_srgb,var(--background)_90%,transparent)]',
                  'hover:scale-[1.03] active:scale-95',
                  item.active &&
                    'bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)]'
                )}
              >
                {/* Hover gradient effect */}
                {!item.active && (
                  <>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-500 backdrop-blur-md">
                      <div
                        className="absolute inset-0 mix-blend-screen transition-opacity duration-300"
                        style={{
                          backgroundImage: `repeating-linear-gradient(125deg, transparent 0%, transparent 15%, color-mix(in srgb, var(--accent-primary) 25%, transparent) 25%, transparent 35%, transparent 50%)`,
                          backgroundSize: '200%',
                        }}
                      />
                    </div>
                    <div className="absolute inset-[1.5px] rounded-[18.5px] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
                  </>
                )}
                {/* Content */}
                <div className="relative flex items-center gap-3 w-full">
                  <Icon
                    className={cn(
                      'w-6 h-6 shrink-0 transition-all duration-300',
                      item.active ? 'scale-110' : 'group-hover:scale-110'
                    )}
                    style={{
                      color: item.active ? iconColor : 'var(--foreground-soft)',
                      filter: item.active ? 'none' : undefined
                    }}
                  />
                  {sidebarOpen && (
                    <span
                      className={cn(
                        'text-dynamic-ui font-medium transition-all duration-300',
                        item.active ? '' : 'group-hover:text-(--accent-primary)'
                      )}
                      style={{ color: item.active ? iconColor : undefined }}
                    >
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Data Button */}
        <div className="px-3 pb-3">
          <button
            onClick={() => setIsDataModalOpen(true)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 border border-transparent',
              'bg-[color-mix(in_srgb,var(--background)_22%,transparent)]',
              'border-[color-mix(in_srgb,var(--card-border)_70%,transparent)]',
              'hover:bg-[color-mix(in_srgb,var(--hover-bg)_80%,transparent)]',
              'hover:border-[color-mix(in_srgb,var(--accent-border)_40%,transparent)]',
              'hover:shadow-lg hover:shadow-[color-mix(in_srgb,var(--accent-primary)_10%,transparent)]',
              'hover:translate-x-1 active:scale-[0.98]',
              sidebarOpen ? 'justify-start' : 'justify-center'
            )}
          >
            <CircleStackIcon className="w-6 h-6 text-(--foreground-soft) transition-all duration-300 group-hover:scale-110" />
            {sidebarOpen && (
              <span className="text-dynamic-ui font-medium text-(--foreground-soft)">
                Data
              </span>
            )}
          </button>
        </div>

        {sidebarOpen && (
          <button
            type="button"
            onMouseDown={handleSidebarResizeStart}
            onClick={(event) => event.preventDefault()}
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-r-3xl bg-transparent hover:bg-[color-mix(in_srgb,var(--accent-primary)_22%,transparent)] transition-colors"
            aria-label="Resize sidebar"
            title="Drag to resize sidebar"
          />
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 py-5 gap-4">
        {/* Header */}
        <header className="glass-header h-16 rounded-2xl flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 transition-all duration-300 hover:opacity-80 active:scale-[0.98]"
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: accentTheme.palette[0] }}
              />
              <h1 className="text-xl text-dynamic-ui font-semibold tracking-tight hover:text-accent transition-colors duration-300">Dashboard</h1>
            </Link>

            {/* View Mode Selector */}
            {onViewModeChange && (
              <ViewModeSelector
                currentMode={viewMode}
                onModeChange={onViewModeChange}
                onClearFilters={onClearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            {onSearch && (
              <SearchBar
                onSearch={onSearch}
                className="w-80"
              />
            )}

            {/* Starred Filter Toggle */}
            {onToggleStarred && (
              <button
                onClick={onToggleStarred}
                className={cn(
                  'sidebar-hover-effect w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 relative',
                  showStarredOnly
                    ? 'bg-amber-500/10 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                    : 'surface-card surface-card--subtle'
                )}
                aria-label={showStarredOnly ? 'Show all cards' : 'Show starred only'}
                title={`${showStarredOnly ? 'Show all cards' : 'Show starred only'} (${starredCount} starred) — ⌘3`}
              >
                {showStarredOnly ? (
                  <StarIconSolid className="w-[22px] h-[22px] text-amber-400" />
                ) : (
                  <StarIcon className="w-[22px] h-[22px] text-(--foreground-soft) hover:text-amber-400 transition-colors duration-300" />
                )}
              </button>
            )}

            {/* Filter Toggle */}
            {showFiltersToggle && onToggleFilters && (
              <button
                onClick={onToggleFilters}
                className="sidebar-hover-effect w-9 h-9 flex items-center justify-center rounded-full surface-card surface-card--subtle transition-all duration-300 relative"
                aria-label="Toggle filters"
              >
                <FunnelIcon className="w-[22px] h-[22px]" />
              </button>
            )}

            {/* Docs Button */}
            <a
              href="https://bytebox.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-2 rounded-xl overflow-hidden transition-all duration-300 ease-out hover:scale-110 active:scale-95 bg-[color-mix(in_srgb,var(--background)_90%,transparent)] border border-transparent"
              aria-label="Documentation"
              title="Documentation & Help"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-500 backdrop-blur-md">
                <div
                  className="absolute inset-0 mix-blend-screen transition-opacity duration-300"
                  style={{
                    backgroundImage: `repeating-linear-gradient(125deg, transparent 0%, transparent 15%, color-mix(in srgb, var(--accent-primary) 25%, transparent) 25%, transparent 35%, transparent 50%)`,
                    backgroundSize: '200%',
                  }}
                />
              </div>
              <div className="absolute inset-[1.5px] rounded-[10.5px] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
              <BookOpenIcon className="relative w-5 h-5 text-(--foreground-soft) group-hover:text-(--accent-primary) transition-colors duration-300" />
            </a>

            {/* GitHub Button */}
            <a
              href="https://github.com/pinkpixel-dev/ByteBox"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-2 rounded-xl overflow-hidden transition-all duration-300 ease-out hover:scale-110 active:scale-95 bg-[color-mix(in_srgb,var(--background)_90%,transparent)] border border-transparent"
              aria-label="GitHub Repository"
              title="View on GitHub"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-500 backdrop-blur-md">
                <div
                  className="absolute inset-0 mix-blend-screen transition-opacity duration-300"
                  style={{
                    backgroundImage: `repeating-linear-gradient(125deg, transparent 0%, transparent 15%, color-mix(in srgb, var(--accent-primary) 25%, transparent) 25%, transparent 35%, transparent 50%)`,
                    backgroundSize: '200%',
                  }}
                />
              </div>
              <div className="absolute inset-[1.5px] rounded-[10.5px] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
              <svg className="relative w-5 h-5 text-(--foreground-soft) group-hover:text-(--accent-primary) transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>

            {/* Pink Pixel Button */}
            <a
              href="https://pinkpixel.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-2 rounded-xl overflow-hidden transition-all duration-300 ease-out hover:scale-110 active:scale-95 bg-[color-mix(in_srgb,var(--background)_90%,transparent)] border border-transparent"
              aria-label="Pink Pixel"
              title="Visit Pink Pixel"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-500 backdrop-blur-md">
                <div
                  className="absolute inset-0 mix-blend-screen transition-opacity duration-300"
                  style={{
                    backgroundImage: `repeating-linear-gradient(125deg, transparent 0%, transparent 15%, color-mix(in srgb, var(--accent-primary) 25%, transparent) 25%, transparent 35%, transparent 50%)`,
                    backgroundSize: '200%',
                  }}
                />
              </div>
              <div className="absolute inset-[1.5px] rounded-[10.5px] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
              <svg className="relative w-5 h-5 text-pink-500 transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 0v1.5H1.5V3H0v12h3v3h3v3h3v3h6v-3h3v-3h3v-3h3V3h-1.5V1.5H21V0h-3v1.5h-3V3h-1.5v3h-3V3H9V1.5H6V0z"/>
              </svg>
            </a>
          </div>
        </header>

        {/* Content Area */}
        <main className={cn("flex-1 pr-1 flex flex-col min-h-0", !disableScroll && "overflow-auto")}>
          <div className={cn("flex-1 flex flex-col min-h-0", !disableScroll && "min-h-full pb-8")}>
            {children}
          </div>
        </main>
      </div>

      {/* Data Modal */}
      <DataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />
    </div>
  );
}
