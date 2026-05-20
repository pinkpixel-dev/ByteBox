/**
 * ByteBox - Create Card Modal (restored UX)
 * Large dialog with drag-and-drop upload for image/doc, previews and tag picking.
 */

'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { XMarkIcon, PhotoIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { processImage, validateImageFile } from '@/lib/utils/imageUtils';
import { processDocFile, validateDocFile, formatFileSize, getFileIcon } from '@/lib/utils/fileUtils';
import { LANGUAGE_OPTIONS } from '@/lib/utils/syntax';

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Array<{ id: string; name: string }>;
  allTags: Array<{ id: string; name: string; color: string }>;
  preselectedCategoryId?: string;
}

interface DropdownSelectProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  options: { id: string; name: string }[];
}

function DropdownSelect({ id, value, onChange, options }: DropdownSelectProps) {
  const selectedOption = options.find((o) => o.id === value) || options[0];

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <>
          <ListboxButton
            data-select-id={id}
            className={cn(
              "flex w-full items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium",
              "transition-all duration-200 border",
              "surface-card surface-card--subtle hover:border-[color-mix(in_srgb,var(--accent-border)_40%,transparent)] bg-[rgba(5,6,11,0.9)] text-(--text-strong)"
            )}
          >
            <span className="truncate">{selectedOption?.name || 'Select option'}</span>
            <ChevronDownIcon className="w-4 h-4 opacity-60 shrink-0" />
          </ListboxButton>

          {globalThis.window !== undefined && open && createPortal(
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <ListboxOptions
                static
                className="fixed rounded-2xl focus:outline-none z-9999 overflow-hidden shadow-[0_26px_70px_rgba(0,0,0,0.75)]"
                style={{
                  top: `${(document.querySelector(`[data-select-id="${id}"]`) as HTMLElement)?.getBoundingClientRect().bottom + 8 || 0}px`,
                  left: `${(document.querySelector(`[data-select-id="${id}"]`) as HTMLElement)?.getBoundingClientRect().left || 0}px`,
                  width: `${(document.querySelector(`[data-select-id="${id}"]`) as HTMLElement)?.getBoundingClientRect().width || 256}px`,
                  backgroundColor: 'color-mix(in srgb, var(--background-muted) 50%, transparent)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid color-mix(in srgb, var(--glass-border) 10%, transparent)',
                  maxHeight: '250px',
                  overflowY: 'auto'
                }}
              >
                <div className="p-2 relative flex flex-col gap-0.5" style={{ color: '#f8fafc' }}>
                  {options.map((option) => (
                    <ListboxOption key={option.id} value={option.id}>
                      {({ focus, selected }) => (
                        <div
                          className={cn(
                            "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-[20px] text-left transition-all duration-300 ease-out overflow-hidden cursor-pointer",
                            "bg-[color-mix(in_srgb,var(--background)_90%,transparent)]",
                            selected && "border border-transparent",
                            !selected && focus && "scale-[1.02]"
                          )}
                        >
                          {(selected || focus) && (
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
                          <div className="relative flex-1 min-w-0">
                            <p
                              className="text-sm font-medium transition-colors duration-300"
                              style={{
                                color: selected ? 'var(--accent-primary)' : '#f8fafc',
                              }}
                            >
                              {option.name}
                            </p>
                          </div>
                        </div>
                      )}
                    </ListboxOption>
                  ))}
                </div>
              </ListboxOptions>
            </Transition>,
            document.body
          )}
        </>
      )}
    </Listbox>
  );
}

