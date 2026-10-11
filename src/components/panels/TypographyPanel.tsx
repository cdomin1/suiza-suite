import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  CaseUpper,
  CaseLower,
  Search,
  Plus,
  Layers,
  Check,
  Eye,
  Sliders,
  Sparkles,
  Palette,
  ChevronDown,
  LayoutGrid,
  List,
} from 'lucide-react';

export const FONT_FAMILIES = [
  // Modern Sans-serif
  { name: 'Plus Jakarta Sans', category: 'Sans', font: 'Plus Jakarta Sans, sans-serif', preview: 'Modern Swiss Geometric' },
  { name: 'Inter', category: 'Sans', font: 'Inter, sans-serif', preview: 'Clean & Legible Neo-Grotesque' },
  { name: 'Roboto', category: 'Sans', font: 'Roboto, sans-serif', preview: 'Friendly Mechanical Curves' },
  { name: 'Montserrat', category: 'Sans', font: 'Montserrat, sans-serif', preview: 'Classic Urban Typography' },
  { name: 'Outfit', category: 'Sans', font: 'Outfit, sans-serif', preview: 'Contemporary Brand Geometry' },
  { name: 'Open Sans', category: 'Sans', font: 'Open Sans, sans-serif', preview: 'Neutral Humanist Sans' },
  { name: 'Helvetica Neue', category: 'Sans', font: '"Helvetica Neue", Arial, sans-serif', preview: 'Mid-Century Modernist Archetype' },

  // Editorial & Traditional Serif
  { name: 'Playfair Display', category: 'Serif', font: '"Playfair Display", Georgia, serif', preview: 'High-Fashion Editorial Headline' },
  { name: 'Merriweather', category: 'Serif', font: 'Merriweather, Georgia, serif', preview: 'Pleasant Editorial Reading' },
  { name: 'Georgia', category: 'Serif', font: 'Georgia, serif', preview: 'Sturdy Elegant Bookface' },
  { name: 'Cinzel', category: 'Serif', font: 'Cinzel, Georgia, serif', preview: 'Classical Inscriptional Capitals' },
  { name: 'Lora', category: 'Serif', font: 'Lora, serif', preview: 'Contemporary Literary Serif' },
  { name: 'Garamond', category: 'Serif', font: 'Garamond, serif', preview: 'Renaissance Typography Masterpiece' },

  // Monospace & Engineering
  { name: 'JetBrains Mono', category: 'Mono', font: '"JetBrains Mono", monospace', preview: 'Precision Engineering Code' },
  { name: 'Fira Code', category: 'Mono', font: '"Fira Code", monospace', preview: 'Modern Monospaced Glyphs' },
  { name: 'Courier Prime', category: 'Mono', font: '"Courier Prime", Courier, monospace', preview: 'Screenplay Typewriter Classic' },

  // Display & Headers
  { name: 'Oswald', category: 'Display', font: 'Oswald, sans-serif', preview: 'Condensed High-Impact Headline' },
  { name: 'Bebas Neue', category: 'Display', font: '"Bebas Neue", sans-serif', preview: 'Bold All-Caps Poster Punch' },
  { name: 'Impact', category: 'Display', font: 'Impact, sans-serif', preview: 'Max-Weight Heavy Industrial' },

  // Script & Decorative
  { name: 'Dancing Script', category: 'Script', font: '"Dancing Script", cursive', preview: 'Bouncy Hand-Lettered Script' },
  { name: 'Pacifico', category: 'Script', font: 'Pacifico, cursive', preview: 'Retro Surf Brush Cursive' },
];

const FONT_WEIGHTS = [
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'SemiBold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Black', value: '900' },
];

const PRESET_SIZES = [10, 12, 14, 16, 18, 24, 32, 48, 64, 72, 96, 120];

const COLOR_PRESETS = [
  '#0f172a', '#ffffff', '#0d99ff', '#38bdf8', '#ec4899', '#f59e0b',
  '#10b981', '#6366f1', '#e11d48', '#8b5cf6', '#000000', '#64748b',
];

