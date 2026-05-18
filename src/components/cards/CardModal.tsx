'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon, BookmarkIcon, CodeBracketIcon, CommandLineIcon, DocumentTextIcon, PhotoIcon, ClipboardIcon, TrashIcon, MagnifyingGlassPlusIcon, PencilSquareIcon, StarIcon, CheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { Card as CardType, Tag } from '@/types';
import { normalizeLanguage, LANGUAGE_OPTIONS } from '@/lib/utils/syntax';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { Lightbox } from '@/components/ui/Lightbox';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface CardModalProps {
  card: CardType | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (cardId: string) => void;
  onUpdate?: (updatedCard: CardType) => void;
  allTags?: Tag[];
  categories?: Array<{ id: string; name: string; color?: string }>;
}

const cardTypeIcons = {
  bookmark: BookmarkIcon,
  snippet: CodeBracketIcon,
  command: CommandLineIcon,
  doc: DocumentTextIcon,
  image: PhotoIcon,
  note: PencilSquareIcon,
};

export function CardModal({ card, isOpen, onClose, onDelete, onUpdate, allTags = [], categories = [] }: Readonly<CardModalProps>) {
  const { getIconColor } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [editStarred, setEditStarred] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const cardId = card?.id ?? null;

  // Initialize edit form when card changes or edit mode is entered
  const initializeEditForm = useCallback(() => {
    if (card) {
      setEditTitle(card.title);
      setEditDescription(card.description || '');
      setEditContent(card.content);
      setEditLanguage(card.language || (card.type === 'command' ? 'bash' : 'javascript'));
      setEditStarred(card.starred);
      setEditCategoryId(card.categoryId);
      setSelectedTagIds(card.tags?.map(t => t.id) || []);
    }
  }, [card]);

  useEffect(() => {
    if (isOpen && card) {
      initializeEditForm();
    }
  }, [isOpen, card, initializeEditForm]);

  useEffect(() => {
    if (!isOpen || !cardId) {
      queueMicrotask(() => {
        setShowDeleteConfirm(false);
        setCopySuccess(false);
        setLightboxOpen(false);
        setIsEditing(false);
      });
    }
  }, [isOpen, cardId]);

  // Cleanup body styles on unmount
  useEffect(() => {
    return () => {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    };
  }, []);

  if (!card) return null;

  const Icon = cardTypeIcons[card.type as keyof typeof cardTypeIcons];
  const shouldHighlight = card.type === 'snippet' || card.type === 'command';
  const iconColor = getIconColor(card.type);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!card || !onUpdate) return;

    setIsSaving(true);
    try {
      // Get tag names for the selected tags
      const tagNames = selectedTagIds
        .map((id) => allTags.find((t) => t.id === id)?.name)
        .filter((n): n is string => !!n);

      // Also include any new tags that were on the card but not in allTags
      const existingTagNames = card.tags
        ?.filter(t => selectedTagIds.includes(t.id))
        .map(t => t.name) || [];

      const allTagNames = [...new Set([...tagNames, ...existingTagNames])];

      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          content: editContent,
          language: (card.type === 'snippet' || card.type === 'command') ? editLanguage : undefined,
          starred: editStarred,
          categoryId: editCategoryId !== card.categoryId ? editCategoryId : undefined,
          tagNames: allTagNames,
        }),
      });

      if (!response.ok) throw new Error('Failed to update card');

      const updatedCard = await response.json();
      onUpdate(updatedCard);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save card:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    initializeEditForm();
    setIsEditing(false);
  };

  const handleToggleStar = async () => {
    if (!card || !onUpdate) return;

    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleStar' }),
      });

      if (!response.ok) throw new Error('Failed to toggle star');

      const updatedCard = await response.json();
      onUpdate(updatedCard);
      setEditStarred(updatedCard.starred);
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(card.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      await fetch(`/api/cards/${card.id}`, {
        method: 'DELETE',
      });
      onDelete(card.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  const renderCardContent = () => {
    // Image Display
    if (card.type === 'image' && card.imageData) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-(--text-soft)">Image</h4>
            <button
              onClick={() => setLightboxOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] hover:bg-[color-mix(in_srgb,var(--hover-bg)_90%,transparent)] transition-colors"
            >
              <MagnifyingGlassPlusIcon className="w-4 h-4" />
              <span>View Full-Screen</span>
            </button>
          </div>
          <button
            type="button"
            className="relative rounded-xl overflow-hidden border border-[color-mix(in_srgb,var(--accent-border)_40%,transparent)] w-full bg-transparent p-0 cursor-pointer"
            onClick={() => setLightboxOpen(true)}
            aria-label={`View ${card.title} full-screen`}
          >
            <img
              src={card.imageData.trim()}
              alt={card.title}
              className="w-full h-auto max-h-[70vh] object-contain bg-black/5"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </button>
        </div>
      );
    }

    // Code/Command with Syntax Highlighting
    if (shouldHighlight) {
      const fallbackLanguage = card.type === 'command' ? 'bash' : 'javascript';
      const displayLanguage = isEditing ? editLanguage : (card.language ?? fallbackLanguage);
      return (
        <div className="min-h-[120px]">
          <CodeBlock
            code={isEditing ? editContent : card.content}
            language={normalizeLanguage(displayLanguage)}
            filename={card.url ?? undefined}
          />
        </div>
      );
    }

    // Bookmark URL
    if (card.type === 'bookmark') {
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-(--text-soft)">URL</h4>
          <a
            href={card.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline transition-colors font-mono text-sm block break-all"
          >
            {card.content}
          </a>
        </div>
      );
    }

    // Default content display (notes, docs, etc.)
    return (
      <div className="space-y-2 min-h-[80px]">
        <h4 className="text-sm font-medium text-(--text-soft)">Content</h4>
        <div className="prose prose-invert max-w-none">
          <pre className="whitespace-pre-wrap wrap-break-word text-sm font-mono surface-card surface-card--subtle border border-transparent px-4 py-3 rounded-xl min-h-[60px]">
            {card.content}
          </pre>
        </div>
      </div>
    );
  };

  // Render edit form
  const renderEditForm = () => {
    // Combine allTags with any tags already on the card that might not be in allTags
    const availableTags = [...allTags];
    if (card.tags) {
      for (const cardTag of card.tags) {
        if (!availableTags.some(t => t.id === cardTag.id)) {
          availableTags.push(cardTag);
        }
      }
    }

    return (
      <div className="space-y-4">
        {/* Category */}
        {categories.length > 0 && (
          <div>
            <label htmlFor="edit-category" className="block text-xs font-medium text-(--text-soft) mb-1">Category</label>
            <select
              id="edit-category"
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              className="w-full rounded-lg border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] px-3 py-2 bg-[color-mix(in_srgb,var(--surface-card)_90%,transparent)] text-(--text-strong) focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-primary)_50%,transparent)] [&>option]:bg-(--surface-card) [&>option]:text-(--text-strong)"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="edit-title" className="block text-xs font-medium text-(--text-soft) mb-1">Title</label>
          <input
            id="edit-title"
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[color-mix(in_srgb,var(--surface-card)_80%,transparent)] border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-primary)_50%,transparent)] text-(--text-strong)"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="edit-description" className="block text-xs font-medium text-(--text-soft) mb-1">Description</label>
          <input
            id="edit-description"
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Optional description..."
            className="w-full px-3 py-2 rounded-lg bg-[color-mix(in_srgb,var(--surface-card)_80%,transparent)] border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-primary)_50%,transparent)] text-(--text-strong)"
          />
        </div>

        {/* Content (not for images) */}
        {card.type !== 'image' && (
          <div>
            <label htmlFor="edit-content" className="block text-xs font-medium text-(--text-soft) mb-1">
              {card.type === 'bookmark' ? 'URL' : 'Content'}
            </label>
            <textarea
              id="edit-content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={card.type === 'bookmark' ? 2 : 6}
              className="w-full px-3 py-2 rounded-lg bg-[color-mix(in_srgb,var(--surface-card)_80%,transparent)] border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-primary)_50%,transparent)] text-(--text-strong) font-mono text-sm resize-y min-h-[100px]"
            />
          </div>
        )}

        {/* Language (for snippets/commands) */}
        {(card.type === 'snippet' || card.type === 'command') && (
          <div>
            <label htmlFor="edit-language" className="block text-xs font-medium text-(--text-soft) mb-1">Language</label>
            <select
              id="edit-language"
              value={editLanguage}
              onChange={(e) => setEditLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[color-mix(in_srgb,var(--surface-card)_80%,transparent)] border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-primary)_50%,transparent)] text-(--text-strong) [&>option]:bg-(--surface-card) [&>option]:text-(--text-strong)"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tags */}
        <fieldset>
          <legend className="block text-xs font-medium text-(--text-soft) mb-2">Tags</legend>
          {availableTags.length === 0 ? (
            <p className="text-xs text-(--text-soft)">
              No tags yet.{' '}
              <a href="/tags" className="underline hover:text-(--text-strong) transition-colors">Create tags on the Tags page</a>
              {' '}to organize your cards.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                      isSelected ? 'scale-105' : 'opacity-60 hover:opacity-100 hover:scale-105'
                    )}
                    style={{
                      backgroundColor: isSelected ? `${tag.color}35` : `${tag.color}18`,
                      color: tag.color,
                      border: `1px solid ${tag.color}${isSelected ? '70' : '35'}`,
                      boxShadow: isSelected ? `0 0 0 2px ${tag.color}35` : undefined,
                    }}
                  >
                    {isSelected && <CheckIcon className="w-3 h-3" />}
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        {/* Starred toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditStarred(!editStarred)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
              editStarred
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] hover:bg-[color-mix(in_srgb,var(--hover-bg)_80%,transparent)]'
            )}
          >
            {editStarred ? (
              <StarIconSolid className="w-4 h-4" />
            ) : (
              <StarIcon className="w-4 h-4" />
            )}
            <span className="text-sm">{editStarred ? 'Starred' : 'Not Starred'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-4xl min-h-[400px] transform overflow-hidden glass glass--dense rounded-3xl text-left align-middle shadow-[0_40px_120px_rgba(5,6,11,0.65)] transition-all flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 glass-bar">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className="w-6 h-6 shrink-0" style={{ color: iconColor }} />
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <span className="text-xl font-semibold text-(--text-strong)">Editing Card</span>
                      ) : (
                        <>
                          <DialogTitle className="text-xl font-semibold text-(--text-strong) flex items-center gap-2">
                            {card.title}
                            {card.starred && <StarIconSolid className="w-5 h-5 text-amber-400 shrink-0" />}
                          </DialogTitle>
                          {card.description && (
                            <p className="text-sm text-(--text-soft) mt-1">
                              {card.description}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Star button in header (view mode only) */}
                    {!isEditing && onUpdate && (
                      <button
                        onClick={handleToggleStar}
                        className={cn(
                          'p-2 rounded-xl transition-colors',
                          card.starred
                            ? 'text-amber-400 hover:bg-amber-500/10'
                            : 'hover:bg-[color-mix(in_srgb,var(--hover-bg)_90%,transparent)]'
                        )}
                        title={card.starred ? 'Unstar card' : 'Star card'}
                      >
                        {card.starred ? (
                          <StarIconSolid className="w-5 h-5" />
                        ) : (
                          <StarIcon className="w-5 h-5" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 rounded-xl transition-colors hover:bg-[color-mix(in_srgb,var(--hover-bg)_90%,transparent)]"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1">
                  {isEditing ? (
                    renderEditForm()
                  ) : (
                    <>
                      {/* Card Content Display */}
                      {renderCardContent()}

                      {/* Tags */}
                      {card.tags && card.tags.length > 0 && (
                        <div className="space-y-2 pt-4 border-t border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]">
                          <h4 className="text-sm font-medium text-(--text-soft)">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {card.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="px-3 py-1.5 rounded-full text-sm font-medium"
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
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] text-xs text-(--text-soft)">
                        <div>
                          <span className="font-medium">Type:</span>{' '}
                          <span className="capitalize">{card.type}</span>
                        </div>
                        {card.createdAt && (
                          <div>
                            <span className="font-medium">Created:</span>{' '}
                            {new Date(card.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 glass-bar border-t border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] mt-auto">
                  {/* Left: Delete button */}
                  <div>
                    {!isEditing && (
                      showDeleteConfirm ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-400">Delete this card?</span>
                          <button
                            onClick={handleDelete}
                            className="px-3 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            Yes, delete
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-1.5 rounded-lg text-sm border border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] hover:bg-[color-mix(in_srgb,var(--hover-bg)_90%,transparent)] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete card"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )
                    )}
                  </div>

                  {/* Right: Action buttons */}
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 rounded-lg border border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] hover:bg-[color-mix(in_srgb,var(--hover-bg)_90%,transparent)] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving || !editTitle.trim()}
                          className="px-4 py-2 rounded-lg accent-gradient font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Edit button */}
                        {onUpdate && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] hover:bg-[color-mix(in_srgb,var(--hover-bg)_90%,transparent)] transition-colors"
                            title="Edit card"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                            <span className="text-sm">Edit</span>
                          </button>
                        )}

                        {/* Copy button (for non-image cards) */}
                        {card.type !== 'image' && card.content && (
                          <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] hover:bg-[color-mix(in_srgb,var(--hover-bg)_90%,transparent)] transition-colors"
                            title="Copy content"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                            <span className="text-sm">{copySuccess ? 'Copied!' : 'Copy'}</span>
                          </button>
                        )}

                        {/* Visit Link button (for bookmarks) */}
                        {card.type === 'bookmark' && card.content && (
                          <a
                            href={card.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg accent-gradient font-medium transition-all"
                          >
                            Visit Link
                          </a>
                        )}

                        {/* Close button */}
                        <button
                          onClick={onClose}
                          className="px-4 py-2 rounded-lg border border-[color-mix(in_srgb,var(--card-border)_90%,transparent)] hover:bg-[color-mix(in_srgb,var(--hover-bg)_90%,transparent)] transition-colors"
                        >
                          Close
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>

    {/* Lightbox for full-screen image viewing */}
    {card.type === 'image' && card.imageData && (
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={card.imageData.trim()}
        title={card.title}
      />
    )}
    </>
  );
}
