/**
 * ByteBox - Draggable Board with Persistence
 * Made with ❤️ by Pink Pixel
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Card } from '@/components/cards/Card';
import { DraggableCard } from '@/components/cards/DraggableCard';
import { useTheme } from '@/contexts/ThemeContext';
import type { CategoryWithCards, Card as CardType } from '@/types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

interface DraggableBoardProps {
  categories: CategoryWithCards[];
  onCardClick?: (card: CardType) => void;
  onAddCard?: (categoryId: string) => void;
  onCardMove?: (cardId: string, newCategoryId: string, newOrder: number) => Promise<void>;
  onStarToggle?: (cardId: string, starred: boolean) => void;
  onCategoryRename?: (id: string, newName: string) => Promise<void>;
  onCategoryDelete?: (id: string) => Promise<void>;
  onCategoryReorder?: (updates: { id: string; order: number }[]) => Promise<void>;
  className?: string;
}

// ─── Sortable category column ──────────────────────────────────────────────────

interface SortableCategoryColumnProps {
  category: CategoryWithCards;
  onCardClick?: (card: CardType) => void;
  onAddCard?: (categoryId: string) => void;
  onStarToggle?: (cardId: string, starred: boolean) => void;
  onCategoryRename?: (id: string, newName: string) => Promise<void>;
  onCategoryDelete?: (id: string) => Promise<void>;
  renamingId: string | null;
  setRenamingId: (id: string | null) => void;
  renameName: string;
  setRenameName: (name: string) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  columnWidth: number;
  onColumnResizeStart: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function SortableCategoryColumn({
  category,
  onCardClick,
  onAddCard,
  onStarToggle,
  onCategoryRename,
  onCategoryDelete,
  renamingId,
  setRenamingId,
  renameName,
  setRenameName,
  deleteConfirmId,
  setDeleteConfirmId,
  columnWidth,
  onColumnResizeStart,
}: SortableCategoryColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `cat-${category.id}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const cards = category.cards || [];

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, width: `${columnWidth}px`, minWidth: `${columnWidth}px`, maxWidth: `${columnWidth}px` }}
      className="relative flex flex-col min-w-0 h-full"
    >
      <button
        type="button"
        onMouseDown={onColumnResizeStart}
        onClick={(event) => event.preventDefault()}
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-30 rounded-r-3xl bg-transparent hover:bg-[color-mix(in_srgb,var(--accent-primary)_20%,transparent)] transition-colors"
        aria-label="Resize columns"
        title="Drag to resize columns"
      />
      <div className="glass glass--dense flex h-full flex-col rounded-3xl border border-transparent overflow-hidden">
        {/* Column Header */}
        <div
          className="glass-bar flex items-center justify-between gap-3 px-4 py-3 group"
          style={{
            background: `linear-gradient(135deg, ${category.color}25, transparent 70%)`,
            borderBottomColor: `${category.color}33`,
          }}
        >
          {/* Drag handle */}
          <button
            type="button"
            className="p-1 rounded cursor-grab opacity-20 group-hover:opacity-70 hover:opacity-100! transition-opacity text-(--text-soft) hover:text-(--text-strong) shrink-0 touch-none"
            aria-label="Drag to reorder column"
            title="Drag to reorder column"
            {...attributes}
            {...listeners}
          >
            <Bars3Icon className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            {renamingId === category.id ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (renameName.trim() && onCategoryRename) {
                        onCategoryRename(category.id, renameName.trim());
                        setRenamingId(null);
                      }
                    }
                    if (e.key === 'Escape') {
                      setRenamingId(null);
                    }
                  }}
                  className="flex-1 min-w-0 px-2 py-1 rounded-lg text-sm font-semibold bg-[color-mix(in_srgb,var(--surface-card)_80%,transparent)] border border-[color-mix(in_srgb,var(--accent-primary)_50%,transparent)] text-(--text-strong) focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (renameName.trim() && onCategoryRename) {
                      onCategoryRename(category.id, renameName.trim());
                    }
                    setRenamingId(null);
                  }}
                  className="p-1 rounded-lg text-green-400 hover:bg-green-500/20 transition-colors"
                  aria-label="Save rename"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRenamingId(null)}
                  className="p-1 rounded-lg text-(--text-soft) hover:bg-[color-mix(in_srgb,var(--card-border)_30%,transparent)] transition-colors"
                  aria-label="Cancel rename"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : deleteConfirmId === category.id ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-red-400 truncate">Delete &ldquo;{category.name}&rdquo;?</span>
              </div>
            ) : (
              <h2 className="font-semibold text-(--text-strong) text-dynamic-category-title line-clamp-2 wrap-break-word flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </h2>
            )}
            {category.description && renamingId !== category.id && deleteConfirmId !== category.id && (
              <p className="text-xs text-(--text-soft) text-dynamic-body truncate mt-0.5">
                {category.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 ml-2">
            {deleteConfirmId === category.id ? (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    setDeleteConfirmId(null);
                    await onCategoryDelete?.(category.id);
                  }}
                  className="px-2 py-1 rounded-lg text-xs font-medium text-red-400 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 transition-colors"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-2 py-1 rounded-lg text-xs font-medium text-(--text-soft) border border-[color-mix(in_srgb,var(--card-border)_60%,transparent)] hover:text-(--text-strong) transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : renamingId !== category.id && (
              <>
                <span className="text-sm font-medium text-(--text-soft)">{cards.length}</span>
                {onCategoryRename && (
                  <button
                    type="button"
                    onClick={() => { setRenamingId(category.id); setRenameName(category.name); setDeleteConfirmId(null); }}
                    className="p-1.5 rounded-lg opacity-30 group-hover:opacity-100 transition-all text-(--text-soft) hover:text-(--text-strong) hover:bg-[color-mix(in_srgb,var(--card-border)_30%,transparent)]"
                    aria-label={`Rename ${category.name}`}
                    title="Rename category"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                  </button>
                )}
                {onCategoryDelete && (
                  <button
                    type="button"
                    onClick={() => { setDeleteConfirmId(category.id); setRenamingId(null); }}
                    className="p-1.5 rounded-lg opacity-30 group-hover:opacity-100 transition-all text-(--text-soft) hover:text-red-400 hover:bg-red-500/15"
                    aria-label={`Delete ${category.name}`}
                    title="Delete category"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                )}
                {onAddCard && (
                  <button
                    onClick={() => onAddCard(category.id)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{
                      color: category.color,
                      backgroundColor: `${category.color}18`,
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.backgroundColor = `${category.color}28`;
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor = `${category.color}18`;
                    }}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sortable Cards Container */}
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{
              background: 'color-mix(in srgb, var(--card-bg) 75%, transparent)',
              borderTop: `1px solid ${category.color}22`,
            }}
          >
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${category.color}22` }}
                >
                  <PlusIcon className="w-8 h-8" style={{ color: category.color }} />
                </div>
                <p className="text-sm text-(--foreground-soft) text-dynamic-body">No cards yet</p>
                {onAddCard && (
                  <button
                    onClick={() => onAddCard(category.id)}
                    className="text-xs text-accent-soft text-dynamic-body hover:text-accent transition-colors mt-2"
                  >
                    Add your first card
                  </button>
                )}
              </div>
            ) : (
              cards.map((card) => (
                <DraggableCard
                  key={card.id}
                  card={card}
                  onClick={() => onCardClick?.(card)}
                  onStarToggle={onStarToggle}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

// ─── Board ─────────────────────────────────────────────────────────────────────

export function DraggableBoard({
  categories,
  onCardClick,
  onAddCard,
  onCardMove,
  onStarToggle,
  onCategoryRename,
  onCategoryDelete,
  onCategoryReorder,
  className,
}: Readonly<DraggableBoardProps>) {
  const { fontConfig, setFontConfig } = useTheme();
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryWithCards | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isColumnResizing, setIsColumnResizing] = useState(false);
  const fontConfigRef = useRef(fontConfig);

  useEffect(() => {
    fontConfigRef.current = fontConfig;
  }, [fontConfig]);

  const columnWidth = useMemo(() => {
    const width = fontConfig.columnWidth ?? 320;
    return Math.max(260, Math.min(560, width));
  }, [fontConfig.columnWidth]);

  const updateColumnWidth = useCallback((width: number) => {
    const clamped = Math.max(260, Math.min(560, Math.round(width)));
    const currentConfig = fontConfigRef.current;
    if (currentConfig.columnWidth === clamped) return;
    setFontConfig({ ...currentConfig, columnWidth: clamped });
  }, [setFontConfig]);

  const handleColumnResizeStart = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = columnWidth;
    setIsColumnResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      updateColumnWidth(startWidth + delta);
    };

    const handleMouseUp = () => {
      globalThis.removeEventListener('mousemove', handleMouseMove);
      globalThis.removeEventListener('mouseup', handleMouseUp);
      setIsColumnResizing(false);
    };

    globalThis.addEventListener('mousemove', handleMouseMove);
    globalThis.addEventListener('mouseup', handleMouseUp);
  }, [columnWidth, updateColumnWidth]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    if (id.startsWith('cat-')) {
      const catId = id.slice(4);
      const cat = categories.find((c) => c.id === catId);
      setActiveCategory(cat ?? null);
    } else {
      const card = categories.flatMap((c) => c.cards || []).find((c) => c.id === id);
      if (card) setActiveCard(card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setActiveCategory(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Category column reorder
    if (activeId.startsWith('cat-')) {
      // Resolve over.id to a category — closestCorners may land on a card inside a column
      let targetCatId = overId;
      if (!overId.startsWith('cat-')) {
        const owningCat = categories.find((c) => c.cards?.some((card) => card.id === overId));
        if (owningCat) targetCatId = `cat-${owningCat.id}`;
      }
      if (targetCatId !== activeId && targetCatId.startsWith('cat-') && onCategoryReorder) {
        const oldIndex = categories.findIndex((c) => `cat-${c.id}` === activeId);
        const newIndex = categories.findIndex((c) => `cat-${c.id}` === targetCatId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(categories, oldIndex, newIndex);
          await onCategoryReorder(reordered.map((c, i) => ({ id: c.id, order: i })));
        }
      }
      return;
    }

    // Card reorder / move
    if (!onCardMove || activeId.startsWith('cat-')) return;

    const draggedCard = categories.flatMap((c) => c.cards || []).find((c) => c.id === activeId);
    if (!draggedCard) return;

    const overCard = categories.flatMap((c) => c.cards || []).find((c) => c.id === overId);
    const targetCategory = overCard
      ? categories.find((c) => c.cards?.some((card) => card.id === overId))
      : categories.find((c) => c.id === overId);

    if (targetCategory) {
      const targetCards = targetCategory.cards || [];
      const overIndex = targetCards.findIndex((c) => c.id === overId);
      const newOrder = overIndex >= 0 ? overIndex : targetCards.length;
      await onCardMove(draggedCard.id, targetCategory.id, newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('w-full h-full overflow-x-auto pb-2', className, isColumnResizing && 'select-none')}>
        <SortableContext
          items={categories.map((c) => `cat-${c.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          <div
            className="grid gap-4 pb-4 h-full w-max min-w-full"
            style={{ gridTemplateColumns: `repeat(${categories.length}, ${columnWidth}px)` }}
          >
            {categories.map((category) => (
              <SortableCategoryColumn
                key={category.id}
                category={category}
                onCardClick={onCardClick}
                onAddCard={onAddCard}
                onStarToggle={onStarToggle}
                onCategoryRename={onCategoryRename}
                onCategoryDelete={onCategoryDelete}
                renamingId={renamingId}
                setRenamingId={setRenamingId}
                renameName={renameName}
                setRenameName={setRenameName}
                deleteConfirmId={deleteConfirmId}
                setDeleteConfirmId={setDeleteConfirmId}
                columnWidth={columnWidth}
                onColumnResizeStart={handleColumnResizeStart}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      <DragOverlay>
        {activeCard && (
          <div className="rotate-3 scale-105">
            <Card card={activeCard} className="shadow-2xl" />
          </div>
        )}
        {activeCategory && !activeCard && (
          <div
            className="glass glass--dense rounded-3xl border border-transparent px-4 py-3 shadow-2xl opacity-90 rotate-1 scale-105 min-w-[280px]"
            style={{
              background: `linear-gradient(135deg, ${activeCategory.color}30, color-mix(in srgb, var(--surface-card) 80%, transparent) 70%)`,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeCategory.color }}
              />
              <span className="font-semibold text-(--text-strong) text-dynamic-category-title truncate">{activeCategory.name}</span>
              <span className="ml-auto text-sm text-(--text-soft)">{(activeCategory.cards || []).length}</span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
