'use client';

/**
 * ByteBox - Card Component
 * Made with ❤️ by Pink Pixel
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Card as CardType } from '@/types';
import { BookmarkIcon, CodeBracketIcon, CommandLineIcon, DocumentTextIcon, PhotoIcon, PencilSquareIcon, ArrowDownTrayIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useTheme } from '@/contexts/ThemeContext';
import { Lightbox } from '@/components/ui/Lightbox';
import { downloadFile, formatFileSize, getFileIcon } from '@/lib/utils/fileUtils';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  onStarToggle?: (cardId: string, starred: boolean) => void;
  className?: string;
}

const cardTypeIcons = {
  bookmark: BookmarkIcon,
  snippet: CodeBracketIcon,
  command: CommandLineIcon,
  doc: DocumentTextIcon,
  image: PhotoIcon,
  note: PencilSquareIcon,
};

// Extracted component to avoid nested ternary operations
interface CardContentPreviewProps {
  card: CardType;
  iconColor: string;
  onImageClick: (e: React.MouseEvent) => void;
}

function CardContentPreview({ card, iconColor, onImageClick }: Readonly<CardContentPreviewProps>) {
  const cardType = card.cardType[0];

  // Image card preview
  if (cardType === 'image' && card.imageData) {
    return (
      <div className="relative mb-3 rounded-xl overflow-hidden group-hover:ring-2 ring-(--accent-primary) transition-all w-full">
        <button
          type="button"
          className="w-full cursor-zoom-in bg-transparent border-0 p-0 relative z-10"
          onClick={onImageClick}
          title="Click to view full-screen"
          aria-label="View image full-screen"
        >
          <img
            src={card.imageData.trim()}
            alt={card.title}
            className="w-full h-auto max-h-64 object-cover"
            onError={(e) => {
              // Hide broken data URIs to avoid noisy console errors
              e.currentTarget.style.display = 'none';
            }}
          />
        </button>
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-xs px-2 py-1 rounded-full glass glass--dense text-white">
            Click to zoom
          </span>
        </div>
      </div>
    );
  }

  // Document card with file attachment
  if (cardType === 'doc' && card.fileData) {
    return (
      <div className="mb-3">
        <div className="relative surface-card surface-card--subtle border border-transparent rounded-xl p-3 overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">{getFileIcon(card.fileType || '')}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-dynamic-body">{card.fileName || 'Document'}</p>
              <p className="text-xs text-(--text-soft)">
                {card.fileType?.toUpperCase()} {card.fileSize && `· ${formatFileSize(card.fileSize)}`}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (card.fileData && card.fileName) {
                  downloadFile(card.fileData, card.fileName);
                }
              }}
              className="p-2 rounded-lg hover:bg-hover transition-colors shrink-0 z-10 relative"
              title="Download file"
              aria-label="Download file"
            >
              <ArrowDownTrayIcon className="w-4 h-4" style={{ color: iconColor }} />
            </button>
          </div>
          {card.content && (
            <p className="text-xs text-(--text-soft) mt-2 line-clamp-2 text-dynamic-body">
              {card.content.substring(0, 100)}...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default content preview (bookmark, snippet, command, note)
  return (
    <div className="text-sm font-mono text-(--foreground-soft) text-dynamic-code surface-card surface-card--subtle border border-transparent rounded-xl p-3 mb-3 line-clamp-3 overflow-hidden">
      {cardType === 'bookmark' ? (
        <a
          href={card.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {card.content}
        </a>
      ) : (
        <code className="whitespace-pre-wrap wrap-break-word">{card.content}</code>
      )}
    </div>
  );
}

export function Card({ card, onClick, onStarToggle, className }: Readonly<CardProps>) {
  const Icon = cardTypeIcons[card.cardType[0] as keyof typeof cardTypeIcons];
  const { getIconColor } = useTheme();
  const iconColor = getIconColor(card.cardType[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isStarring, setIsStarring] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxOpen(true);
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStarring || !onStarToggle) return;
    
    setIsStarring(true);
    try {
      onStarToggle(card.id, !card.starred);
    } finally {
      setIsStarring(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'group relative glass glass--dense rounded-2xl p-4 transition-all duration-300 ease-out w-full overflow-hidden',
          'hover:scale-[1.02] active:scale-[0.98]',
          'border border-transparent',
          className
        )}
      >
      {/* Hover gradient shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-500 backdrop-blur-md pointer-events-none">
        <div
          className="absolute inset-0 mix-blend-screen transition-opacity duration-300"
          style={{
            backgroundImage: `repeating-linear-gradient(125deg, transparent 0%, transparent 15%, color-mix(in srgb, var(--accent-primary) 25%, transparent) 25%, transparent 35%, transparent 50%)`,
            backgroundSize: '200%',
          }}
        />
      </div>
      {/* Inner plate */}
      <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[color-mix(in_srgb,var(--glass-bg)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--glass-bg)_80%,transparent)] pointer-events-none" />
      
      {/* Clickable backdrop button - covers the card for click handling */}
      <button
        type="button"
        onClick={handleCardClick}
        className="absolute inset-0 w-full h-full rounded-2xl cursor-pointer bg-transparent border-0 z-0 focus:outline-none focus:ring-2 focus:ring-(--accent-primary) focus:ring-offset-2 focus:ring-offset-(--glass-bg)"
        aria-label={`Open ${card.title}`}
      />
      
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-2 relative z-10 pointer-events-none">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="w-5 h-5 shrink-0" style={{ color: iconColor }} />
          <h3 className="font-semibold text-(--text-strong) text-dynamic-card-title line-clamp-2 wrap-break-word group-hover:text-accent transition-colors">
            {card.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
          {/* Star Button */}
          <button
            type="button"
            onClick={handleStarClick}
            disabled={isStarring}
            className={cn(
              'p-1 rounded-lg transition-all duration-200',
              'hover:bg-[color-mix(in_srgb,var(--hover-bg)_80%,transparent)]',
              'focus:outline-none focus:ring-2 focus:ring-amber-400/50',
              isStarring && 'opacity-50 cursor-not-allowed'
            )}
            title={card.starred ? 'Unstar card' : 'Star card'}
            aria-label={card.starred ? 'Unstar card' : 'Star card'}
          >
            {card.starred ? (
              <StarIconSolid className="w-4 h-4 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
            ) : (
              <StarIcon className="w-4 h-4 text-(--foreground-soft) hover:text-amber-400 transition-colors" />
            )}
          </button>
          
          {/* Card Type Badge */}
          <span className="text-xs px-2 py-1 rounded-full border capitalize pointer-events-none"
            style={{
              borderColor: 'color-mix(in srgb, var(--accent-border) 60%, transparent)',
              background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
              color: iconColor,
            }}
          >
            {card.cardType[0]}
          </span>
        </div>
      </div>

      {/* Card Description */}
      {card.description && (
        <p className="text-sm text-(--text-soft) text-dynamic-body mb-3 line-clamp-2 relative z-10 pointer-events-none">
          {card.description}
        </p>
      )}

      {/* Card Content Preview */}
      <div className="relative z-10">
        <CardContentPreview 
          card={card}
          iconColor={iconColor}
          onImageClick={handleImageClick}
        />
      </div>

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 relative z-10 pointer-events-none">
          {card.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>

    {/* Lightbox for image cards */}
    {card.cardType[0] === 'image' && card.imageData && (
      <Lightbox 
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={card.imageData}
        title={card.title}
      />
    )}
    </>
  );
}