export const TypographyPanel: React.FC = () => {
  const {
    persona,
    theme,
    project,
    setProject,
    selectedLayer,
    vectorShapes,
    setVectorShapes,
    selectedShapeIds,
    setSelectedShapeIds,
    updateSelectedVectorShapes,
    publishFrames,
    setPublishFrames,
    selectedFrameIds,
    setSelectedFrameIds,
    updateSelectedPublishFrames,
    toolOptions,
    setToolOption,
    pushHistoryStep,
    showShortcutFeedback,
  } = useStudio();

  // Sub-tab view: 'character' | 'specimens' | 'layers'
  const [panelView, setPanelView] = useState<'character' | 'specimens' | 'layers'>('character');

  // Search and Category filters for fonts
  const [fontSearch, setFontSearch] = useState('');
  const [fontCategory, setFontCategory] = useState<'all' | 'Sans' | 'Serif' | 'Mono' | 'Display' | 'Script'>('all');

  // Find active text object across personas
  const activeVectorText = vectorShapes.find(s => selectedShapeIds.includes(s.id) && s.type === 'text');
  const activePhotoText = selectedLayer && selectedLayer.type === 'text' ? selectedLayer : null;
  const activePublishText = publishFrames.find(f => selectedFrameIds.includes(f.id) && f.type === 'text');

  // All text elements in current persona for quick selection
  const allVectorTexts = vectorShapes.filter(s => s.type === 'text');
  const allPhotoTexts = project.layers.filter(l => l.type === 'text');
  const allPublishTexts = publishFrames.filter(f => f.type === 'text');

  // Resolve current active typography values
  const currentFontFamily =
    persona === 'vector'
      ? activeVectorText?.fontFamily || toolOptions.fontFamily || 'Plus Jakarta Sans'
      : persona === 'publish'
      ? activePublishText?.fontFamily || toolOptions.fontFamily || 'Plus Jakarta Sans'
      : activePhotoText?.textFontFamily || toolOptions.fontFamily || 'Plus Jakarta Sans';

  const currentFontSize =
    persona === 'vector'
      ? activeVectorText?.fontSize || toolOptions.fontSize || 36
      : persona === 'publish'
      ? activePublishText?.fontSize || toolOptions.fontSize || 36
      : activePhotoText?.textFontSize || toolOptions.fontSize || 36;

  const currentFontWeight =
    persona === 'vector'
      ? activeVectorText?.fontWeight || toolOptions.fontWeight || '700'
      : persona === 'publish'
      ? '400'
      : activePhotoText?.textFontWeight || toolOptions.fontWeight || '400';

  const isItalic =
    persona === 'vector'
      ? activeVectorText?.fontStyle === 'italic'
      : persona === 'photo'
      ? activePhotoText?.fontStyle === 'italic'
      : false;

  const currentTextColor =
    persona === 'vector'
      ? activeVectorText?.fill || '#0f172a'
      : persona === 'publish'
      ? activePublishText?.fill || '#0f172a'
      : activePhotoText?.textColor || (theme.isLight ? '#0f172a' : '#ffffff');

  const currentTextContent =
    persona === 'vector'
      ? activeVectorText?.text || ''
      : persona === 'publish'
      ? activePublishText?.content || activePublishText?.title || ''
      : activePhotoText?.textContent || '';

  const currentLetterSpacing =
    persona === 'vector'
      ? activeVectorText?.letterSpacing || 0
      : persona === 'publish'
      ? activePublishText?.tracking || 0
      : activePhotoText?.textLetterSpacing || 0;

  const currentLineHeight =
    persona === 'vector'
      ? activeVectorText?.lineHeight || 1.25
      : persona === 'publish'
      ? activePublishText?.leading || 1.25
      : activePhotoText?.textLineHeight || 1.25;

  const currentTextAlign =
    persona === 'vector'
      ? activeVectorText?.textAlign || 'left'
      : persona === 'publish'
      ? activePublishText?.align || 'left'
      : activePhotoText?.textAlign || 'left';

  // Apply Font Family
  const handleSetFontFamily = (fontName: string) => {
    setToolOption('fontFamily', fontName);

    if (persona === 'vector') {
      if (activeVectorText) {
        updateSelectedVectorShapes({ fontFamily: fontName });
        pushHistoryStep(`Change Font: ${fontName}`);
      }
    } else if (persona === 'publish') {
      if (activePublishText) {
        updateSelectedPublishFrames({ fontFamily: fontName });
        pushHistoryStep(`Change Font: ${fontName}`);
      }
    } else if (persona === 'photo') {
      if (activePhotoText) {
        setProject(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === activePhotoText.id ? { ...l, textFontFamily: fontName } : l),
          updatedAt: Date.now(),
        }));
        pushHistoryStep(`Change Font: ${fontName}`);
      }
    }
    showShortcutFeedback(`Font: ${fontName}`);
  };

  // Apply Font Size
  const handleSetFontSize = (size: number) => {
    const s = Math.max(6, Math.min(256, size));
    setToolOption('fontSize', s);

    if (persona === 'vector') {
      if (activeVectorText) {
        updateSelectedVectorShapes({ fontSize: s, height: Math.max(activeVectorText.height, s * 1.4) });
      }
    } else if (persona === 'publish') {
      if (activePublishText) {
        updateSelectedPublishFrames({ fontSize: s });
      }
    } else if (persona === 'photo') {
      if (activePhotoText) {
        setProject(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === activePhotoText.id ? { ...l, textFontSize: s } : l),
          updatedAt: Date.now(),
        }));
      }
    }
  };

  // Apply Font Weight
  const handleSetFontWeight = (weight: string) => {
    setToolOption('fontWeight', weight);
    if (persona === 'vector') {
      if (activeVectorText) {
        updateSelectedVectorShapes({ fontWeight: weight });
        pushHistoryStep(`Set Weight: ${weight}`);
      }
    } else if (persona === 'photo') {
      if (activePhotoText) {
        setProject(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === activePhotoText.id ? { ...l, textFontWeight: weight } : l),
          updatedAt: Date.now(),
        }));
        pushHistoryStep(`Set Weight: ${weight}`);
      }
    }
  };

  // Toggle Italic
  const handleToggleItalic = () => {
    const nextStyle = isItalic ? 'normal' : 'italic';
    if (persona === 'vector') {
      if (activeVectorText) {
        updateSelectedVectorShapes({ fontStyle: nextStyle });
        pushHistoryStep(nextStyle === 'italic' ? 'Set Italic' : 'Remove Italic');
      }
    } else if (persona === 'photo') {
      if (activePhotoText) {
        setProject(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === activePhotoText.id ? { ...l, fontStyle: nextStyle } : l),
          updatedAt: Date.now(),
        }));
        pushHistoryStep(nextStyle === 'italic' ? 'Set Italic' : 'Remove Italic');
      }
    }
  };

  // Apply Color
  const handleSetTextColor = (color: string) => {
    setToolOption('textColor', color);

    if (persona === 'vector') {
      if (activeVectorText) {
        updateSelectedVectorShapes({ fill: color });
        pushHistoryStep(`Text Color: ${color}`);
      }
    } else if (persona === 'publish') {
      if (activePublishText) {
        updateSelectedPublishFrames({ fill: color });
        pushHistoryStep(`Text Color: ${color}`);
      }
    } else if (persona === 'photo') {
      if (activePhotoText) {
        setProject(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === activePhotoText.id ? { ...l, textColor: color } : l),
          updatedAt: Date.now(),
        }));
        pushHistoryStep(`Text Color: ${color}`);
      }
    }
  };

  // Apply Text Content
  const handleSetTextContent = (text: string) => {
    if (persona === 'vector') {
      if (activeVectorText) {
        updateSelectedVectorShapes({ text });
      }
    } else if (persona === 'publish') {
      if (activePublishText) {
        updateSelectedPublishFrames({ content: text, title: text });
      }
    } else if (persona === 'photo') {
      if (activePhotoText) {
        setProject(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === activePhotoText.id ? { ...l, textContent: text } : l),
          updatedAt: Date.now(),
        }));
      }
    }
  };

  // Apply Text Alignment
  const handleSetAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (persona === 'vector') {
      if (activeVectorText) {
        updateSelectedVectorShapes({ textAlign: align === 'justify' ? 'left' : align });
      }
    } else if (persona === 'publish') {
      if (activePublishText) {
        updateSelectedPublishFrames({ align });
      }
    } else if (persona === 'photo') {
      if (activePhotoText) {
        setProject(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === activePhotoText.id ? { ...l, textAlign: align === 'justify' ? 'left' : align } : l),
          updatedAt: Date.now(),
        }));
      }
    }
    showShortcutFeedback(`Align: ${align}`);
  };

  // Create New Text Element
  const handleCreateNewText = () => {
    const textSample = persona === 'vector' ? 'Vector Typography' : persona === 'photo' ? 'Photo Typo Layer' : 'Editorial Spread Headline';
    if (persona === 'vector') {
      const newShape = {
        id: `v-text-${Date.now()}`,
        name: `Type: ${currentFontFamily}`,
        type: 'text' as const,
        x: 100,
        y: 150,
        width: 320,
        height: (currentFontSize || 36) * 1.5,
        fill: currentTextColor || '#0f172a',
        stroke: 'none',
        strokeWidth: 0,
        text: textSample,
        fontSize: currentFontSize || 36,
        fontFamily: currentFontFamily || 'Plus Jakarta Sans',
        fontWeight: currentFontWeight || '700',
      };
      setVectorShapes(prev => [...prev, newShape]);
      setSelectedShapeIds([newShape.id]);
      pushHistoryStep(`Create Vector Text (${currentFontFamily})`);
      showShortcutFeedback(`Created Vector Text Object`);
    } else if (persona === 'publish') {
      const newFrame = {
        id: `pub-frame-${Date.now()}`,
        name: `Frame: ${currentFontFamily}`,
        type: 'text' as const,
        x: 100,
        y: 100,
        width: 400,
        height: 120,
        title: 'Headline Title',
        content: 'Editorial body paragraph styled with modern Suisse typography system.',
        fontFamily: currentFontFamily || 'Plus Jakarta Sans',
        fontSize: currentFontSize || 24,
      };
      setPublishFrames(prev => [...prev, newFrame]);
      setSelectedFrameIds([newFrame.id]);
      pushHistoryStep(`Create Text Frame (${currentFontFamily})`);
      showShortcutFeedback(`Created Publication Text Frame`);
    } else {
      const newLayerId = `layer-text-${Date.now()}`;
      setProject(prev => ({
        ...prev,
        layers: [
          ...prev.layers,
          {
            id: newLayerId,
            name: `Type (${currentFontFamily})`,
            type: 'text',
            visible: true,
            locked: false,
            opacity: 100,
            blendMode: 'normal',
            textContent: textSample,
            textFontSize: currentFontSize || 44,
            textFontFamily: currentFontFamily || 'Plus Jakarta Sans',
            textFontWeight: currentFontWeight || '700',
            textColor: currentTextColor || (theme.isLight ? '#0f172a' : '#ffffff'),
            x: 120,
            y: 180,
          }
        ],
        selectedLayerId: newLayerId,
      }));
      pushHistoryStep(`Create Text Layer (${currentFontFamily})`);
      showShortcutFeedback(`Created Photo Text Layer`);
    }
  };

  // Filtered fonts
  const filteredFonts = FONT_FAMILIES.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(fontSearch.toLowerCase());
    const matchesCategory = fontCategory === 'all' || f.category === fontCategory;
    return matchesSearch && matchesCategory;
  });

  const hasActiveText = Boolean(activeVectorText || activePhotoText || activePublishText);
  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.25)';
  const inputBg = theme.isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.4)';

  return (
    <div className="flex flex-col h-full text-xs select-none overflow-y-auto scrollbar-thin p-3 space-y-3.5">
      {/* Header with View Tabs */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-1.5 font-bold" style={{ color: theme.textPrimary }}>
          <Type className="w-4 h-4 text-sky-500" />
          <span>Character & Fonts</span>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPanelView('character')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
              panelView === 'character' ? 'bg-[#0d99ff] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70'
            }`}
            title="Character Properties"
          >
            Character
          </button>
          <button
            onClick={() => setPanelView('specimens')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-0.5 ${
              panelView === 'specimens' ? 'bg-[#0d99ff] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70'
            }`}
            title="Browse All Font Specimens with Live Preview"
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Fonts ({FONT_FAMILIES.length})</span>
          </button>
          <button
            onClick={handleCreateNewText}
            className="px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 bg-[#0d99ff] text-white hover:bg-sky-500 transition-colors shadow-xs ml-1"
            title="Create Text with selected Font"
          >
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Target Status Banner */}
      <div
        className="px-2.5 py-1.5 rounded border flex flex-col gap-1 text-[11px]"
        style={{
          backgroundColor: boxBg,
          borderColor: hasActiveText ? theme.accent : theme.border,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold truncate" style={{ color: theme.textPrimary }}>
            {persona === 'vector'
              ? activeVectorText
                ? `Editing: "${activeVectorText.text?.slice(0, 20) || 'Vector Typography'}"`
                : 'No vector text selected'
              : persona === 'publish'
              ? activePublishText
                ? `Editing: ${activePublishText.title || 'Frame Text'}`
                : 'No text frame selected'
              : activePhotoText
              ? `Editing: ${activePhotoText.name}`
              : 'No photo text layer selected'}
          </span>
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider shrink-0"
            style={{
              backgroundColor: hasActiveText ? '#0d99ff' : 'rgba(0,0,0,0.25)',
              color: '#ffffff',
            }}
          >
            {persona}
          </span>
        </div>

        {/* Quick select helpers when no active text */}
        {!hasActiveText && (
          <div className="pt-1 border-t flex items-center justify-between gap-1" style={{ borderColor: theme.border }}>
            <span className="text-[10px]" style={{ color: theme.textMuted }}>
              {persona === 'vector' && allVectorTexts.length > 0
                ? `${allVectorTexts.length} vector text object(s) available:`
                : persona === 'photo' && allPhotoTexts.length > 0
                ? `${allPhotoTexts.length} text layer(s) available:`
                : 'Create new text to apply styles:'}
            </span>
            <div className="flex items-center gap-1">
              {persona === 'vector' && allVectorTexts.length > 0 && (
                <button
                  onClick={() => setSelectedShapeIds([allVectorTexts[0].id])}
                  className="px-1.5 py-0.5 rounded border text-[10px] font-semibold text-sky-500 hover:bg-[#0d99ff] hover:text-white transition-colors"
                  style={{ borderColor: theme.borderStrong }}
                >
                  Select "{allVectorTexts[0].text?.slice(0, 10) || 'Text'}..."
                </button>
              )}
              {persona === 'photo' && allPhotoTexts.length > 0 && (
                <button
                  onClick={() => setProject(p => ({ ...p, selectedLayerId: allPhotoTexts[0].id }))}
                  className="px-1.5 py-0.5 rounded border text-[10px] font-semibold text-sky-500 hover:bg-[#0d99ff] hover:text-white transition-colors"
                  style={{ borderColor: theme.borderStrong }}
                >
                  Select "{allPhotoTexts[0].name}"
                </button>
              )}
              <button
                onClick={handleCreateNewText}
                className="px-1.5 py-0.5 rounded border text-[10px] font-semibold text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                style={{ borderColor: theme.borderStrong }}
              >
                + Place Text
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          VIEW MODE 1: FONT SPECIMEN BROWSER
          ===================================================================== */}
      {panelView === 'specimens' ? (
        <div className="space-y-2">
          {/* Search & Category Filter */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2 top-2 opacity-50 pointer-events-none" />
              <input
                type="text"
                value={fontSearch}
                onChange={e => setFontSearch(e.target.value)}
                placeholder="Search typefaces..."
                className="w-full pl-7 pr-2 py-1 rounded border text-xs focus:outline-none focus:border-[#0d99ff]"
                style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {(['all', 'Sans', 'Serif', 'Mono', 'Display', 'Script'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFontCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 transition-colors ${
                  fontCategory === cat
                    ? 'bg-[#0d99ff] text-white font-bold'
                    : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70 border'
                }`}
                style={{ borderColor: theme.border }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Typeface Specimen Cards */}
          <div className="space-y-1.5 max-h-[460px] overflow-y-auto scrollbar-thin pr-1">
            {filteredFonts.map(f => {
              const isSelected = currentFontFamily === f.name;
              return (
                <div
                  key={f.name}
                  onClick={() => handleSetFontFamily(f.name)}
                  className={`p-2.5 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#0d99ff] bg-[#0d99ff]/10 shadow-xs'
                      : 'hover:border-slate-400 dark:hover:border-neutral-600'
                  }`}
                  style={{
                    backgroundColor: isSelected ? undefined : boxBg,
                    borderColor: isSelected ? '#0d99ff' : theme.border,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>
                        {f.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-mono tracking-wider opacity-60 bg-black/10 dark:bg-white/10">
                        {f.category}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-sky-500 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  {/* Live Specimen Preview */}
                  <div
                    className="text-base truncate pt-0.5"
                    style={{
                      fontFamily: f.font,
                      color: isSelected ? theme.accent : theme.textPrimary,
                    }}
                  >
                    {f.preview}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* =====================================================================
            VIEW MODE 2: CHARACTER INSPECTOR & LIVE CONTROLS
            ===================================================================== */
        <div className="space-y-3.5">
          {/* 1. Font Family Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                Font Family
              </label>
              <button
                onClick={() => setPanelView('specimens')}
                className="text-[10px] text-sky-500 font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Browse Library ({FONT_FAMILIES.length})</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Quick searchable font select */}
            <select
              value={currentFontFamily}
              onChange={e => handleSetFontFamily(e.target.value)}
              className="w-full px-2.5 py-2 rounded border text-sm font-semibold focus:outline-none focus:border-[#0d99ff] cursor-pointer"
              style={{
                backgroundColor: inputBg,
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
                fontFamily: currentFontFamily,
              }}
            >
              <optgroup label="Modern Sans-Serif">
                {FONT_FAMILIES.filter(f => f.category === 'Sans').map(f => (
                  <option key={f.name} value={f.name} style={{ fontFamily: f.font }}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Editorial Serif">
                {FONT_FAMILIES.filter(f => f.category === 'Serif').map(f => (
                  <option key={f.name} value={f.name} style={{ fontFamily: f.font }}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Monospace & Engineering">
                {FONT_FAMILIES.filter(f => f.category === 'Mono').map(f => (
                  <option key={f.name} value={f.name} style={{ fontFamily: f.font }}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Display & Headline">
                {FONT_FAMILIES.filter(f => f.category === 'Display').map(f => (
                  <option key={f.name} value={f.name} style={{ fontFamily: f.font }}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Script & Cursive">
                {FONT_FAMILIES.filter(f => f.category === 'Script').map(f => (
                  <option key={f.name} value={f.name} style={{ fontFamily: f.font }}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 2. Font Size & Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                Font Size (pt / px)
              </label>
              <span className="font-mono text-xs font-bold text-sky-500">
                {currentFontSize} pt
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="8"
                max="144"
                value={currentFontSize}
                onChange={e => handleSetFontSize(parseInt(e.target.value) || 12)}
                className="flex-1 accent-[#0d99ff]"
              />
              <input
                type="number"
                min="6"
                max="256"
                value={currentFontSize}
                onChange={e => handleSetFontSize(parseInt(e.target.value) || 12)}
                className="w-14 px-1.5 py-1 rounded border text-xs font-mono font-bold text-center"
                style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              />
            </div>

            {/* Quick Size Chips */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              {PRESET_SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => handleSetFontSize(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 transition-colors ${
                    currentFontSize === s
                      ? 'bg-[#0d99ff] text-white font-bold'
                      : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-75 border'
                  }`}
                  style={{ borderColor: theme.border }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Weight & Style Formatting */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-75 block mb-1">
                Weight
              </label>
              <select
                value={currentFontWeight}
                onChange={e => handleSetFontWeight(e.target.value)}
                className="w-full px-2 py-1.5 rounded border text-xs font-medium cursor-pointer"
                style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              >
                {FONT_WEIGHTS.map(w => (
                  <option key={w.value} value={w.value}>
                    {w.label} ({w.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Tracking (Letter Spacing) */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-75 block mb-1">
                Tracking (Spacing)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="-5"
                  max="25"
                  value={currentLetterSpacing}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 0;
                    if (persona === 'vector' && activeVectorText) updateSelectedVectorShapes({ letterSpacing: val });
                    else if (persona === 'photo' && activePhotoText) {
                      setProject(p => ({
                        ...p,
                        layers: p.layers.map(l => l.id === activePhotoText.id ? { ...l, textLetterSpacing: val } : l)
                      }));
                    }
                  }}
                  className="w-full px-2 py-1.5 rounded border text-xs font-mono font-bold text-center"
                  style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                />
                <span className="text-[10px] opacity-60">px</span>
              </div>
            </div>
          </div>

          {/* 4. Alignment & Quick Format Action Toolbar */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
              Alignment & Styling
            </label>
            <div className="flex items-center justify-between gap-1 p-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
              {/* Align Left */}
              <button
                onClick={() => handleSetAlignment('left')}
                className={`p-1.5 rounded transition-colors ${currentTextAlign === 'left' ? 'bg-[#0d99ff] text-white shadow-xs' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              {/* Align Center */}
              <button
                onClick={() => handleSetAlignment('center')}
                className={`p-1.5 rounded transition-colors ${currentTextAlign === 'center' ? 'bg-[#0d99ff] text-white shadow-xs' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}
                title="Align Center"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              {/* Align Right */}
              <button
                onClick={() => handleSetAlignment('right')}
                className={`p-1.5 rounded transition-colors ${currentTextAlign === 'right' ? 'bg-[#0d99ff] text-white shadow-xs' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              {/* Align Justify */}
              <button
                onClick={() => handleSetAlignment('justify')}
                className={`p-1.5 rounded transition-colors ${currentTextAlign === 'justify' ? 'bg-[#0d99ff] text-white shadow-xs' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}
                title="Justify"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-slate-300 dark:bg-neutral-700 mx-0.5" />

              {/* Bold Toggle */}
              <button
                onClick={() => handleSetFontWeight(currentFontWeight === 'bold' || currentFontWeight === '700' ? '400' : '700')}
                className={`p-1.5 rounded font-bold transition-colors ${currentFontWeight === '700' || currentFontWeight === 'bold' ? 'bg-[#0d99ff] text-white shadow-xs' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}
                title="Toggle Bold (700)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              {/* Italic Toggle */}
              <button
                onClick={handleToggleItalic}
                className={`p-1.5 rounded font-bold transition-colors ${isItalic ? 'bg-[#0d99ff] text-white shadow-xs' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}
                title="Toggle Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              {/* Quick Uppercase Toggle */}
              <button
                onClick={() => {
                  const uppercase = currentTextContent.toUpperCase();
                  handleSetTextContent(uppercase);
                  showShortcutFeedback('ALL CAPS');
                }}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Convert to UPPERCASE"
              >
                <CaseUpper className="w-3.5 h-3.5" />
              </button>

              {/* Quick Lowercase Toggle */}
              <button
                onClick={() => {
                  const lower = currentTextContent.toLowerCase();
                  handleSetTextContent(lower);
                  showShortcutFeedback('lowercase');
                }}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Convert to lowercase"
              >
                <CaseLower className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 5. Type Color Palette */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                Type Color ({persona === 'vector' ? 'Fill' : 'Foreground'})
              </label>
              <span className="font-mono text-xs font-bold" style={{ color: currentTextColor }}>
                {currentTextColor}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentTextColor.startsWith('#') ? currentTextColor : '#0f172a'}
                onChange={e => handleSetTextColor(e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer shrink-0"
              />
              <div className="flex items-center gap-1 flex-wrap flex-1">
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => handleSetTextColor(c)}
                    className={`w-5 h-5 rounded-sm border shadow-xs transition-transform hover:scale-110 ${
                      currentTextColor === c ? 'ring-2 ring-[#0d99ff]' : ''
                    }`}
                    style={{ backgroundColor: c, borderColor: theme.isLight ? '#cbd5e1' : '#475569' }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 6. Live Text String Editor */}
          <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                Text Content String
              </label>
              {hasActiveText && (
                <span className="text-[10px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Live Synced
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={currentTextContent}
              onChange={e => handleSetTextContent(e.target.value)}
              placeholder="Click canvas or press 'New' above to type here..."
              className="w-full px-2.5 py-2 rounded border text-xs font-medium focus:outline-none focus:border-[#0d99ff] resize-none"
              style={{
                backgroundColor: inputBg,
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
                fontFamily: currentFontFamily,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
