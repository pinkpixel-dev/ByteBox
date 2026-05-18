'use client';

import { XMarkIcon, FunnelIcon, StarIcon, ClockIcon, Squares2X2Icon, TagIcon as TagFilterIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Tag } from '@/types';
import type { ViewMode } from './ViewModeSelector';

interface FilterPanelProps {
  availableTags: Tag[];
  selectedTags: string[];
  onToggleTag: (tagName: string) => void;
  filterMode: 'AND' | 'OR';
  onFilterModeChange: (mode: 'AND' | 'OR') => void;
  onClearFilters?: () => void;
  showStarredOnly?: boolean;
  onToggleStarred?: () => void;
  starredCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  className?: string;
}

export function FilterPanel({
  availableTags,
  selectedTags,
  onToggleTag,
  filterMode,
  onFilterModeChange,
  onClearFilters,
  showStarredOnly = false,
  onToggleStarred,
  starredCount = 0,
  viewMode = 'all',
  onViewModeChange,
  className = '',
}: Readonly<FilterPanelProps>) {
  const hasFilters = selectedTags.length > 0 || viewMode !== 'all';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5" style={{ color: 'var(--icon-3)' }} />
          <h3 className="text-sm font-medium text-(--text-strong)">Filters</h3>
          {hasFilters && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-accent-soft text-accent">
              {selectedTags.length + (showStarredOnly ? 1 : 0)}
            </span>
          )}
        </div>
        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-accent-soft hover:text-accent transition-colors flex items-center gap-1"
          >
            <XMarkIcon className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Starred Filter */}
      {onToggleStarred && (
        <div className="space-y-2">
          <button
            onClick={onToggleStarred}
            className={`
              w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl
              transition-all duration-200 border
              ${
                showStarredOnly
                  ? 'bg-amber-500/10 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                  : 'surface-card surface-card--subtle border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] hover:border-amber-400/30'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {showStarredOnly ? (
                <StarIconSolid className="w-5 h-5 text-amber-400" />
              ) : (
                <StarIcon className="w-5 h-5 text-(--foreground-soft)" />
              )}
              <span className={`text-sm font-medium ${showStarredOnly ? 'text-amber-400' : 'text-(--foreground-soft)'}`}>
                Starred Only
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              showStarredOnly
                ? 'bg-amber-400/20 text-amber-400'
                : 'bg-(--hover-bg) text-(--foreground-soft)'
            }`}>
              {starredCount}
            </span>
          </button>
          <p className="text-xs text-(--foreground-soft) px-1">
            Press <kbd className="px-1.5 py-0.5 rounded bg-(--hover-bg) text-xs font-mono">⌘3</kbd> to toggle
          </p>
        </div>
      )}

      {/* View Mode Quick Switches */}
      {onViewModeChange && (
        <div className="space-y-2">
          <p className="text-xs text-(--foreground-soft)">Quick views:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewModeChange('all')}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                transition-all duration-200 border
                ${viewMode === 'all'
                  ? 'bg-accent-soft/80 border-[color-mix(in_srgb,var(--accent-border)_70%,transparent)] text-accent'
                  : 'surface-card surface-card--subtle border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] text-(--foreground-soft) hover:text-(--foreground)'
                }
              `}
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span>All</span>
            </button>
            <button
              onClick={() => onViewModeChange('recent')}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                transition-all duration-200 border
                ${viewMode === 'recent'
                  ? 'bg-accent-soft/80 border-[color-mix(in_srgb,var(--accent-border)_70%,transparent)] text-accent'
                  : 'surface-card surface-card--subtle border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] text-(--foreground-soft) hover:text-(--foreground)'
                }
              `}
            >
              <ClockIcon className="w-4 h-4" />
              <span>Recent</span>
            </button>
            <button
              onClick={() => onViewModeChange('starred')}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                transition-all duration-200 border
                ${viewMode === 'starred'
                  ? 'bg-amber-500/10 border-amber-400/40 text-amber-400'
                  : 'surface-card surface-card--subtle border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] text-(--foreground-soft) hover:text-(--foreground)'
                }
              `}
            >
              {viewMode === 'starred' ? <StarIconSolid className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
              <span>Starred</span>
            </button>
            <button
              onClick={() => onViewModeChange('by-tag')}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                transition-all duration-200 border
                ${viewMode === 'by-tag'
                  ? 'bg-accent-soft/80 border-[color-mix(in_srgb,var(--accent-border)_70%,transparent)] text-accent'
                  : 'surface-card surface-card--subtle border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] text-(--foreground-soft) hover:text-(--foreground)'
                }
              `}
            >
              <TagFilterIcon className="w-4 h-4" />
              <span>By Tag</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Mode Toggle */}
      {selectedTags.length > 1 && (
        <div className="flex items-center gap-2 p-2 rounded-xl surface-card surface-card--subtle">
          <span className="text-xs text-(--foreground-soft)">Match:</span>
          <div className="flex rounded-lg overflow-hidden border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]">
            <button
              onClick={() => onFilterModeChange('OR')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                filterMode === 'OR'
                  ? 'accent-glow-active'
                  : 'bg-(--hover-bg) text-(--foreground-soft) hover:text-(--foreground)'
              }`}
            >
              Any
            </button>
            <button
              onClick={() => onFilterModeChange('AND')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                filterMode === 'AND'
                  ? 'accent-glow-active'
                  : 'bg-(--hover-bg) text-(--foreground-soft) hover:text-(--foreground)'
              }`}
            >
              All
            </button>
          </div>
        </div>
      )}

      {/* Tag List */}
      <div className="space-y-2">
        <p className="text-xs text-(--foreground-soft)">Filter by tags:</p>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name);
          const tagTextColor = isSelected ? undefined : (tag.color || undefined);
          return (
            <button
              key={tag.id}
              onClick={() => onToggleTag(tag.name)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? 'accent-glow-active'
                    : 'surface-card surface-card--subtle text-(--foreground-soft) hover:text-(--foreground) border border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] hover:border-[color-mix(in_srgb,var(--accent-border)_40%,transparent)]'
                }
              `}
              style={{
                borderColor: isSelected
                  ? 'transparent'
                  : `${tag.color}55`,
                color: tagTextColor,
              }}
            >
              {tag.name}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
