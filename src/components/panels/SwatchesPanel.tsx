import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { ColorSwatch, SwatchPalette } from '../../types';
import {
  Palette,
  Plus,
  Droplets,
  Check,
  Sparkles,
  Trash2,
  FolderPlus,
  Search,
  Star,
  Copy,
  ChevronDown,
  ChevronRight,
  Sliders,
  RotateCcw,
  Edit2,
  X,
  Pipette,
} from 'lucide-react';

export const SwatchesPanel: React.FC = () => {
  const {
    theme,
    persona,
    palettes,
    addSwatch,
    removeSwatch,
    createPalette,
    deletePalette,
    applySwatchToSelection,
    vectorFill,
    vectorStroke,
    foregroundColor,
    selectedLayer,
    vectorShapes,
    selectedShapeIds,
    publishFrames,
    selectedFrameIds,
    showShortcutFeedback,
    pushHistoryStep,
  } = useStudio();

  // Active target to color: Fill, Stroke, or Text
  const [activeTarget, setActiveTarget] = useState<'fill' | 'stroke' | 'text'>('fill');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Expanded Palettes state
  const [expandedPalettes, setExpandedPalettes] = useState<Record<string, boolean>>({
    'palette-core': true,
    'palette-pantone': true,
    'palette-modern-ui': true,
    'palette-gradients': true,
  });

  // Modal / Add Swatch State
  const [showAddSwatchModal, setShowAddSwatchModal] = useState(false);
  const [targetPaletteId, setTargetPaletteId] = useState<string>('palette-core');
  const [newSwatchName, setNewSwatchName] = useState('');
  const [newSwatchColor, setNewSwatchColor] = useState('#0d99ff');

  // New Palette State
  const [showNewPaletteModal, setShowNewPaletteModal] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');

  // Selected Swatch for Inspector Details
  const [selectedSwatch, setSelectedSwatch] = useState<ColorSwatch | null>(null);

  const togglePaletteExpanded = (id: string) => {
    setExpandedPalettes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Resolve current active color from selection to quickly add
  const currentSampleColor = () => {
    if (persona === 'vector') {
      const activeShape = vectorShapes.find(s => selectedShapeIds.includes(s.id));
      if (activeShape) {
        return activeTarget === 'stroke' ? activeShape.stroke : activeShape.fill;
      }
      return activeTarget === 'stroke' ? vectorStroke : vectorFill;
    }
    if (persona === 'publish') {
      const activeFrame = publishFrames.find(f => selectedFrameIds.includes(f.id));
      if (activeFrame) return activeFrame.fill || '#0f172a';
    }
    if (persona === 'photo') {
      if (selectedLayer && selectedLayer.type === 'text' && selectedLayer.textColor) {
        return selectedLayer.textColor;
      }
      return foregroundColor;
    }
    return '#0d99ff';
  };

  const handleOpenAddModal = (paletteId: string) => {
    setTargetPaletteId(paletteId);
    setNewSwatchColor(currentSampleColor());
    setNewSwatchName(`Custom Swatch`);
    setShowAddSwatchModal(true);
  };

  const handleConfirmAddSwatch = () => {
    if (!newSwatchColor) return;
    addSwatch(targetPaletteId, {
      name: newSwatchName.trim() || `Swatch ${newSwatchColor}`,
      color: newSwatchColor,
      type: newSwatchColor.includes('gradient') ? 'gradient' : 'solid',
    });
    setShowAddSwatchModal(false);
  };

  const handleConfirmCreatePalette = () => {
    if (!newPaletteName.trim()) return;
    const newPal = createPalette(newPaletteName.trim());
    setExpandedPalettes(prev => ({ ...prev, [newPal.id]: true }));
    setShowNewPaletteModal(false);
    setNewPaletteName('');
  };

  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.25)';
  const inputBg = theme.isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.4)';

  return (
    <div className="flex flex-col h-full text-xs select-none overflow-y-auto scrollbar-thin p-3 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-1.5 font-bold" style={{ color: theme.textPrimary }}>
          <Palette className="w-4 h-4 text-pink-500" />
          <span>Swatches & Palettes</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewPaletteModal(true)}
            className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="Create New Palette Group"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenAddModal(palettes[0]?.id || 'palette-core')}
            className="px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 bg-[#0d99ff] text-white hover:bg-sky-500 transition-colors shadow-xs"
            title="Add Swatch from Active Color"
          >
            <Plus className="w-3 h-3" />
            <span>New Swatch</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          1. APPLICATION TARGET SELECTOR (FILL vs STROKE vs TEXT)
          ===================================================================== */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
          Apply Swatch Target
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
          <button
            onClick={() => setActiveTarget('fill')}
            className={`py-1.5 px-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTarget === 'fill'
                ? 'bg-[#0d99ff] text-white shadow-xs'
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
            }`}
          >
            <div
              className="w-3 h-3 rounded-xs border border-white/50"
              style={{ backgroundColor: persona === 'vector' ? vectorFill : foregroundColor }}
            />
            <span>Fill</span>
          </button>

          <button
            onClick={() => setActiveTarget('stroke')}
            className={`py-1.5 px-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTarget === 'stroke'
                ? 'bg-[#0d99ff] text-white shadow-xs'
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
            }`}
          >
            <div
              className="w-3 h-3 rounded-xs border-2 border-white/90"
              style={{ borderColor: persona === 'vector' ? vectorStroke : foregroundColor }}
            />
            <span>Stroke</span>
          </button>

          <button
            onClick={() => setActiveTarget('text')}
            className={`py-1.5 px-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTarget === 'text'
                ? 'bg-[#0d99ff] text-white shadow-xs'
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
            }`}
          >
            <span className="font-serif font-black text-sm leading-none">T</span>
            <span>Text</span>
          </button>
        </div>
      </div>

      {/* Quick Eyedropper / Sample Button */}
      <div className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm border shadow-xs"
            style={{ backgroundColor: currentSampleColor() }}
          />
          <span className="font-mono font-bold text-[10px]">{currentSampleColor()}</span>
        </div>
        <button
          onClick={() => handleOpenAddModal(palettes[0]?.id || 'palette-core')}
          className="px-2 py-0.5 rounded border text-[10px] font-semibold flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/5"
          style={{ borderColor: theme.borderStrong, color: theme.accent }}
        >
          <Pipette className="w-3 h-3" />
          <span>Save Swatch</span>
        </button>
      </div>

      {/* =====================================================================
          2. SWATCHES SEARCH & FILTER BAR
          ===================================================================== */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 opacity-50 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search swatches..."
            className="w-full pl-7 pr-2 py-1 rounded border text-xs focus:outline-none focus:border-[#0d99ff]"
            style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
          />
        </div>
        <button
          onClick={() => setFilterFavorites(prev => !prev)}
          className={`p-1.5 rounded border transition-colors ${
            filterFavorites
              ? 'bg-amber-500 text-white border-amber-500'
              : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70 border-transparent'
          }`}
          title={filterFavorites ? 'Showing Favorites' : 'Filter by Favorites'}
        >
          <Star className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* =====================================================================
          3. ORGANIZED PALETTES & SWATCH GROUPS
          ===================================================================== */}
      <div className="space-y-3">
        {palettes.map(palette => {
          const isExpanded = expandedPalettes[palette.id] !== false;
          const matchingSwatches = palette.swatches.filter(s => {
            const matchesSearch =
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.color.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFav = !filterFavorites || s.isFavorite;
            return matchesSearch && matchesFav;
          });

          if (searchQuery && matchingSwatches.length === 0) return null;

          return (
            <div
              key={palette.id}
              className="rounded-md border overflow-hidden transition-colors"
              style={{ borderColor: theme.border }}
            >
              {/* Palette Header */}
              <div
                className="px-2.5 py-1.5 flex items-center justify-between cursor-pointer transition-colors"
                style={{ backgroundColor: theme.isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)' }}
                onClick={() => togglePaletteExpanded(palette.id)}
              >
                <div className="flex items-center gap-1.5 font-bold truncate">
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                  <span className="truncate">{palette.name}</span>
                  <span className="text-[10px] font-mono opacity-60">({matchingSwatches.length})</span>
                </div>

                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenAddModal(palette.id)}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-75 hover:opacity-100"
                    title={`Add swatch to ${palette.name}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  {palette.id.startsWith('palette-') && !['palette-core', 'palette-pantone', 'palette-modern-ui', 'palette-gradients'].includes(palette.id) && (
                    <button
                      onClick={() => deletePalette(palette.id)}
                      className="p-1 rounded hover:bg-rose-500/20 text-rose-500 opacity-75 hover:opacity-100"
                      title="Delete Palette"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Swatch Grid */}
              {isExpanded && (
                <div className="p-2 grid grid-cols-4 gap-2" style={{ backgroundColor: theme.bgPanel }}>
                  {matchingSwatches.map(swatch => {
                    const isSelected = selectedSwatch?.id === swatch.id;

                    return (
                      <div
                        key={swatch.id}
                        className="group relative flex flex-col items-center cursor-pointer"
                        onClick={() => {
                          setSelectedSwatch(swatch);
                          applySwatchToSelection(swatch.color, activeTarget);
                        }}
                        onContextMenu={e => {
                          e.preventDefault();
                          removeSwatch(palette.id, swatch.id);
                        }}
                      >
                        {/* Color Chip */}
                        <div
                          className={`w-full aspect-square rounded-sm border shadow-xs transition-all transform group-hover:scale-105 ${
                            isSelected ? 'ring-2 ring-[#0d99ff] ring-offset-1 ring-offset-black' : ''
                          }`}
                          style={{
                            background: swatch.isNone ? 'repeating-linear-gradient(45deg, #ef4444, #ef4444 2px, transparent 2px, transparent 6px)' : swatch.color,
                            borderColor: theme.isLight ? '#cbd5e1' : '#475569',
                          }}
                          title={`${swatch.name} (${swatch.color}) - Click to apply to ${activeTarget}, Right-click to delete`}
                        >
                          {swatch.isFavorite && (
                            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                          )}
                        </div>

                        {/* Name label */}
                        <span className="text-[9px] font-medium truncate w-full text-center mt-1 opacity-80 group-hover:opacity-100" style={{ color: theme.textPrimary }}>
                          {swatch.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =====================================================================
          4. SELECTED SWATCH INSPECTOR DETAILS
          ===================================================================== */}
      {selectedSwatch && (
        <div className="p-2.5 rounded border text-[11px] space-y-1.5" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[10px] opacity-75">Active Swatch</span>
            <button
              onClick={() => setSelectedSwatch(null)}
              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border shadow-sm"
              style={{ background: selectedSwatch.color }}
            />
            <div className="overflow-hidden">
              <span className="font-bold block truncate">{selectedSwatch.name}</span>
              <span className="font-mono text-[10px] opacity-70 block truncate">{selectedSwatch.color}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: theme.border }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedSwatch.color);
                showShortcutFeedback(`Copied: ${selectedSwatch.color}`);
              }}
              className="px-2 py-1 rounded border text-[10px] font-semibold flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: theme.borderStrong }}
            >
              <Copy className="w-3 h-3" />
              <span>Copy Hex</span>
            </button>
            <button
              onClick={() => applySwatchToSelection(selectedSwatch.color, activeTarget)}
              className="flex-1 py-1 rounded bg-[#0d99ff] hover:bg-sky-500 font-bold text-white text-[10px] text-center"
            >
              Apply to {activeTarget.toUpperCase()}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. MODAL: ADD CUSTOM SWATCH
          ===================================================================== */}
      {showAddSwatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div
            className="w-80 rounded-lg border shadow-2xl p-4 text-xs space-y-3"
            style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, color: theme.textPrimary }}
          >
            <div className="flex items-center justify-between font-bold text-sm">
              <span>Save Custom Swatch</span>
              <button onClick={() => setShowAddSwatchModal(false)} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Swatch Name</label>
              <input
                type="text"
                value={newSwatchName}
                onChange={e => setNewSwatchName(e.target.value)}
                placeholder="e.g. Cobalt Sky, Primary CTA..."
                className="w-full px-2.5 py-1.5 rounded border text-xs focus:outline-none focus:border-[#0d99ff]"
                style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                autoFocus
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Color Value (Hex / CSS)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newSwatchColor.startsWith('#') ? newSwatchColor : '#0d99ff'}
                  onChange={e => setNewSwatchColor(e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={newSwatchColor}
                  onChange={e => setNewSwatchColor(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border text-xs font-mono font-bold focus:outline-none focus:border-[#0d99ff]"
                  style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Target Palette</label>
              <select
                value={targetPaletteId}
                onChange={e => setTargetPaletteId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border text-xs font-medium"
                style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              >
                {palettes.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: theme.border }}>
              <button
                onClick={() => setShowAddSwatchModal(false)}
                className="px-3 py-1.5 rounded border font-semibold hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: theme.border }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddSwatch}
                className="px-4 py-1.5 rounded bg-[#0d99ff] hover:bg-sky-500 font-bold text-white shadow-xs"
              >
                Save Swatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. MODAL: CREATE PALETTE GROUP
          ===================================================================== */}
      {showNewPaletteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div
            className="w-80 rounded-lg border shadow-2xl p-4 text-xs space-y-3"
            style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, color: theme.textPrimary }}
          >
            <div className="flex items-center justify-between font-bold text-sm">
              <span>Create Palette Group</span>
              <button onClick={() => setShowNewPaletteModal(false)} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Palette Name</label>
              <input
                type="text"
                value={newPaletteName}
                onChange={e => setNewPaletteName(e.target.value)}
                placeholder="e.g. Autumn Editorial, Mobile UI..."
                className="w-full px-2.5 py-1.5 rounded border text-xs focus:outline-none focus:border-[#0d99ff]"
                style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: theme.border }}>
              <button
                onClick={() => setShowNewPaletteModal(false)}
                className="px-3 py-1.5 rounded border font-semibold hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: theme.border }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreatePalette}
                className="px-4 py-1.5 rounded bg-[#0d99ff] hover:bg-sky-500 font-bold text-white shadow-xs"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
