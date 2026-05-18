'use client';

import { useState, useRef } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export function ExportImport() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setExporting(true);
      setMessage(null);

      const response = await fetch('/api/export');
      if (!response.ok) throw new Error('Export failed');

      const data = await response.json();

      // Create download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bytebox-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setMessage(null);

      // Read file
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate structure
      if (!data.version || !data.data || data.app !== 'ByteBox') {
        throw new Error('Invalid ByteBox backup file');
      }

      // Send to API
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Import failed');
      }

      const result = await response.json();
      setMessage({
        type: 'success',
        text: `Imported ${result.cardsImported} cards, ${result.categoriesImported} categories, and ${result.tagsImported} tags!`,
      });

      // Refresh the page after successful import
      setTimeout(() => {
        globalThis.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to import data',
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const tileBase =
    'sidebar-hover-effect group flex items-center justify-between gap-4 rounded-2xl px-4 py-2.5 text-left transition-all border disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-(--text-strong)">Backup & Restore</h3>
        <p className="text-xs text-(--text-soft)">
          Export your vault or bring in a previous ByteBox backup.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className={cn(
            tileBase,
            'border-[color-mix(in_srgb,var(--card-border)_70%,transparent)]',
            'bg-[color-mix(in_srgb,var(--background)_90%,transparent)]'
          )}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--background)_35%,transparent)] border border-[color-mix(in_srgb,var(--card-border)_60%,transparent)]">
              <ArrowDownTrayIcon className="w-5 h-5 text-(--text-soft) group-hover:text-(--text-strong) transition-colors" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-(--text-strong) transition-colors group-hover:text-[var(--accent-primary)]">
                {exporting ? 'Preparing export…' : 'Export Data'}
              </span>
              <span className="text-xs text-(--text-soft)">
                Download a JSON snapshot of your collection.
              </span>
            </div>
          </div>
          <span className="text-xs uppercase tracking-widest text-(--text-soft) group-hover:text-accent">
            JSON
          </span>
        </button>

        {/* Import Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className={cn(
            tileBase,
            'border-[color-mix(in_srgb,var(--card-border)_70%,transparent)]',
            'bg-[color-mix(in_srgb,var(--background)_90%,transparent)]'
          )}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--background)_35%,transparent)] border border-[color-mix(in_srgb,var(--card-border)_60%,transparent)]">
              <ArrowUpTrayIcon className="w-5 h-5 text-(--text-soft) group-hover:text-(--text-strong) transition-colors" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-(--text-strong) transition-colors group-hover:text-[var(--accent-primary)]">
                {importing ? 'Importing backup…' : 'Import Data'}
              </span>
              <span className="text-xs text-(--text-soft)">
                Merge cards, categories, and tags from a file.
              </span>
            </div>
          </div>
          <span className="text-xs uppercase tracking-widest text-(--text-soft) group-hover:text-accent">
            Upload
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={cn(
            'flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm border',
            message.type === 'success'
              ? 'bg-[color-mix(in_srgb,#22c55e_18%,transparent)] border-[color-mix(in_srgb,#22c55e_40%,transparent)] text-[color-mix(in_srgb,#22c55e_75%,white)]'
              : 'bg-[color-mix(in_srgb,#ef4444_18%,transparent)] border-[color-mix(in_srgb,#ef4444_45%,transparent)] text-[color-mix(in_srgb,#ef4444_80%,white)]'
          )}
        >
          {message.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <XCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Warning */}
      <div className="rounded-xl border border-[color-mix(in_srgb,#fbbf24_45%,transparent)] bg-[color-mix(in_srgb,#fbbf24_10%,transparent)] px-3 py-2.5 text-xs text-[color-mix(in_srgb,#fbbf24_80%,white)]">
        <strong className="font-semibold">Note:</strong>{' '}
        Importing will merge with existing data. Duplicate IDs will be updated.
      </div>
    </div>
  );
}
