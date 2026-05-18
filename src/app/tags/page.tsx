/**
 * ByteBox - Tags Page
 * Made with ❤️ by Pink Pixel
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/cards/Card';
import { TagIcon, HashtagIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { Tag as PrismaTag, Card as PrismaCard, Category as PrismaCategory } from '@prisma/client';
import type { Card as CardType } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

const TAG_COLORS = [
  { value: '#ec4899', label: 'Pink' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#22c55e', label: 'Green' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#3b82f6', label: 'Blue' },
];

type CardWithRelations = PrismaCard & {
  category: PrismaCategory;
  tags: PrismaTag[];
};

type TagWithCount = PrismaTag & {
  _count: {
    cards: number;
  };
};

export default function TagsPage() {
  const { getIconColor } = useTheme();
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [cards, setCards] = useState<CardWithRelations[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'count'>('name');

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#8b5cf6');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Per-tag delete tracking
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTag) {
      const filtered = cards.filter(card =>
        card.tags.some(tag => tag.id === selectedTag)
      );
      setFilteredCards(filtered);
    } else {
      setFilteredCards([]);
    }
  }, [selectedTag, cards]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsRes, tagsRes] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/tags'),
      ]);
      const cardsData = await cardsRes.json();
      const tagsData: TagWithCount[] = await tagsRes.json();

      const allCards: CardWithRelations[] = [];
      for (const cat of cardsData.boardData.categories as { cards: CardWithRelations[] }[]) {
        allCards.push(...cat.cards);
      }

      setCards(allCards);
      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = useCallback(async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) {
      setCreateError('Tag name is required');
      return;
    }
    if (trimmed.length > 32) {
      setCreateError('Tag name must be 32 characters or fewer');
      return;
    }
    if (tags.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setCreateError('A tag with this name already exists');
      return;
    }

    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, color: newTagColor }),
      });
      if (!res.ok) {
        const err = await res.json();
        setCreateError(err.error ?? 'Failed to create tag');
        return;
      }
      setNewTagName('');
      setNewTagColor('#8b5cf6');
      setShowCreateForm(false);
      await fetchData();
    } catch {
      setCreateError('Failed to create tag');
    } finally {
      setCreating(false);
    }
  }, [newTagName, newTagColor, tags]);

  const handleDeleteTag = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        console.error('Failed to delete tag');
        return;
      }
      if (selectedTag === id) setSelectedTag(null);
      await fetchData();
    } catch (error) {
      console.error('Error deleting tag:', error);
    } finally {
      setDeletingId(null);
    }
  }, [selectedTag]);

  const sortedTags = [...tags].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return (b._count?.cards || 0) - (a._count?.cards || 0);
    }
  });

  const getTagStats = () => {
    const totalTags = tags.length;
    const totalUsage = tags.reduce((sum, tag) => sum + (tag._count?.cards || 0), 0);
    const avgPerTag = totalTags > 0 ? (totalUsage / totalTags).toFixed(1) : 0;
    return { totalTags, totalUsage, avgPerTag };
  };

  const stats = getTagStats();
  const statPalette = {
    total: getIconColor('tags-total'),
    usage: getIconColor('tags-usage'),
    avg: getIconColor('tags-average'),
  };

  const renderTagGridContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div
            className="animate-spin w-8 h-8 border-4 rounded-full"
            style={{
              borderColor: 'color-mix(in srgb, var(--accent-primary) 30%, transparent)',
              borderTopColor: 'transparent',
              borderRightColor: 'var(--accent-primary)',
            }}
          />
        </div>
      );
    }

    if (tags.length === 0) {
      return (
        <div className="text-center py-12">
          <TagIcon className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No tags yet</h3>
          <p className="text-[var(--text-soft)] mb-4">
            Create your first tag to start organizing your cards
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)',
              color: 'var(--accent-primary)',
              border: '1px solid color-mix(in srgb, var(--accent-primary) 40%, transparent)',
            }}
          >
            <PlusIcon className="w-4 h-4" />
            Create Tag
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sortedTags.map((tag) => {
          const cardCount = tag._count?.cards ?? 0;
          const isDeleting = deletingId === tag.id;
          return (
            <div
              key={tag.id}
              className={cn(
                'group relative surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 transition-all',
                'hover:border-[color-mix(in_srgb,var(--accent-border)_50%,transparent)] hover:shadow-[0_16px_45px_color-mix(in_srgb,var(--accent-primary)_18%,transparent)]',
                selectedTag === tag.id && 'border-[color-mix(in_srgb,var(--accent-border)_80%,transparent)] bg-accent-soft/40 shadow-[0_18px_50px_color-mix(in_srgb,var(--accent-primary)_22%,transparent)]'
              )}
            >
              {/* Delete button */}
              <button
                onClick={() => handleDeleteTag(tag.id)}
                disabled={isDeleting}
                className={cn(
                  'absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                  'opacity-0 group-hover:opacity-100',
                  'hover:bg-red-500/20 text-[var(--text-soft)] hover:text-red-400',
                  isDeleting && 'opacity-100 animate-pulse'
                )}
                aria-label={`Delete ${tag.name} tag`}
                title="Delete tag"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>

              {/* Clickable area */}
              <button
                className="w-full text-left"
                onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
              >
                <div className="flex items-start justify-between mb-2 pr-5">
                  <div
                    className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full surface-card surface-card--subtle text-[var(--text-soft)] border border-[color-mix(in_srgb,var(--card-border)_70%,transparent)]">
                    {cardCount}
                  </span>
                </div>
                <p className="font-medium truncate text-[var(--text-strong)] pr-5">{tag.name}</p>
                <p className="text-xs text-[var(--text-soft)] mt-1">
                  {cardCount} card{cardCount === 1 ? '' : 's'}
                </p>
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AppLayout onQuickAdd={() => alert('Please navigate to the Dashboard to create cards')}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold font-brand text-[var(--text-strong)]">
              Tags
            </h1>
            <div className="h-1 w-16 rounded-full mt-2" style={{ backgroundColor: 'var(--accent-primary)' }} />
            <p className="text-[var(--text-soft)] mt-3">
              Organize and filter by tags
            </p>
          </div>
          <button
            onClick={() => { setShowCreateForm(true); setCreateError(''); }}
            className="group relative flex items-center gap-2 px-4 py-2 rounded-[20px] text-sm font-medium transition-all duration-300 ease-out mt-1 overflow-hidden bg-[color-mix(in_srgb,var(--background)_90%,transparent)] border border-transparent hover:scale-[1.03] active:scale-95"
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
            <div className="absolute inset-[1.5px] rounded-[18.5px] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
            <PlusIcon className="relative w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_var(--accent-primary)]" style={{ color: 'var(--accent-primary)' }} />
            <span className="relative" style={{ color: 'var(--accent-primary)' }}>New Tag</span>
          </button>
        </div>

        {/* Create Tag Form */}
        {showCreateForm && (
          <div className="glass glass--dense rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">Create New Tag</h2>
              <button
                onClick={() => { setShowCreateForm(false); setNewTagName(''); setCreateError(''); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[color-mix(in_srgb,var(--card-border)_30%,transparent)] text-[var(--text-soft)] transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tag Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-soft)] mb-1.5">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => { setNewTagName(e.target.value); setCreateError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTag(); }}
                  placeholder="e.g. typescript, important, todo…"
                  maxLength={32}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-[color-mix(in_srgb,var(--surface-base)_60%,transparent)] border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] text-[var(--text-strong)] placeholder:text-[var(--text-soft)] focus:outline-none focus:border-[color-mix(in_srgb,var(--accent-primary)_60%,transparent)] transition-colors"
                  autoFocus
                />
                {createError && (
                  <p className="mt-1.5 text-xs text-red-400">{createError}</p>
                )}
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-soft)] mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewTagColor(c.value)}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all focus:outline-none hover:scale-105'
                      )}
                      style={{
                        backgroundColor: c.value,
                        ...(newTagColor === c.value ? { outline: `3px solid ${c.value}`, outlineOffset: '3px', transform: 'scale(1.15)' } : {}),
                      }}
                      aria-label={c.label}
                      title={c.label}
                    />
                  ))}
                </div>
                {/* Preview */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-[var(--text-soft)]">Preview:</span>
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${newTagColor}20`,
                      color: newTagColor,
                      border: `1px solid ${newTagColor}40`,
                    }}
                  >
                    {newTagName.trim() || 'tag-name'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCreateTag}
                  disabled={creating}
                  className="group relative flex items-center gap-2 px-4 py-2 rounded-[20px] text-sm font-medium transition-all duration-300 ease-out disabled:opacity-50 overflow-hidden bg-[color-mix(in_srgb,var(--background)_90%,transparent)] border border-transparent hover:scale-[1.03] active:scale-95"
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
                  <div className="absolute inset-[1.5px] rounded-[18.5px] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
                  {creating ? (
                    <div
                      className="relative w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'var(--accent-primary)' }}
                    />
                  ) : (
                    <PlusIcon className="relative w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_var(--accent-primary)]" style={{ color: 'var(--accent-primary)' }} />
                  )}
                  <span className="relative" style={{ color: 'var(--accent-primary)' }}>Create Tag</span>
                </button>
                <button
                  onClick={() => { setShowCreateForm(false); setNewTagName(''); setCreateError(''); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-soft)] hover:text-[var(--text-strong)] transition-colors border border-[color-mix(in_srgb,var(--card-border)_60%,transparent)] hover:border-[color-mix(in_srgb,var(--card-border)_100%,transparent)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass glass--dense rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${statPalette.total}22` }}
              >
                <TagIcon className="w-6 h-6" style={{ color: statPalette.total }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-strong)]">{stats.totalTags}</p>
                <p className="text-sm text-[var(--text-soft)]">Total Tags</p>
              </div>
            </div>
          </div>

          <div className="glass glass--dense rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${statPalette.usage}22` }}
              >
                <HashtagIcon className="w-6 h-6" style={{ color: statPalette.usage }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-strong)]">{stats.totalUsage}</p>
                <p className="text-sm text-[var(--text-soft)]">Total Usage</p>
              </div>
            </div>
          </div>

          <div className="glass glass--dense rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ color: statPalette.avg, backgroundColor: `${statPalette.avg}22` }}
              >
                📊
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-strong)]">{stats.avgPerTag}</p>
                <p className="text-sm text-[var(--text-soft)]">Avg per Tag</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tags Grid */}
        <div className="glass glass--dense rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {tags.length > 0 ? `All Tags (${tags.length})` : 'All Tags'}
            </h2>
            {tags.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-soft)]">Sort by:</span>
                <button
                  onClick={() => setSortBy('name')}
                  className={cn(
                    'group relative px-3 py-1.5 rounded-[20px] text-sm font-medium transition-all duration-300 ease-out border border-transparent overflow-hidden',
                    sortBy === 'name'
                      ? 'bg-[color-mix(in_srgb,var(--background)_90%,transparent)] hover:scale-[1.03] active:scale-95'
                      : 'surface-card surface-card--subtle border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] hover:border-[color-mix(in_srgb,var(--accent-border)_45%,transparent)]'
                  )}
                >
                  {sortBy === 'name' && (
                    <>
                      <div className="absolute inset-0 opacity-70 transition-opacity duration-500 backdrop-blur-md">
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
                  <span className="relative" style={sortBy === 'name' ? { color: 'var(--accent-primary)' } : undefined}>Name</span>
                </button>
                <button
                  onClick={() => setSortBy('count')}
                  className={cn(
                    'group relative px-3 py-1.5 rounded-[20px] text-sm font-medium transition-all duration-300 ease-out border border-transparent overflow-hidden',
                    sortBy === 'count'
                      ? 'bg-[color-mix(in_srgb,var(--background)_90%,transparent)] hover:scale-[1.03] active:scale-95'
                      : 'surface-card surface-card--subtle border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] hover:border-[color-mix(in_srgb,var(--accent-border)_45%,transparent)]'
                  )}
                >
                  {sortBy === 'count' && (
                    <>
                      <div className="absolute inset-0 opacity-70 transition-opacity duration-500 backdrop-blur-md">
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
                  <span className="relative" style={sortBy === 'count' ? { color: 'var(--accent-primary)' } : undefined}>Usage</span>
                </button>
              </div>
            )}
          </div>

          {renderTagGridContent()}
        </div>

        {/* Selected Tag Cards */}
        {selectedTag && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Cards with &ldquo;{tags.find(t => t.id === selectedTag)?.name}&rdquo;
              </h2>
              <button
                onClick={() => setSelectedTag(null)}
                className="text-sm flex items-center gap-1 text-[var(--text-soft)] hover:text-[var(--text-strong)] transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Clear
              </button>
            </div>

            {filteredCards.length === 0 ? (
              <div className="glass glass--dense rounded-3xl p-12 text-center">
                <p className="text-[var(--text-soft)]">No cards found with this tag</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((card) => (
                  <Card key={card.id} card={card as unknown as CardType} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
