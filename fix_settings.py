import re

with open('src/app/settings/page.tsx', 'r') as f:
    content = f.read()

# 1. Add Headless UI imports
if '@headlessui/react' not in content:
    content = content.replace("import { cn } from '@/lib/utils';", "import { cn } from '@/lib/utils';\nimport { Listbox, ListboxButton, ListboxOptions, ListboxOption, Transition } from '@headlessui/react';")

# 2. Add ChevronDownIcon to Heroicons import
if 'ChevronDownIcon' not in content:
    content = content.replace('SwatchIcon,', 'SwatchIcon,\n  ChevronDownIcon,')

# 3. Add Fragment to react import
if 'Fragment' not in content:
    content = content.replace('useState }', 'useState, Fragment }')

# 4. Replace uiFont select
ui_font_select = '''                  <select
                    value={fontConfig.uiFont}
                    onChange={(event) => updateFontConfig({ uiFont: event.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 border surface-card surface-card--subtle bg-[rgba(5,6,11,0.9)] hover:border-[color-mix(in_srgb,var(--accent-border)_40%,transparent)] focus:border-[color-mix(in_srgb,var(--accent-border)_60%,transparent)] outline-none"
                    aria-label="Select UI font"
                  >
                    {availableFonts.map((font) => (
                      <option key={font.id} value={font.id} className="bg-[color-mix(in_srgb,var(--background)_90%,#000_10%)]">
                        {font.name}
                      </option>
                    ))}
                  </select>'''

ui_font_listbox = '''                  <Listbox value={fontConfig.uiFont} onChange={(value) => updateFontConfig({ uiFont: value })}>
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
                  </Listbox>'''

content = content.replace(ui_font_select, ui_font_listbox)

# 5. Replace monoFont select
mono_font_select = '''                  <select
                    value={fontConfig.monoFont}
                    onChange={(event) => updateFontConfig({ monoFont: event.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 border surface-card surface-card--subtle bg-[rgba(5,6,11,0.9)] hover:border-[color-mix(in_srgb,var(--accent-border)_40%,transparent)] focus:border-[color-mix(in_srgb,var(--accent-border)_60%,transparent)] outline-none"
                    aria-label="Select monospace font for code blocks"
                  >
                    {availableMonoFonts.map((font) => (
                      <option key={font.id} value={font.id} className="bg-[color-mix(in_srgb,var(--background)_90%,#000_10%)]">
                        {font.name}
                      </option>
                    ))}
                  </select>'''

mono_font_listbox = '''                  <Listbox value={fontConfig.monoFont} onChange={(value) => updateFontConfig({ monoFont: value })}>
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
                  </Listbox>'''

content = content.replace(mono_font_select, mono_font_listbox)

with open('src/app/settings/page.tsx', 'w') as f:
    f.write(content)