export default function CreateCardModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
  allTags,
  preselectedCategoryId,
}: Readonly<CreateCardModalProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryIdRef = useRef<string>('');
  const [type, setType] = useState<'bookmark' | 'snippet' | 'command' | 'doc' | 'image' | 'note'>('snippet');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [categoryId, _setCategoryId] = useState<string>('');
  const setCategoryId = useCallback((id: string) => {
    categoryIdRef.current = id;
    _setCategoryId(id);
  }, []);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [imageData, setImageData] = useState<string>('');
  const [fileData, setFileData] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCategoryId(preselectedCategoryId || categories[0]?.id || '');
    }
    // Only reset on modal open/close and preselectedCategoryId changes.
    // Do NOT include `categories` — adding a new category would fire this
    // effect and reset the selection back to the first category.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, preselectedCategoryId]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
  };

  const resetFileState = () => {
    setImageData('');
    setFileData('');
    setFileName('');
    setFileType('');
    setFileSize(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageSelect = async (file: File) => {
    setError('');
    const ok = validateImageFile(file);
    if (!ok.valid) {
      setError(ok.error || 'Invalid image');
      return;
    }
    try {
      const base64 = await processImage(file);
      setImageData(base64);
      setContent(base64); // keep content searchable/previewable
      setFileName(file.name);
      setFileType(file.type);
      setFileSize(file.size);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process image');
    }
  };

  const handleDocSelect = async (file: File) => {
    setError('');
    const ok = validateDocFile(file);
    if (!ok.valid) {
      setError(ok.error || 'Invalid document');
      return;
    }
    try {
      const processed = await processDocFile(file);
      setFileData(processed.base64);
      setFileName(processed.fileName);
      setFileType(processed.fileType);
      setFileSize(processed.fileSize);
      setContent(processed.extractedText);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process document');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'image') handleImageSelect(file);
    else if (type === 'doc') handleDocSelect(file);
  };

  const onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (type === 'image') handleImageSelect(file);
    else if (type === 'doc') handleDocSelect(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title || !categoryIdRef.current) {
      setError('Please provide a title and category');
      return;
    }
    if (type !== 'image' && type !== 'doc' && !content) {
      setError('Please provide content');
      return;
    }
    setIsSubmitting(true);
    try {
      const tagNames = selectedTagIds
        .map((id) => allTags.find((t) => t.id === id)?.name)
        .filter((n): n is string => !!n);

      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          description,
          content,
          imageData: type === 'image' ? imageData : undefined,
          fileData: type === 'doc' ? fileData : undefined,
          fileName: type === 'doc' ? fileName : undefined,
          fileType: type === 'doc' ? fileType : undefined,
          fileSize: type === 'doc' ? fileSize : undefined,
          language: type === 'snippet' || type === 'command' ? language : undefined,
          categoryId: categoryIdRef.current,
          tagNames,
        }),
      });
      if (!res.ok) throw new Error('Failed to create card');

      // success
      onSuccess();
      onClose();
      // reset form
      setTitle('');
      setDescription('');
      setContent('');
      setLanguage('javascript');
      setSelectedTagIds([]);
      resetFileState();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContentInput = () => {
    if (type === 'image') {
      return (
        <div>
          <span id="image-upload-label" className="block text-xs font-medium mb-2">Upload Image</span>
          <button
            type="button"
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={cn(
              'relative w-full flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer transition-all border-2 border-dashed',
              isDragging
                ? 'border-[color-mix(in_srgb,var(--accent-border)_90%,transparent)] bg-accent-soft/30 scale-[1.02]'
                : 'border-[color-mix(in_srgb,var(--card-border)_70%,transparent)] hover:border-[color-mix(in_srgb,var(--accent-border)_60%,transparent)] surface-card surface-card--subtle'
            )}
            onClick={() => fileInputRef.current?.click()}
            aria-labelledby="image-upload-label"
          >
            <PhotoIcon className="w-10 h-10 mb-2" />
            <p className="text-sm">Click or drag an image here</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_center,var(--accent-soft),transparent_70%)] opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          {imageData && (
            <div className="mt-3 rounded-xl overflow-hidden border border-[color-mix(in_srgb,var(--accent-border)_40%,transparent)]">
              <img src={imageData} alt={title || 'Uploaded image'} className="w-full h-auto max-h-[60vh] object-contain bg-black/5" />
            </div>
          )}
        </div>
      );
    }

    if (type === 'doc') {
      return (
        <div className="space-y-3">
          <span id="doc-upload-label" className="block text-xs font-medium">Upload File <span className="text-(--text-soft)">(Markdown or PDF, max 10MB)</span></span>
          <button
            type="button"
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={cn(
              'relative w-full flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer transition-all border-2 border-dashed',
              isDragging
                ? 'border-[color-mix(in_srgb,var(--accent-border)_90%,transparent)] bg-accent-soft/30 scale-[1.02]'
                : 'border-[color-mix(in_srgb,var(--card-border)_70%,transparent)] hover:border-[color-mix(in_srgb,var(--accent-border)_60%,transparent)] surface-card surface-card--subtle'
            )}
            onClick={() => fileInputRef.current?.click()}
            aria-labelledby="doc-upload-label"
          >
            <span className="text-5xl mb-2">{getFileIcon(fileType || 'text/markdown')}</span>
            <p className="text-sm font-medium">Click or drag file here</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,application/pdf,text/markdown,text/plain"
              className="hidden"
              onChange={handleFileInput}
            />
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_center,var(--accent-soft),transparent_70%)] opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          {fileData && (
            <div className="p-4 rounded-xl border border-[color-mix(in_srgb,var(--accent-border)_60%,transparent)] surface-card surface-card--subtle">
              <div className="flex items-start gap-3">
                <span className="text-3xl shrink-0">{getFileIcon(fileType)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{fileName}</p>
                  <p className="text-xs text-(--text-soft) mt-1">{fileType?.toUpperCase()} · {formatFileSize(fileSize)}</p>
                  {content && <p className="text-xs text-(--text-soft) mt-2 line-clamp-3">{content.substring(0, 150)}...</p>}
                </div>
                <button
                  type="button"
                  onClick={resetFileState}
                  className="p-2 rounded-lg hover:bg-hover transition-colors shrink-0"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default: bookmark, snippet, command, note
    const labelText = type === 'bookmark' ? 'URL' : 'Content';
    return (
      <div>
        <label htmlFor="card-content" className="block text-xs font-medium mb-1">{labelText}</label>
        <textarea
          id="card-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === 'bookmark' ? 'https://example.com' : 'Enter content...'}
          rows={6}
          className={cn('w-full px-3 py-2 rounded-lg font-mono text-sm bg-[color-mix(in_srgb,var(--surface-card)_90%,transparent)] border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] text-(--text-strong) placeholder:text-(--text-soft) focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-primary)_50%,transparent)]')}
          required={!imageData && !fileData}
        />
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden glass glass--dense rounded-3xl text-left align-middle shadow-[0_40px_120px_rgba(5,6,11,0.65)]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 glass-bar">
                  <DialogTitle className="text-lg font-semibold text-(--text-strong)">Create New Card</DialogTitle>
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-[color-mix(in_srgb,var(--hover-bg)_90%,transparent)]">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <form onSubmit={submit} className="p-6 space-y-5">
                  {error && <div className="text-sm text-red-400">{error}</div>}

                  {/* Type & Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="card-type" className="block text-xs font-medium mb-1">Type</label>
                      <DropdownSelect
                        id="card-type"
                        value={type}
                        onChange={(val) => {
                          const next = val as typeof type;
                          setType(next);
                          setContent('');
                          resetFileState();
                        }}
                        options={['bookmark', 'snippet', 'command', 'doc', 'image', 'note'].map(t => ({ id: t, name: t.charAt(0).toUpperCase() + t.slice(1) }))}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="card-category" className="text-xs font-medium">Category</label>
                      </div>
                      <DropdownSelect
                        id="card-category"
                        value={categoryId}
                        onChange={setCategoryId}
                        options={categories}
                      />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="card-title" className="block text-xs font-medium mb-1">Title</label>
                      <input
                        id="card-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-lg border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] px-3 py-2 bg-[color-mix(in_srgb,var(--surface-card)_90%,transparent)] text-(--text-strong) focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-primary)_50%,transparent)]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="card-description" className="block text-xs font-medium mb-1">Description</label>
                      <input id="card-description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] px-3 py-2 bg-[color-mix(in_srgb,var(--surface-card)_90%,transparent)] text-(--text-strong) focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-primary)_50%,transparent)]" />
                    </div>
                  </div>

                  {/* Conditional Inputs */}
                  {renderContentInput()}

                  {/* Language (snippets/commands) */}
                  {(type === 'snippet' || type === 'command') && (
                    <div>
                      <label htmlFor="card-language" className="block text-xs font-medium mb-1">Language</label>
                      <DropdownSelect
                        id="card-language"
                        value={language}
                        onChange={setLanguage}
                        options={LANGUAGE_OPTIONS.map(lang => ({ id: lang.value, name: lang.label }))}
                      />
                    </div>
                  )}

                  {/* Tags */}
                  <fieldset>
                    <legend className="block text-xs font-medium mb-2">Tags</legend>
                    {allTags.length === 0 ? (
                      <p className="text-xs text-(--text-soft)">
                        No tags yet.{' '}
                        <a href="/tags" className="underline hover:text-(--text-strong) transition-colors">Create tags on the Tags page</a>
                        {' '}to organize your cards.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => {
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

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-(--text-soft) hover:text-(--text-strong) transition-colors">
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="group relative px-4 py-2 rounded-[20px] font-medium disabled:opacity-60 overflow-hidden transition-all duration-300 ease-out bg-[color-mix(in_srgb,var(--background)_90%,transparent)] border border-transparent hover:scale-[1.03] active:scale-95"
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
                      <span className="relative" style={{ color: 'var(--accent-primary)' }}>{isSubmitting ? 'Creating...' : 'Create Card'}</span>
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
