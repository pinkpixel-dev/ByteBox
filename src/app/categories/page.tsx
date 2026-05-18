/**
 * ByteBox - Categories Page
 * Made with ❤️ by Pink Pixel
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/cards/Card';
import { FolderIcon, Squares2X2Icon, PlusIcon, TrashIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { Card as CardType } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

const CATEGORY_COLORS = [
  { value: '#ec4899', label: 'Pink' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#22c55e', label: 'Green' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#3b82f6', label: 'Blue' },
];

type CategoryWithCards = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  cards: CardType[];
};

export default function CategoriesPage() {
  const { getIconColor } = useTheme();
  const [categories, setCategories] = useState<CategoryWithCards[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'count'>('name');

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#ec4899');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Per-category delete tracking
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit tracking (name + color)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data: CategoryWithCards[] = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = useCallback(async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setCreateError('Category name is required');
      return;
    }
    if (trimmed.length > 32) {
      setCreateError('Category name must be 32 characters or fewer');
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setCreateError('A category with this name already exists');
      return;
    }

    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, color: newCatColor }),
      });
      if (!res.ok) {
        const err = await res.json();
        setCreateError(err.error ?? 'Failed to create category');
        return;
      }
      setNewCatName('');
      setNewCatColor('#ec4899');
      setShowCreateForm(false);
      await fetchData();
    } catch {
      setCreateError('Failed to create category');
    } finally {
      setCreating(false);
    }
  }, [newCatName, newCatColor, categories]);

  const handleDeleteCategory = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        console.error('Failed to delete category');
        return;
      }
      if (selectedCategory === id) setSelectedCategory(null);
      setDeleteConfirmId(null);
      await fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setDeletingId(null);
    }
  }, [selectedCategory]);

  const handleSaveEdit = useCallback(async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const nameChanged = trimmed !== cat.name;
    const colorChanged = editColor !== cat.color;
    if (!nameChanged && !colorChanged) {
      setEditingId(null);
      return;
    }
    try {
      const body: Record<string, string> = {};
      if (nameChanged) body.name = trimmed;
      if (colorChanged) body.color = editColor;
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      setEditingId(null);
      await fetchData();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  }, [editName, editColor, categories]);

  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return (b.cards?.length || 0) - (a.cards?.length || 0);
    }
  });

  const getStats = () => {
    const totalCategories = categories.length;
    const totalCards = categories.reduce((sum, cat) => sum + (cat.cards?.length || 0), 0);
    const avgPerCat = totalCategories > 0 ? (totalCards / totalCategories).toFixed(1) : '0';
    return { totalCategories, totalCards, avgPerCat };
  };

  const stats = getStats();
  const statPalette = {
    total: getIconColor('categories-total'),
    cards: getIconColor('categories-cards'),
    avg: getIconColor('categories-average'),
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  const renderCategoryGridContent = () => {
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

    if (categories.length === 0) {
      return (
        <div className="text-center py-12">
          <FolderIcon className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
          <p className="text-(--text-soft) mb-4">
            Create your first category to start organizing your board
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
            Create Category
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sortedCategories.map((cat) => {
          const cardCount = cat.cards?.length ?? 0;
          const isDeleting = deletingId === cat.id;
          const isConfirmingDelete = deleteConfirmId === cat.id;
          const isEditing = editingId === cat.id;

          return (
            <div
              key={cat.id}
              className={cn(
                'group relative surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 transition-all',
                'hover:border-[color-mix(in_srgb,var(--accent-border)_50%,transparent)] hover:shadow-[0_16px_45px_color-mix(in_srgb,var(--accent-primary)_18%,transparent)]',
                selectedCategory === cat.id && 'border-[color-mix(in_srgb,var(--accent-border)_80%,transparent)] bg-accent-soft/40 shadow-[0_18px_50px_color-mix(in_srgb,var(--accent-primary)_22%,transparent)]'
              )}
            >
              {/* Action buttons - top right */}
              <div className="absolute top-2 right-2 flex items-center gap-0.5">
                {/* Rename button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingId(cat.id); setEditName(cat.name); setEditColor(cat.color); setDeleteConfirmId(null); }}
                  className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                    'opacity-0 group-hover:opacity-100',
                    'hover:bg-[color-mix(in_srgb,var(--card-border)_30%,transparent)] text-(--text-soft) hover:text-(--text-strong)]'
                  )}
                  aria-label={`Rename ${cat.name}`}
                  title="Edit category"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(cat.id); setEditingId(null); }}
                  disabled={isDeleting}
                  className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                    'opacity-0 group-hover:opacity-100',
                    'hover:bg-red-500/20 text-(--text-soft) hover:text-red-400',
                    isDeleting && 'opacity-100 animate-pulse'
                  )}
                  aria-label={`Delete ${cat.name}`}
                  title="Delete category"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delete confirmation overlay */}
              {isConfirmingDelete && (
                <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 z-10 bg-[color-mix(in_srgb,var(--surface-card)_95%,transparent)] backdrop-blur-sm border border-red-500/30">
                  <p className="text-sm text-red-400 text-center font-medium">Delete &ldquo;{cat.name}&rdquo;?</p>
                  <p className="text-xs text-(--text-soft) text-center">This will also delete all {cardCount} card{cardCount === 1 ? '' : 's'} in it.</p>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                      className="px-3 py-1.5 rounded-lg text-xs border border-[color-mix(in_srgb,var(--card-border)_60%,transparent)] text-(--text-soft) hover:text-(--text-strong) transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Edit overlay (name + color) */}
              {isEditing && (
                <div
                  className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 z-10 bg-[color-mix(in_srgb,var(--surface-card)_95%,transparent)] backdrop-blur-sm border border-[color-mix(in_srgb,var(--accent-primary)_40%,transparent)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[color-mix(in_srgb,var(--surface-card)_80%,transparent)] border border-[color-mix(in_srgb,var(--accent-primary)_50%,transparent)] text-(--text-strong) focus:outline-none"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {CATEGORY_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setEditColor(c.value)}
                        className="w-6 h-6 rounded-full transition-all hover:scale-110"
                        style={{
                          backgroundColor: c.value,
                          ...(editColor === c.value ? { outline: `2px solid ${c.value}`, outlineOffset: '2px' } : {}),
                        }}
                        aria-label={c.label}
                        title={c.label}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      disabled={!editName.trim()}
                      className="group relative px-3 py-1.5 rounded-[20px] text-xs font-medium disabled:opacity-50 overflow-hidden transition-all duration-300 ease-out bg-[color-mix(in_srgb,var(--background)_90%,transparent)] border border-transparent hover:scale-[1.03] active:scale-95"
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
                      <span className="relative" style={{ color: 'var(--accent-primary)' }}>Save</span>
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs border border-[color-mix(in_srgb,var(--card-border)_60%,transparent)] text-(--text-soft) hover:text-(--text-strong)"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Main content - clickable to filter */}
              <button
                className="w-full text-left"
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              >
                <div className="flex items-start justify-between mb-2 pr-10">
                  <span
                    className="w-4 h-4 rounded-full mt-0.5 shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full surface-card surface-card--subtle text-(--text-soft) border border-[color-mix(in_srgb,var(--card-border)_70%,transparent)]">
                    {cardCount}
                  </span>
                </div>
                <p className="font-medium truncate text-(--text-strong) pr-5">{cat.name}</p>
                <p className="text-xs text-(--text-soft) mt-1">
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
            <h1 className="text-3xl font-bold font-brand text-(--text-strong)">
              Categories
            </h1>
            <div className="h-1 w-16 rounded-full mt-2" style={{ backgroundColor: 'var(--accent-primary)' }} />
            <p className="text-(--text-soft) mt-3">
              Manage your board columns
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
            <span className="relative" style={{ color: 'var(--accent-primary)' }}>New Category</span>
          </button>
        </div>

        {/* Create Category Form */}
        {showCreateForm && (
          <div className="glass glass--dense rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-(--text-strong)">Create New Category</h2>
              <button
                onClick={() => { setShowCreateForm(false); setNewCatName(''); setCreateError(''); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[color-mix(in_srgb,var(--card-border)_30%,transparent)] text-(--text-soft) transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-(--text-soft) mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => { setNewCatName(e.target.value); setCreateError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCategory(); }}
                  placeholder="e.g. Frontend, Backend, DevOps…"
                  maxLength={32}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-[color-mix(in_srgb,var(--surface-base)_60%,transparent)] border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] text-(--text-strong) placeholder:text-(--text-soft) focus:outline-none focus:border-[color-mix(in_srgb,var(--accent-primary)_60%,transparent)] transition-colors"
                  autoFocus
                />
                {createError && (
                  <p className="mt-1.5 text-xs text-red-400">{createError}</p>
                )}
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-(--text-soft) mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewCatColor(c.value)}
                      className="w-8 h-8 rounded-full transition-all focus:outline-none hover:scale-105"
                      style={{
                        backgroundColor: c.value,
                        ...(newCatColor === c.value ? { outline: `3px solid ${c.value}`, outlineOffset: '3px', transform: 'scale(1.15)' } : {}),
                      }}
                      aria-label={c.label}
                      title={c.label}
                    />
                  ))}
                </div>
                {/* Preview */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-(--text-soft)">Preview:</span>
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${newCatColor}20`,
                      color: newCatColor,
                      border: `1px solid ${newCatColor}40`,
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: newCatColor }} />
                    {newCatName.trim() || 'category-name'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCreateCategory}
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
                  <span className="relative" style={{ color: 'var(--accent-primary)' }}>Create Category</span>
                </button>
                <button
                  onClick={() => { setShowCreateForm(false); setNewCatName(''); setCreateError(''); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-(--text-soft) hover:text-(--text-strong) transition-colors border border-[color-mix(in_srgb,var(--card-border)_60%,transparent)] hover:border-[color-mix(in_srgb,var(--card-border)_100%,transparent)]"
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
                <FolderIcon className="w-6 h-6" style={{ color: statPalette.total }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--text-strong)">{stats.totalCategories}</p>
                <p className="text-sm text-(--text-soft)">Categories</p>
              </div>
            </div>
          </div>

          <div className="glass glass--dense rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${statPalette.cards}22` }}
              >
                <Squares2X2Icon className="w-6 h-6" style={{ color: statPalette.cards }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--text-strong)">{stats.totalCards}</p>
                <p className="text-sm text-(--text-soft)">Total Cards</p>
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
                <p className="text-2xl font-bold text-(--text-strong)">{stats.avgPerCat}</p>
                <p className="text-sm text-(--text-soft)">Avg per Category</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="glass glass--dense rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {categories.length > 0 ? `All Categories (${categories.length})` : 'All Categories'}
            </h2>
            {categories.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-(--text-soft)">Sort by:</span>
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
                  <span className="relative" style={sortBy === 'count' ? { color: 'var(--accent-primary)' } : undefined}>Cards</span>
                </button>
              </div>
            )}
          </div>

          {renderCategoryGridContent()}
        </div>

        {/* Selected Category Cards */}
        {selectedCategory && selectedCategoryData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Cards in &ldquo;{selectedCategoryData.name}&rdquo;
              </h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm flex items-center gap-1 text-(--text-soft) hover:text-(--text-strong) transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Clear
              </button>
            </div>

            {selectedCategoryData.cards.length === 0 ? (
              <div className="glass glass--dense rounded-3xl p-12 text-center">
                <p className="text-(--text-soft)">No cards in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCategoryData.cards.map((card) => (
                  <Card key={card.id} card={card} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
