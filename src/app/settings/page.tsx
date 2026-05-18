/**
 * ByteBox - Settings Page
 * Made with ❤️ by Pink Pixel
 */

'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExportImport } from '@/components/ui/ExportImport';
import { useTheme } from '@/contexts/ThemeContext';
import {
  gradientPresets,
  solidColorPresets,
  defaultWallpapers,
  availableFonts,
  availableMonoFonts,
  iconThemes,
  type BackgroundConfig,
  type AccentTheme,
  type IconTheme,
  type SavedGradientPreset,
} from '@/lib/themeRegistry';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  SwatchIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, Transition } from '@headlessui/react';

export default function SettingsPage() {
  const {
    accentTheme,
    setAccentTheme,
    iconTheme,
    setIconTheme,
    customIconColor,
    setCustomIconColor,
    backgroundImage,
    setBackgroundImageFromFile,
    glassIntensity,
    setGlassIntensity,
    backgroundConfig,
    setBackgroundConfig,
    fontConfig,
    setFontConfig,
    customAccentThemes,
    addCustomAccentTheme,
    removeCustomAccentTheme,
    allAccentThemes,
    settingsPresets,
    saveCurrentAsPreset,
    loadPreset,
    deletePreset,
  } = useTheme();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [wallpaperUploading, setWallpaperUploading] = useState(false);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);

  // Custom theme creation state
  const [isCreatingTheme, setIsCreatingTheme] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeColors, setNewThemeColors] = useState<string[]>(['#f72585', '#7209b7', '#3a0ca3']);

  // Gradient customization state
  const [customGradientColors, setCustomGradientColors] = useState<string[]>(['#1a1a2e', '#16213e']);
  const [customGradientAngle, setCustomGradientAngle] = useState(135);
  const [newGradientPresetName, setNewGradientPresetName] = useState('');

  // Solid background state
  const [solidBackground, setSolidBackground] = useState('#0f1115');

  // Preset creation state
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const savedSolidColors = useMemo(() => backgroundConfig.savedSolidColors ?? [], [backgroundConfig.savedSolidColors]);
  const savedGradientPresets = useMemo(
    () => backgroundConfig.savedGradientPresets ?? [],
    [backgroundConfig.savedGradientPresets]
  );

  const withBackgroundLibraries = (
    next: Omit<BackgroundConfig, 'savedSolidColors' | 'savedGradientPresets'>
  ): BackgroundConfig => ({
    ...next,
    savedSolidColors,
    savedGradientPresets,
  });

  const normalizeHexColor = (value: string) => {
    const color = value.trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : null;
  };

  const handleClearAllData = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      const response = await fetch('/api/cards', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear data');

      alert('All data cleared successfully!');
      setShowDeleteConfirm(false);
      globalThis.location.reload();
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data. Please try again.');
    }
  };

  const handleWallpaperUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setWallpaperUploading(true);
      await setBackgroundImageFromFile(file);
    } catch (error) {
      console.error('Failed to upload wallpaper:', error);
      alert('Unable to load that image. Please try a different file.');
    } finally {
      setWallpaperUploading(false);
      if (wallpaperInputRef.current) {
        wallpaperInputRef.current.value = '';
      }
    }
  };

  const handleCreateCustomTheme = () => {
    if (!newThemeName.trim()) return;
    addCustomAccentTheme(newThemeName.trim(), newThemeColors);
    setNewThemeName('');
    setNewThemeColors(['#f72585', '#7209b7', '#3a0ca3']);
    setIsCreatingTheme(false);
  };

  const handleAddThemeColor = () => {
    if (newThemeColors.length < 6) {
      setNewThemeColors([...newThemeColors, '#ffffff']);
    }
  };

  const handleRemoveThemeColor = (index: number) => {
    if (newThemeColors.length > 2) {
      setNewThemeColors(newThemeColors.filter((_, i) => i !== index));
    }
  };

  const handleUpdateThemeColor = (index: number, color: string) => {
    const updated = [...newThemeColors];
    updated[index] = color;
    setNewThemeColors(updated);
  };

  const handleApplyGradient = (preset: typeof gradientPresets[0]) => {
    setBackgroundConfig(withBackgroundLibraries({
      type: 'gradient',
      gradientColors: preset.colors,
      gradientAngle: preset.angle,
    }));
  };

  const handleApplyCustomGradient = () => {
    setBackgroundConfig(withBackgroundLibraries({
      type: 'gradient',
      gradientColors: customGradientColors,
      gradientAngle: customGradientAngle,
    }));
  };

  const handleAddGradientColor = () => {
    if (customGradientColors.length < 4) {
      setCustomGradientColors([...customGradientColors, '#333333']);
    }
  };

  const handleRemoveGradientColor = (index: number) => {
    if (customGradientColors.length > 2) {
      setCustomGradientColors(customGradientColors.filter((_, i) => i !== index));
    }
  };

  const handleSaveSolidColor = () => {
    const normalized = normalizeHexColor(solidBackground);
    if (!normalized) return;
    if (savedSolidColors.includes(normalized)) return;
    setBackgroundConfig({
      ...backgroundConfig,
      savedSolidColors: [...savedSolidColors, normalized],
    });
  };

  const handleRemoveSavedSolidColor = (color: string) => {
    setBackgroundConfig({
      ...backgroundConfig,
      savedSolidColors: savedSolidColors.filter((savedColor) => savedColor !== color),
    });
  };

  const handleApplySavedSolidColor = (color: string) => {
    handleSetSolidBackground(color);
  };

  const handleSaveCustomGradientPreset = () => {
    if (customGradientColors.length < 2) return;
    const signature = `${customGradientColors.join(',')}|${customGradientAngle}`;
    const exists = savedGradientPresets.some(
      (preset) => `${preset.colors.join(',')}|${preset.angle}` === signature
    );
    if (exists) return;
    const customName = newGradientPresetName.trim();

    const nextPreset: SavedGradientPreset = {
      id: `saved-grad-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: customName.length > 0 ? customName : `Custom ${savedGradientPresets.length + 1}`,
      colors: [...customGradientColors],
      angle: customGradientAngle,
    };

    setBackgroundConfig({
      ...backgroundConfig,
      savedGradientPresets: [...savedGradientPresets, nextPreset],
    });
    setNewGradientPresetName('');
  };

  const handleApplySavedGradientPreset = (preset: SavedGradientPreset) => {
    setCustomGradientColors([...preset.colors]);
    setCustomGradientAngle(preset.angle);
    setBackgroundConfig(withBackgroundLibraries({
      type: 'gradient',
      gradientColors: preset.colors,
      gradientAngle: preset.angle,
    }));
  };

  const handleRemoveSavedGradientPreset = (id: string) => {
    setBackgroundConfig({
      ...backgroundConfig,
      savedGradientPresets: savedGradientPresets.filter((preset) => preset.id !== id),
    });
  };

  const handleSelectPresetWallpaper = (wallpaper: typeof defaultWallpapers[0]) => {
    setBackgroundConfig(withBackgroundLibraries({
      type: 'image',
      presetWallpaper: wallpaper.url,
    }));
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    saveCurrentAsPreset(newPresetName.trim());
    setNewPresetName('');
    setIsCreatingPreset(false);
  };

  const updateFontConfig = (updates: Partial<typeof fontConfig>) => {
    setFontConfig({ ...fontConfig, ...updates });
  };



  const handleSetSolidBackground = (color: string) => {
    setSolidBackground(color);
    setBackgroundConfig(withBackgroundLibraries({
      type: 'solid',
      solidColor: color,
    }));
  };

  const handleResetBackground = () => {
    setBackgroundConfig(withBackgroundLibraries({ type: 'default' }));
    setSolidBackground('#0f1115');
  };

  // Keep local background editors in sync with applied config
  useEffect(() => {
    if (backgroundConfig.type === 'solid' && backgroundConfig.solidColor) {
      setSolidBackground(backgroundConfig.solidColor);
    }
    if (backgroundConfig.type === 'gradient' && backgroundConfig.gradientColors?.length) {
      setCustomGradientColors(backgroundConfig.gradientColors);
      setCustomGradientAngle(backgroundConfig.gradientAngle ?? 135);
    }
  }, [backgroundConfig]);

  const glassLabel = useMemo(() => {
    if (glassIntensity <= 25) return 'Airy';
    if (glassIntensity >= 75) return 'Frosted';
    return 'Balanced';
  }, [glassIntensity]);

  const sliderBackground = useMemo(() => {
    return `linear-gradient(90deg,
      color-mix(in srgb, var(--accent-primary) 80%, transparent) 0%,
      color-mix(in srgb, var(--accent-primary) 80%, transparent) ${glassIntensity}%,
      color-mix(in srgb, var(--card-border) 55%, transparent) ${glassIntensity}%,
      color-mix(in srgb, var(--card-border) 35%, transparent) 100%)`;
  }, [glassIntensity]);

  const hasCustomBackground = backgroundConfig.type !== 'default' || !!backgroundImage;

  const wallpaperPreview = useMemo(() => {
    if (backgroundConfig.type === 'image') {
      return backgroundConfig.imageUrl || backgroundConfig.presetWallpaper || backgroundImage;
    }
    return backgroundImage;
  }, [backgroundConfig.imageUrl, backgroundConfig.presetWallpaper, backgroundConfig.type, backgroundImage]);

  return (
    <AppLayout onQuickAdd={() => alert('Please navigate to the Dashboard to create cards')}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-brand text-(--text-strong)">Settings</h1>
          <div className="h-1 w-16 rounded-full mt-2" style={{ backgroundColor: 'var(--accent-primary)' }} />
          <p className="text-(--text-soft) mt-3">
            Tune ByteBox to your own style.
          </p>
        </div>

        {/* Appearance */}
        <section className="glass glass--dense rounded-3xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-(--text-strong)">🎨 Appearance</h2>
              <p className="text-sm text-(--text-soft)">Colors, icons, and wallpaper options</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Glass Transparency */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-(--text-soft) uppercase tracking-wider">
                    Glass Transparency
                  </h3>
                  <p className="text-xs text-(--text-soft)">
                    Dial in how frosted or clear the UI surface feels against your wallpaper.
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-(--text-strong)">{glassIntensity}%</span>
                  <span className="text-xs uppercase tracking-widest text-(--text-soft)">{glassLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest text-(--text-soft)">Clear</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={glassIntensity}
                  onChange={(event) => setGlassIntensity(Number(event.target.value))}
                  style={{ background: sliderBackground }}
                  className="glass-range flex-1"
                  aria-label="Glass transparency"
                />
                <span className="text-xs uppercase tracking-widest text-(--text-soft)">Frosted</span>
              </div>
              <div className="grid gap-2 text-xs text-(--text-soft) sm:grid-cols-3">
                <div className="rounded-lg border border-[color-mix(in_srgb,var(--card-border)_65%,transparent)] px-3 py-2">
                  <p className="font-medium text-(--text-strong)">Airy</p>
                  <p>Best when your background is bold or busy.</p>
                </div>
                <div className="rounded-lg border border-[color-mix(in_srgb,var(--card-border)_65%,transparent)] px-3 py-2">
                  <p className="font-medium text-(--text-strong)">Balanced</p>
                  <p>A little frost with plenty of depth.</p>
                </div>
                <div className="rounded-lg border border-[color-mix(in_srgb,var(--card-border)_65%,transparent)] px-3 py-2">
                  <p className="font-medium text-(--text-strong)">Frosted</p>
                  <p>Stronger blur for extra-legible panels.</p>
                </div>
              </div>
            </div>

            {/* Accent Themes */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-(--text-soft) uppercase tracking-wider">Accent Themes</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {allAccentThemes.map((theme: AccentTheme) => {
                  const isActive = accentTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setAccentTheme(theme.id)}
                      className={cn(
                        'group rounded-2xl p-4 text-left transition-all duration-300 ease-out border flex flex-col gap-3 overflow-hidden relative',
                        'surface-card surface-card--subtle hover:border-[color-mix(in_srgb,var(--accent-border)_45%,transparent)]',
                        isActive && 'border-[color-mix(in_srgb,var(--accent-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)]'
                      )}
                    >
                      {isActive && (
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
                          <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
                        </>
                      )}
                      <div className="relative flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-(--text-strong)">{theme.name}</p>
                          <p className="text-xs text-(--text-soft)">{theme.description}</p>
                        </div>
                        <ArrowUpTrayIcon className={cn('w-5 h-5 transition-opacity', isActive ? 'opacity-100 text-accent' : 'opacity-0 group-hover:opacity-70')} />
                      </div>
                      <div className="relative flex items-center gap-2">
                        {theme.palette.slice(0, 6).map((color: string, index: number) => (
                          <span
                            key={color + index}
                            className="h-7 w-7 rounded-lg border"
                            style={{
                              background: color,
                              borderColor: 'rgba(255,255,255,0.08)',
                            }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Accent Themes */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-(--text-soft) uppercase tracking-wider">Custom Accent Themes</h3>
                  <p className="text-xs text-(--text-soft)">Create and save up to 6-color palettes.</p>
                </div>
                <button
                  onClick={() => setIsCreatingTheme((v) => !v)}
                  className="sidebar-hover-effect group px-3 py-2 text-sm rounded-lg border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] transition-all flex items-center gap-2 text-(--foreground-soft) group-hover:text-[var(--accent-primary)]"
                >
                  <PlusIcon className="w-4 h-4" />
                  {isCreatingTheme ? 'Close builder' : 'New custom theme'}
                </button>
              </div>

              {isCreatingTheme && (
                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="new-theme-name" className="text-xs font-semibold text-(--text-soft) uppercase tracking-widest">Theme name</label>
                    <input
                      id="new-theme-name"
                      value={newThemeName}
                      onChange={(event) => setNewThemeName(event.target.value)}
                      placeholder="e.g. Cyber Sunset"
                      className="w-full rounded-lg px-3 py-2 bg-transparent border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] focus:border-[color-mix(in_srgb,var(--accent-border)_65%,transparent)] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-(--text-soft) uppercase tracking-widest">Colors</span>
                      <span className="text-[11px] text-(--text-soft)">{newThemeColors.length}/6</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {newThemeColors.map((color, idx) => (
                        <div key={color + idx} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={color}
                            onChange={(event) => handleUpdateThemeColor(idx, event.target.value)}
                            className="h-12 w-12 rounded-xl border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]"
                            aria-label={`Custom theme color ${idx + 1}`}
                          />
                          {newThemeColors.length > 2 && (
                            <button
                              onClick={() => handleRemoveThemeColor(idx)}
                              className="p-2 rounded-lg hover:bg-[color-mix(in_srgb,var(--hover-bg)_80%,transparent)]"
                              aria-label="Remove color"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {newThemeColors.length < 6 && (
                        <button
                          onClick={handleAddThemeColor}
                          className="sidebar-hover-effect group h-12 px-4 rounded-xl border border-dashed border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] text-sm text-(--foreground-soft) flex items-center gap-2 group-hover:text-[var(--accent-primary)]"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Add color
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleCreateCustomTheme}
                      className="px-4 py-2 rounded-lg bg-[color-mix(in_srgb,var(--accent-primary)_85%,transparent)] text-white text-sm font-semibold shadow-[0_12px_35px_color-mix(in_srgb,var(--accent-primary)_38%,transparent)]"
                    >
                      Save theme
                    </button>
                    <button
                      onClick={() => {
                        setNewThemeName('');
                        setNewThemeColors(['#f72585', '#7209b7', '#3a0ca3']);
                        setIsCreatingTheme(false);
                      }}
                      className="px-4 py-2 rounded-lg surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {customAccentThemes.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {customAccentThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className="rounded-2xl p-4 border surface-card surface-card--subtle border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-(--text-strong)">{theme.name}</p>
                          <p className="text-xs text-(--text-soft)">Custom palette</p>
                        </div>
                        <button
                          onClick={() => removeCustomAccentTheme(theme.id)}
                          className="p-2 rounded-lg hover:bg-[color-mix(in_srgb,var(--hover-bg)_90%,transparent)] text-(--text-soft)"
                          aria-label={`Delete ${theme.name}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {theme.palette.slice(0, 6).map((color: string, index: number) => (
                          <span
                            key={color + index}
                            className="h-7 w-7 rounded-lg border"
                            style={{
                              background: color,
                              borderColor: 'rgba(255,255,255,0.08)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Icon Palettes */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-(--text-soft) uppercase tracking-wider">Icon Palette</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {iconThemes.map((theme: IconTheme) => {
                  const palette = theme.userAdjustable
                    ? [customIconColor || theme.palette[0], ...theme.palette.slice(1)]
                    : theme.palette;
                  const isActive = iconTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setIconTheme(theme.id)}
                      className={cn(
                        'group rounded-2xl p-4 text-left transition-all duration-300 ease-out border flex flex-col gap-3 overflow-hidden relative',
                        'surface-card surface-card--subtle hover:border-[color-mix(in_srgb,var(--accent-border)_45%,transparent)]',
                        isActive && 'border-[color-mix(in_srgb,var(--accent-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)]'
                      )}
                    >
                      {isActive && (
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
                          <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
                        </>
                      )}
                      <div className="relative flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-(--text-strong)">{theme.name}</p>
                          <p className="text-xs text-(--text-soft)">{theme.description}</p>
                        </div>
                        <ArrowDownTrayIcon className={cn('w-5 h-5 transition-opacity', isActive ? 'opacity-100 text-accent' : 'opacity-0 group-hover:opacity-70')} />
                      </div>
                      <div className="relative flex items-center gap-2">
                        {palette.slice(0, 6).map((color: string, index: number) => (
                          <span
                            key={color + index}
                            className="h-7 w-7 rounded-full border"
                            style={{
                              background: color,
                              borderColor: 'rgba(255,255,255,0.15)',
                            }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {iconTheme.userAdjustable && (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    value={customIconColor}
                    onChange={(event) => setCustomIconColor(event.target.value)}
                    className="h-12 w-12 rounded-2xl border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]"
                    aria-label="Custom icon color"
                  />
                  <div>
                    <p className="text-sm font-medium text-(--text-strong)">Custom icon color</p>
                    <p className="text-xs text-(--text-soft)">{customIconColor}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Backgrounds */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-(--text-soft) uppercase tracking-wider">Backgrounds</h3>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-(--text-strong)">Solid background</p>
                      <p className="text-xs text-(--text-soft)">Pick any hex and we’ll set both background tokens to it.</p>
                    </div>
                    <SwatchIcon className="w-5 h-5 text-(--text-soft)" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="color"
                      value={solidBackground}
                      onChange={(event) => handleSetSolidBackground(event.target.value)}
                      className="h-12 w-12 rounded-xl border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]"
                      aria-label="Solid background color"
                    />
                    <input
                      value={solidBackground}
                      onChange={(event) => setSolidBackground(event.target.value)}
                      className="px-3 py-2 rounded-lg bg-transparent border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] focus:border-[color-mix(in_srgb,var(--accent-border)_60%,transparent)] outline-none text-sm"
                      aria-label="Solid background color hex value"
                    />
                    <button
                      onClick={() => handleSetSolidBackground(solidBackground)}
                      className="group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-[20px] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] overflow-hidden hover:scale-[1.03] active:scale-95 font-semibold text-sm text-dynamic-ui transition-all duration-300 ease-out"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-500 backdrop-blur-md">
                        <div
                          className="absolute inset-0 mix-blend-screen transition-opacity duration-300"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(125deg, transparent 0%, transparent 15%, color-mix(in srgb, var(--accent-primary) 25%, transparent) 25%, transparent 35%, transparent 50%)',
                            backgroundSize: '200%',
                          }}
                        />
                      </div>
                      <div className="absolute inset-[1.5px] rounded-[18.5px] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
                      <span className="relative" style={{ color: 'var(--accent-primary)' }}>Apply solid</span>
                    </button>
                    <button
                      onClick={handleSaveSolidColor}
                      disabled={!normalizeHexColor(solidBackground) || savedSolidColors.includes((normalizeHexColor(solidBackground) || '').toLowerCase())}
                      className={cn(
                        'sidebar-hover-effect group px-3 py-2 rounded-lg text-sm border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] text-(--foreground-soft) group-hover:text-[var(--accent-primary)]',
                        normalizeHexColor(solidBackground) && !savedSolidColors.includes((normalizeHexColor(solidBackground) || '').toLowerCase())
                          ? ''
                          : 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      Save color
                    </button>
                    <button
                      onClick={handleResetBackground}
                      disabled={!hasCustomBackground}
                      className={cn(
                        'sidebar-hover-effect group px-3 py-2 rounded-lg text-sm border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] text-(--foreground-soft) group-hover:text-[var(--accent-primary)]',
                        hasCustomBackground ? '' : 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      Reset to default
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-(--text-soft) uppercase tracking-widest">Color presets</p>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {solidColorPresets.map((preset) => {
                        const isActive =
                          backgroundConfig.type === 'solid' &&
                          (backgroundConfig.solidColor ?? '').toLowerCase() === preset.color.toLowerCase();
                        return (
                          <button
                            key={preset.id}
                            onClick={() => handleApplySavedSolidColor(preset.color)}
                            className={cn(
                              'group relative rounded-lg border p-1.5 transition-all text-left overflow-hidden',
                              'surface-card surface-card--subtle hover:border-[color-mix(in_srgb,var(--accent-border)_45%,transparent)]',
                              isActive && 'border-[color-mix(in_srgb,var(--accent-border)_80%,transparent)]'
                            )}
                            title={preset.name}
                          >
                            {isActive && (
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
                                <div className="absolute inset-[1.5px] rounded-[calc(0.5rem-1.5px)] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
                              </>
                            )}
                            <span className="relative block h-8 rounded-md border border-white/10" style={{ backgroundColor: preset.color }} />
                          </button>
                        );
                      })}
                      {savedSolidColors.map((color) => {
                        const isActive =
                          backgroundConfig.type === 'solid' &&
                          (backgroundConfig.solidColor ?? '').toLowerCase() === color.toLowerCase();
                        return (
                          <div key={color} className="group relative">
                            <button
                              onClick={() => handleApplySavedSolidColor(color)}
                              className={cn(
                                'w-full rounded-lg border p-1.5 transition-all overflow-hidden relative',
                                'surface-card surface-card--subtle hover:border-[color-mix(in_srgb,var(--accent-border)_45%,transparent)]',
                                isActive && 'border-[color-mix(in_srgb,var(--accent-border)_80%,transparent)]'
                              )}
                              title={`${color} (saved)`}
                            >
                              {isActive && (
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
                                  <div className="absolute inset-[1.5px] rounded-[calc(0.5rem-1.5px)] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 pointer-events-none" />
                                </>
                              )}
                              <span className="relative block h-8 rounded-md border border-white/10" style={{ backgroundColor: color }} />
                            </button>
                            <button
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleRemoveSavedSolidColor(color);
                              }}
                              className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1 bg-[color-mix(in_srgb,var(--background)_82%,transparent)] border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] text-(--text-soft) hover:text-red-400"
                              aria-label={`Delete saved color ${color}`}
                              title="Delete saved color"
                            >
                              <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-(--text-strong)">Gradient background</p>
                      <p className="text-xs text-(--text-soft)">Blend 2–4 colors or pick a preset, then set the angle.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {customGradientColors.map((color, idx) => (
                      <div key={color + idx} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(event) => {
                            const updated = [...customGradientColors];
                            updated[idx] = event.target.value;
                            setCustomGradientColors(updated);
                          }}
                          className="h-12 w-12 rounded-xl border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]"
                          aria-label={`Gradient color ${idx + 1}`}
                        />
                        {customGradientColors.length > 2 && (
                          <button
                            onClick={() => handleRemoveGradientColor(idx)}
                            className="p-2 rounded-lg hover:bg-[color-mix(in_srgb,var(--hover-bg)_80%,transparent)]"
                            aria-label="Remove gradient color"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {customGradientColors.length < 4 && (
                      <button
                        onClick={handleAddGradientColor}
                        className="sidebar-hover-effect group h-12 px-4 rounded-xl border border-dashed border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] text-sm text-(--foreground-soft) flex items-center gap-2 group-hover:text-[var(--accent-primary)]"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add color
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-widest text-(--text-soft)">Angle</span>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={customGradientAngle}
                      onChange={(event) => setCustomGradientAngle(Number(event.target.value))}
                      className="glass-range flex-1"
                      aria-label="Gradient angle"
                    />
                    <span className="text-sm font-semibold text-(--text-strong)">{customGradientAngle}°</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleApplyCustomGradient}
                      className="group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-[20px] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] overflow-hidden hover:scale-[1.03] active:scale-95 font-semibold text-sm text-dynamic-ui transition-all duration-300 ease-out"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-500 backdrop-blur-md">
                        <div
                          className="absolute inset-0 mix-blend-screen transition-opacity duration-300"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(125deg, transparent 0%, transparent 15%, color-mix(in srgb, var(--accent-primary) 25%, transparent) 25%, transparent 35%, transparent 50%)',
                            backgroundSize: '200%',
                          }}
                        />
                      </div>
                      <div className="absolute inset-[1.5px] rounded-[18.5px] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--background-muted)_80%,transparent)] pointer-events-none" />
                      <span className="relative" style={{ color: 'var(--accent-primary)' }}>Apply custom gradient</span>
                    </button>
                    <button
                      onClick={() => {
                        setCustomGradientColors(['#1a1a2e', '#16213e']);
                        setCustomGradientAngle(135);
                      }}
                      className="sidebar-hover-effect group px-4 py-2 rounded-lg text-sm border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] text-(--foreground-soft) group-hover:text-[var(--accent-primary)]"
                    >
                      Reset gradient editor
                    </button>
                  </div>

                  <div className="flex gap-2 flex-wrap items-center">
                    <input
                      type="text"
                      value={newGradientPresetName}
                      onChange={(event) => setNewGradientPresetName(event.target.value)}
                      placeholder="Name this saved gradient (optional)"
                      className="h-10 min-w-[220px] flex-1 rounded-lg border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--surface-1)_92%,transparent)] px-3 text-sm text-(--text-strong) placeholder:text-(--text-soft)"
                      maxLength={48}
                    />
                    <button
                      onClick={handleSaveCustomGradientPreset}
                      className="sidebar-hover-effect group px-4 py-2 rounded-lg text-sm border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] text-(--foreground-soft) group-hover:text-[var(--accent-primary)]"
                    >
                      Save gradient
                    </button>
                  </div>

                  {savedGradientPresets.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-(--text-soft) uppercase tracking-widest">Saved gradients</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {savedGradientPresets.map((preset) => {
                          const isActive =
                            backgroundConfig.type === 'gradient' &&
                            backgroundConfig.gradientColors?.join(',') === preset.colors.join(',') &&
                            (backgroundConfig.gradientAngle ?? 135) === preset.angle;
                          return (
                            <div key={preset.id} className="group relative">
                              <button
                                onClick={() => handleApplySavedGradientPreset(preset)}
                                className={cn(
                                  'w-full rounded-xl p-3 border text-left transition-all overflow-hidden relative',
                                  'surface-card surface-card--subtle hover:border-[color-mix(in_srgb,var(--accent-border)_45%,transparent)]',
                                  isActive && 'border-[color-mix(in_srgb,var(--accent-border)_80%,transparent)]'
                                )}
                                style={{ backgroundImage: `linear-gradient(${preset.angle}deg, ${preset.colors.join(', ')})` }}
                              >
                                {isActive && (
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
                                    <div className="absolute inset-[1.5px] rounded-[calc(0.75rem-1.5px)] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 pointer-events-none" />
                                  </>
                                )}
                                <div className="relative flex items-center justify-between gap-2">
                                  <div>
                                    <p className="font-medium text-(--text-strong)">{preset.name}</p>
                                    <p className="text-[11px] text-(--text-soft)">{preset.colors.length}-color blend</p>
                                  </div>
                                  {isActive && <CheckIcon className="w-5 h-5 text-accent" />}
                                </div>
                              </button>
                              <button
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  handleRemoveSavedGradientPreset(preset.id);
                                }}
                                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1 bg-[color-mix(in_srgb,var(--background)_82%,transparent)] border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] text-(--text-soft) hover:text-red-400"
                                aria-label={`Delete saved gradient ${preset.name}`}
                                title="Delete saved gradient"
                              >
                                <XMarkIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-(--text-soft) uppercase tracking-widest">Presets</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {gradientPresets.map((preset) => {
                        const isActive =
                          backgroundConfig.type === 'gradient' &&
                          backgroundConfig.gradientColors?.join(',') === preset.colors.join(',') &&
                          (backgroundConfig.gradientAngle ?? 135) === preset.angle;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => handleApplyGradient(preset)}
                            className={cn(
                              'rounded-xl p-3 border text-left transition-all overflow-hidden relative',
                              'surface-card surface-card--subtle hover:border-[color-mix(in_srgb,var(--accent-border)_45%,transparent)]',
                              isActive && 'border-[color-mix(in_srgb,var(--accent-border)_80%,transparent)]'
                            )}
                            style={{ backgroundImage: `linear-gradient(${preset.angle}deg, ${preset.colors.join(', ')})` }}
                          >
                            {isActive && (
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
                                <div className="absolute inset-[1.5px] rounded-[calc(0.75rem-1.5px)] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 pointer-events-none" />
                              </>
                            )}
                            <div className="relative flex items-center justify-between gap-2">
                              <div>
                                <p className="font-medium text-(--text-strong)">{preset.name}</p>
                                <p className="text-[11px] text-(--text-soft)">{preset.colors.length}-color blend</p>
                              </div>
                              {isActive && <CheckIcon className="w-5 h-5 text-accent" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-(--text-strong)">Wallpaper library</p>
                    <p className="text-xs text-(--text-soft)">Choose a built-in wallpaper or upload your own.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {defaultWallpapers.map((wallpaper) => {
                    const isActive = backgroundConfig.type === 'image' && backgroundConfig.presetWallpaper === wallpaper.url;
                    return (
                      <button
                        key={wallpaper.id}
                        onClick={() => handleSelectPresetWallpaper(wallpaper)}
                        className={cn(
                          'rounded-2xl p-3 border text-left transition-all flex flex-col gap-2 overflow-hidden relative',
                          'surface-card surface-card--subtle hover:border-[color-mix(in_srgb,var(--accent-border)_45%,transparent)]',
                          isActive && 'border-[color-mix(in_srgb,var(--accent-border)_80%,transparent)]'
                        )}
                      >
                        {isActive && (
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
                            <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[color-mix(in_srgb,var(--background-muted)_95%,transparent)] transition-colors duration-300 pointer-events-none" />
                          </>
                        )}
                        <div
                          className="relative h-24 rounded-xl border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]"
                          style={{
                            background: wallpaper.preview,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div className="relative flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-(--text-strong)">{wallpaper.name}</p>
                            <p className="text-[11px] text-(--text-soft)">Built-in</p>
                          </div>
                          {isActive && <CheckIcon className="w-5 h-5 text-accent" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => wallpaperInputRef.current?.click()}
                    className="sidebar-hover-effect group px-4 py-2.5 rounded-xl border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] transition-all flex items-center gap-2 text-(--foreground-soft) group-hover:text-[var(--accent-primary)]"
                    disabled={wallpaperUploading}
                  >
                    <PhotoIcon className="w-5 h-5" />
                    <span>{wallpaperUploading ? 'Uploading…' : 'Upload background'}</span>
                  </button>

                  <button
                    onClick={handleResetBackground}
                    disabled={!hasCustomBackground || wallpaperUploading}
                    className={cn(
                      'sidebar-hover-effect group px-4 py-2.5 rounded-xl border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] transition-all flex items-center gap-2 text-(--foreground-soft) group-hover:text-[var(--accent-primary)]',
                      hasCustomBackground ? '' : 'opacity-60 cursor-not-allowed'
                    )}
                  >
                    <TrashIcon className="w-5 h-5" />
                    <span>Reset background</span>
                  </button>

                  {wallpaperPreview ? (
                    <div className="relative">
                      <Image
                        src={wallpaperPreview}
                        alt="Current wallpaper preview"
                        width={160}
                        height={96}
                        unoptimized
                        className="w-40 h-24 object-cover rounded-2xl border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] shadow-[0_18px_45px_rgba(5,6,11,0.35)]"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-(--text-soft)">Optional: add a custom background image to sit behind the glass UI.</p>
                  )}
                </div>
                <input
                  ref={wallpaperInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleWallpaperUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-(--text-soft) uppercase tracking-wider">Typography</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-(--text-strong)">UI font</p>
                    <span className="text-[11px] text-(--text-soft)">Applied globally</span>
                  </div>
                  <Listbox value={fontConfig.uiFont} onChange={(value) => updateFontConfig({ uiFont: value })}>
                    {({ open }) => (
                      <div className="relative">
                        <ListboxButton
                          className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 border surface-card surface-card--subtle bg-[rgba(5,6,11,0.9)] hover:border-[color-mix(in_srgb,var(--accent-border)_40%,transparent)] focus:border-[color-mix(in_srgb,var(--accent-border)_60%,transparent)] outline-none"
                          aria-label="Select UI font"
                        >
                          <span className="truncate">{availableFonts.find((f) => f.id === fontConfig.uiFont)?.name || 'Select font'}</span>
                          <ChevronDownIcon className="w-4 h-4 ml-2 opacity-60 flex-shrink-0" />
                        </ListboxButton>
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
                            className="absolute mt-2 w-full rounded-2xl focus:outline-none z-[9999] overflow-hidden shadow-[0_26px_70px_rgba(0,0,0,0.75)]"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--background-muted) 50%, transparent)',
                              backdropFilter: 'blur(24px)',
                              WebkitBackdropFilter: 'blur(24px)',
                              border: '1px solid color-mix(in srgb, var(--glass-border) 10%, transparent)',
                            }}
                          >
                            <div className="p-2 relative max-h-60 overflow-y-auto" style={{ color: '#f8fafc' }}>
                              {availableFonts.map((font) => {
                                const isActive = fontConfig.uiFont === font.id;
                                return (
                                  <ListboxOption key={font.id} value={font.id}>
                                    {({ focus }) => (
                                      <div
                                        className={cn(
                                          "group relative w-full flex items-center px-3 py-2.5 rounded-[20px] cursor-pointer text-left transition-all duration-300 ease-out overflow-hidden",
                                          "bg-[color-mix(in_srgb,var(--background)_90%,transparent)]",
                                          isActive && "border border-transparent",
                                          !isActive && focus && "scale-[1.02]"
                                        )}
                                      >
                                        {(isActive || focus) && (
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
                                            className="text-sm font-medium transition-colors duration-300 truncate"
                                            style={{ color: isActive ? 'var(--accent-primary)' : '#f8fafc' }}
                                          >
                                            {font.name}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </ListboxOption>
                                );
                              })}
                            </div>
                          </ListboxOptions>
                        </Transition>
                      </div>
                    )}
                  </Listbox>
                  <p
                    className="text-sm text-(--text-soft)"
                    style={{
                      fontFamily: availableFonts.find((f) => f.id === fontConfig.uiFont)?.value,
                      fontSize: `${fontConfig.bodyFontSize}px`,
                    }}
                  >
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>

                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-(--text-strong)">Code blocks</p>
                    <span className="text-[11px] text-(--text-soft)">Mono font</span>
                  </div>
                  <Listbox value={fontConfig.monoFont} onChange={(value) => updateFontConfig({ monoFont: value })}>
                    {({ open }) => (
                      <div className="relative">
                        <ListboxButton
                          className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 border surface-card surface-card--subtle bg-[rgba(5,6,11,0.9)] hover:border-[color-mix(in_srgb,var(--accent-border)_40%,transparent)] focus:border-[color-mix(in_srgb,var(--accent-border)_60%,transparent)] outline-none"
                          aria-label="Select monospace font for code blocks"
                        >
                          <span className="truncate">{availableMonoFonts.find((f) => f.id === fontConfig.monoFont)?.name || 'Select font'}</span>
                          <ChevronDownIcon className="w-4 h-4 ml-2 opacity-60 flex-shrink-0" />
                        </ListboxButton>
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
                            className="absolute mt-2 w-full rounded-2xl focus:outline-none z-[9999] overflow-hidden shadow-[0_26px_70px_rgba(0,0,0,0.75)]"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--background-muted) 50%, transparent)',
                              backdropFilter: 'blur(24px)',
                              WebkitBackdropFilter: 'blur(24px)',
                              border: '1px solid color-mix(in srgb, var(--glass-border) 10%, transparent)',
                            }}
                          >
                            <div className="p-2 relative max-h-60 overflow-y-auto" style={{ color: '#f8fafc' }}>
                              {availableMonoFonts.map((font) => {
                                const isActive = fontConfig.monoFont === font.id;
                                return (
                                  <ListboxOption key={font.id} value={font.id}>
                                    {({ focus }) => (
                                      <div
                                        className={cn(
                                          "group relative w-full flex items-center px-3 py-2.5 rounded-[20px] cursor-pointer text-left transition-all duration-300 ease-out overflow-hidden",
                                          "bg-[color-mix(in_srgb,var(--background)_90%,transparent)]",
                                          isActive && "border border-transparent",
                                          !isActive && focus && "scale-[1.02]"
                                        )}
                                      >
                                        {(isActive || focus) && (
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
                                            className="text-sm font-medium transition-colors duration-300 truncate"
                                            style={{ color: isActive ? 'var(--accent-primary)' : '#f8fafc' }}
                                          >
                                            {font.name}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </ListboxOption>
                                );
                              })}
                            </div>
                          </ListboxOptions>
                        </Transition>
                      </div>
                    )}
                  </Listbox>
                  <p
                    className="text-sm text-(--text-soft)"
                    style={{
                      fontFamily: availableMonoFonts.find((f) => f.id === fontConfig.monoFont)?.value,
                      fontSize: `${fontConfig.codeFontSize}px`,
                    }}
                  >
                    const accent = [&apos;#f72585&apos;, &apos;#4361ee&apos;];
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-(--text-strong)">UI font size</p>
                    <span className="text-xs font-semibold text-(--text-strong)">{fontConfig.uiFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={20}
                    value={fontConfig.uiFontSize}
                    onChange={(event) => updateFontConfig({ uiFontSize: Number(event.target.value) })}
                    className="glass-range w-full"
                    aria-label="UI font size"
                  />
                  <p className="text-(--text-soft)" style={{ fontSize: `${fontConfig.uiFontSize}px`, fontWeight: 600 }}>
                    Sidebar and top-bar interface labels preview.
                  </p>
                </div>

                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-(--text-strong)">Regular text size</p>
                    <span className="text-xs font-semibold text-(--text-strong)">{fontConfig.bodyFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={20}
                    value={fontConfig.bodyFontSize}
                    onChange={(event) => updateFontConfig({ bodyFontSize: Number(event.target.value) })}
                    className="glass-range w-full"
                    aria-label="Regular text size"
                  />
                  <p className="text-(--text-soft)" style={{ fontSize: `${fontConfig.bodyFontSize}px` }}>
                    This controls regular body text in your board and cards.
                  </p>
                </div>

                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-(--text-strong)">Category header size</p>
                    <span className="text-xs font-semibold text-(--text-strong)">{fontConfig.categoryTitleSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={13}
                    max={28}
                    value={fontConfig.categoryTitleSize}
                    onChange={(event) => updateFontConfig({ categoryTitleSize: Number(event.target.value) })}
                    className="glass-range w-full"
                    aria-label="Category header font size"
                  />
                  <p className="text-(--text-soft) line-clamp-2" style={{ fontSize: `${fontConfig.categoryTitleSize}px` }}>
                    Very Long Category Header Preview Text
                  </p>
                </div>

                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-(--text-strong)">Card title size</p>
                    <span className="text-xs font-semibold text-(--text-strong)">{fontConfig.cardTitleSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={13}
                    max={26}
                    value={fontConfig.cardTitleSize}
                    onChange={(event) => updateFontConfig({ cardTitleSize: Number(event.target.value) })}
                    className="glass-range w-full"
                    aria-label="Card title font size"
                  />
                  <p className="text-(--text-soft) line-clamp-2" style={{ fontSize: `${fontConfig.cardTitleSize}px`, fontWeight: 600 }}>
                    This is a long card title preview that wraps nicely.
                  </p>
                </div>

                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-(--text-strong)">Code text size</p>
                    <span className="text-xs font-semibold text-(--text-strong)">{fontConfig.codeFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={11}
                    max={22}
                    value={fontConfig.codeFontSize}
                    onChange={(event) => updateFontConfig({ codeFontSize: Number(event.target.value) })}
                    className="glass-range w-full"
                    aria-label="Code text size"
                  />
                  <p
                    className="text-(--text-soft)"
                    style={{
                      fontFamily: availableMonoFonts.find((f) => f.id === fontConfig.monoFont)?.value,
                      fontSize: `${fontConfig.codeFontSize}px`,
                    }}
                  >
                    function hello(name) {'{'} return `Hi ${'{'}name{'}'}`; {'}'}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-(--text-strong)">Sidebar width</p>
                    <span className="text-xs font-semibold text-(--text-strong)">{fontConfig.sidebarWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={240}
                    max={460}
                    step={10}
                    value={fontConfig.sidebarWidth}
                    onChange={(event) => updateFontConfig({ sidebarWidth: Number(event.target.value) })}
                    className="glass-range w-full"
                    aria-label="Sidebar width"
                  />
                  <p className="text-xs text-(--text-soft)">
                    Saved in Settings and presets, so it persists across pages and restarts.
                  </p>
                </div>

                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-(--text-strong)">Column width</p>
                    <span className="text-xs font-semibold text-(--text-strong)">{fontConfig.columnWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={260}
                    max={560}
                    step={10}
                    value={fontConfig.columnWidth}
                    onChange={(event) => updateFontConfig({ columnWidth: Number(event.target.value) })}
                    className="glass-range w-full"
                    aria-label="Column width"
                  />
                  <p className="text-xs text-(--text-soft)">
                    Applies to all board columns. You can also drag the right edge of any category column to resize directly.
                  </p>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-(--text-soft) uppercase tracking-wider">Presets</h3>
                  <p className="text-xs text-(--text-soft)">Save everything above as reusable profiles.</p>
                </div>
                <button
                  onClick={() => setIsCreatingPreset((v) => !v)}
                  className="sidebar-hover-effect group px-3 py-2 text-sm rounded-lg border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] transition-all flex items-center gap-2 text-(--foreground-soft) group-hover:text-[var(--accent-primary)]"
                >
                  <PlusIcon className="w-4 h-4" />
                  {isCreatingPreset ? 'Close' : 'Save current as preset'}
                </button>
              </div>

              {isCreatingPreset && (
                <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="preset-name" className="text-xs font-semibold text-(--text-soft) uppercase tracking-widest">Preset name</label>
                    <input
                      id="preset-name"
                      value={newPresetName}
                      onChange={(event) => setNewPresetName(event.target.value)}
                      placeholder="e.g. Focus mode, Presentation"
                      className="w-full rounded-lg px-3 py-2 bg-transparent border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] focus:border-[color-mix(in_srgb,var(--accent-border)_65%,transparent)] outline-none"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleSavePreset}
                      className="px-4 py-2 rounded-lg bg-[color-mix(in_srgb,var(--accent-primary)_85%,transparent)] text-white text-sm font-semibold shadow-[0_12px_35px_color-mix(in_srgb,var(--accent-primary)_38%,transparent)]"
                    >
                      Save preset
                    </button>
                    <button
                      onClick={() => {
                        setNewPresetName('');
                        setIsCreatingPreset(false);
                      }}
                      className="px-4 py-2 rounded-lg surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {settingsPresets.length === 0 ? (
                <p className="text-xs text-(--text-soft)">No presets yet. Save your current layout, colors, fonts, typography sizes, sidebar and column widths, and wallpaper to reuse later.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {settingsPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="rounded-2xl p-4 border surface-card surface-card--subtle border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-(--text-strong)">{preset.name}</p>
                          <p className="text-[11px] text-(--text-soft)">Saved {new Date(preset.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadPreset(preset.id)}
                            className="px-3 py-1.5 rounded-lg bg-[color-mix(in_srgb,var(--accent-primary)_85%,transparent)] text-white text-xs shadow-[0_10px_25px_color-mix(in_srgb,var(--accent-primary)_30%,transparent)]"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => deletePreset(preset.id)}
                            className="px-3 py-1.5 rounded-lg surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] text-xs hover:border-[color-mix(in_srgb,var(--accent-border)_45%,transparent)]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-(--text-soft)">
                        <span className="px-2 py-1 rounded-full border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]">Mode: {preset.mode}</span>
                        <span className="px-2 py-1 rounded-full border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]">Accent: {preset.accentThemeId}</span>
                        <span className="px-2 py-1 rounded-full border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]">Font: {preset.fonts.uiFont}</span>
                        <span className="px-2 py-1 rounded-full border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]">UI: {preset.fonts.uiFontSize ?? 14}px</span>
                        <span className="px-2 py-1 rounded-full border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]">Sidebar: {preset.fonts.sidebarWidth ?? 240}px</span>
                        <span className="px-2 py-1 rounded-full border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]">Columns: {preset.fonts.columnWidth ?? 320}px</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="glass glass--dense rounded-3xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-(--text-strong)">💾 Data Management</h2>
            <p className="text-sm text-(--text-soft)">Backup, restore, or reset your data</p>
          </div>

          <div className="grid gap-4">
            <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4">
              <ExportImport />
            </div>

            <div className="surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] rounded-2xl p-4 space-y-3">
              <div>
                <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
                <p className="text-xs text-(--text-soft)">
                  Permanently delete all cards, tags, and categories.
                </p>
              </div>
              {showDeleteConfirm ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-red-400">Are you absolutely sure?</p>
                  <p className="text-xs text-(--text-soft)">
                    This action cannot be undone. All stored content will be permanently removed.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleClearAllData}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium shadow-[0_16px_40px_rgba(239,68,68,0.35)] hover:shadow-[0_20px_50px_rgba(239,68,68,0.45)] transition-all"
                    >
                      Yes, delete everything
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-lg surface-card surface-card--subtle border border-[color-mix(in_srgb,var(--card-border)_80%,transparent)] hover:border-[color-mix(in_srgb,var(--accent-border)_45%,transparent)] text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <TrashIcon className="w-5 h-5" />
                  Clear All Data
                </button>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        <section className="glass glass--dense rounded-3xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-(--text-strong)">ℹ️ About ByteBox</h2>
          <div className="grid gap-3 text-sm text-(--text-soft)">
            <div className="flex justify-between border-b border-[color-mix(in_srgb,var(--card-border)_70%,transparent)] pb-2">
              <span>Version</span>
              <span className="text-(--text-strong)">2.0.0</span>
            </div>
            <div className="flex justify-between border-b border-[color-mix(in_srgb,var(--card-border)_70%,transparent)] pb-2">
              <span>Built with</span>
              <span className="text-(--text-strong)">Next.js&nbsp;16 + React&nbsp;19</span>
            </div>
            <div className="flex justify-between border-b border-[color-mix(in_srgb,var(--card-border)_70%,transparent)] pb-2">
              <span>License</span>
              <span className="text-(--text-strong)">Apache 2.0</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[color-mix(in_srgb,var(--card-border)_70%,transparent)] space-y-2 text-sm text-(--text-soft)">
            <a
              href="https://github.com/pinkpixel-dev/bytebox"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              View on GitHub
            </a>
            <a
              href="https://github.com/pinkpixel-dev/bytebox/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Report a bug
            </a>
            <a
              href="https://buymeacoffee.com/pinkpixel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Buy me a coffee
            </a>
          </div>
        </section>

        <div className="text-center text-sm text-(--text-soft) py-6">
          <p>Dream it, Pixel it ✨</p>
        </div>
      </div>
    </AppLayout>
  );
}
