/**
 * ByteBox - Board Component (Kanban Layout)
 * Made with ❤️ by Pink Pixel
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/cards';
import type { Category as CategoryType, CategoryWithCards, Card as CardType } from '@/types';
import { PlusIcon } from '@heroicons/react/24/outline';

interface CategoryColumnProps {
  category: CategoryType;
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  onAddCard?: (categoryId: string) => void;
  className?: string;
}

export function CategoryColumn({
  category,
  cards,
  onCardClick,
  onAddCard,
  className,
}: Readonly<CategoryColumnProps>) {
  return (
    <div
      className={cn(
        'flex flex-col min-w-0 h-full',
        className
      )}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between p-4 rounded-t-lg border-b"
        style={{
          backgroundColor: `${category.color}15`,
          borderColor: `${category.color}30`,
        }}
      >
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground text-dynamic-category-title line-clamp-2 wrap-break-word flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </h2>
          {category.description && (
            <p className="text-xs text-foreground/60 text-dynamic-body truncate mt-0.5">
              {category.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm font-medium text-foreground/60">
            {cards.length}
          </span>
          {onAddCard && (
            <button
              onClick={() => onAddCard(category.id)}
              className="p-1 hover:bg-background/50 rounded transition-colors"
              aria-label={`Add card to ${category.name}`}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-(--card-bg)/30 rounded-b-lg border border-t-0 border-card-border">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <PlusIcon className="w-8 h-8" style={{ color: category.color }} />
            </div>
            <p className="text-sm text-foreground/60 text-dynamic-body">No cards yet</p>
            {onAddCard && (
              <button
                onClick={() => onAddCard(category.id)}
                className="text-xs text-accent text-dynamic-body hover:underline mt-2 transition-colors"
              >
                Add your first card
              </button>
            )}
          </div>
        ) : (
          cards.map((card) => (
            <Card key={card.id} card={card} onClick={() => onCardClick?.(card)} />
          ))
        )}
      </div>
    </div>
  );
}

interface BoardProps {
  categories: CategoryWithCards[];
  onCardClick?: (card: CardType) => void;
  onAddCard?: (categoryId: string) => void;
  className?: string;
}

export function Board({
  categories,
  onCardClick,
  onAddCard,
  className,
}: Readonly<BoardProps>) {
  return (
    <div className={cn('w-full h-full overflow-x-auto pb-2', className)}>
      <div className="grid gap-4 pb-4 h-full w-max min-w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, var(--board-column-width, 320px))` }}>
        {categories.map((category) => (
          <CategoryColumn
            key={category.id}
            category={category}
            cards={category.cards || []}
            onCardClick={onCardClick}
            onAddCard={onAddCard}
          />
        ))}
      </div>
    </div>
  );
}
