import React from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Paintbrush,
  Square,
  Circle,
  Type,
  Maximize2,
  Columns,
  Palette,
  Check,
  RotateCcw,
  Sliders,
  Combine,
  Scissors,
  Layers,
  Shapes,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sun,
  Contrast,
  SlidersHorizontal,
  Magnet,
  Lock,
  Unlock,
  Ruler,
  Eye,
  EyeOff,
} from 'lucide-react';
import { FONT_FAMILIES } from '../panels/TypographyPanel';

export const OptionBar: React.FC = () => {
  const {
    persona,
    activeTool,
    toolOptions,
    setToolOption,
    theme,
    foregroundColor,
    setForegroundColor,
    selectedLayer,
    setProject,
    vectorShapes,
    selectedShapeIds,
    updateSelectedVectorShapes,
    pushHistoryStep,
    setActiveDockTab,
    setDockCollapsed,
    activeDockTab,
    vectorFill,
    setVectorFill,
    vectorStroke,
    setVectorStroke,
    vectorStrokeWidth,
    setVectorStrokeWidth,
    vectorStrokeStyle,
    setVectorStrokeStyle,
    vectorCornerRadius,
    setVectorCornerRadius,
    applyPathfinderOp,
    publishSpreadIndex,
    setPublishSpreadIndex,
    publishMasterPage,
    setPublishMasterPage,
    publishColumnCount,
    setPublishColumnCount,
    publishColumnGutter,
    setPublishColumnGutter,
    publishTextWrapMode,
    setPublishTextWrapMode,
    showShortcutFeedback,
    addAdjustmentLayer,
    showRulers,
    setShowRulers,
    showGuides,
    setShowGuides,
    guides,
    snapToGuides,
    setSnapToGuides,
    lockGuides,
    setLockGuides,
  } = useStudio();

  // Active vector text shape if any
  const activeVectorText = vectorShapes.find(s => selectedShapeIds.includes(s.id) && s.type === 'text');

  const sliderTrackClass = theme.isLight ? 'bg-slate-300' : 'bg-black/40';
  const boxBg = theme.isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.4)';

  return (
    <div
      className="h-9 px-3 flex items-center justify-between border-b text-xs select-none overflow-x-auto whitespace-nowrap scrollbar-none transition-colors"
      style={{
        backgroundColor: theme.bgSubtle,
        borderColor: theme.border,
        color: theme.textPrimary,
      }}
    >
      {/* =========================================================================
          PERSONA 1: SUIZA-PHOTO (Photoshop CC / GIMP Raster Options)
          ========================================================================= */}
      {persona === 'photo' && (
        <div className="flex items-center gap-3">
          {/* Active Tool Label */}
          <div
            className="flex items-center gap-1.5 font-bold pr-2.5 border-r uppercase text-[10px] tracking-wider shrink-0"
            style={{ borderColor: theme.borderStrong, color: theme.textPrimary }}
          >
            <span>Photo: {activeTool.replace('-', ' ')}</span>
          </div>

          {/* Brush / Eraser / Healing options */}
          {(activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'healing' || activeTool === 'dodge' || activeTool === 'burn') && (
            <div className="flex items-center gap-3">
              {/* Brush Size */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Size:</span>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={toolOptions.brushSize}
                  onChange={e => setToolOption('brushSize', parseInt(e.target.value) || 1)}
                  className={`w-20 accent-[#0d99ff] h-1.5 rounded cursor-pointer ${sliderTrackClass}`}
                />
                <span className="tabular-nums font-mono text-[11px] w-9 font-bold" style={{ color: theme.textPrimary }}>
                  {toolOptions.brushSize}px
                </span>
              </div>

              {/* Hardness */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Hardness:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toolOptions.brushHardness}
                  onChange={e => setToolOption('brushHardness', parseInt(e.target.value) || 0)}
                  className={`w-16 accent-[#0d99ff] h-1.5 rounded cursor-pointer ${sliderTrackClass}`}
                />
                <span className="tabular-nums font-mono text-[11px] w-7 font-bold" style={{ color: theme.textPrimary }}>
                  {toolOptions.brushHardness}%
                </span>
              </div>

              {/* Opacity */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Opacity:</span>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={toolOptions.brushOpacity}
                  onChange={e => setToolOption('brushOpacity', parseInt(e.target.value) || 100)}
                  className={`w-16 accent-[#0d99ff] h-1.5 rounded cursor-pointer ${sliderTrackClass}`}
                />
                <span className="tabular-nums font-mono text-[11px] w-7 font-bold" style={{ color: theme.textPrimary }}>
                  {toolOptions.brushOpacity}%
                </span>
              </div>

              {/* Flow */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Flow:</span>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={toolOptions.brushFlow}
                  onChange={e => setToolOption('brushFlow', parseInt(e.target.value) || 100)}
                  className={`w-14 accent-[#0d99ff] h-1.5 rounded cursor-pointer ${sliderTrackClass}`}
                />
                <span className="tabular-nums font-mono text-[11px] w-7 font-bold" style={{ color: theme.textPrimary }}>
                  {toolOptions.brushFlow}%
                </span>
              </div>
            </div>
          )}

          {/* Photo Text / Typography Tool Options */}
          {(activeTool === 'text' || (selectedLayer && selectedLayer.type === 'text')) && (
            <div className="flex items-center gap-2">
              {/* Font Family selector */}
              <div className="flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <select
                  value={selectedLayer?.type === 'text' ? (selectedLayer.textFontFamily || 'Plus Jakarta Sans') : (toolOptions.fontFamily || 'Plus Jakarta Sans')}
                  onChange={e => {
                    const f = e.target.value;
                    setToolOption('fontFamily', f);
                    if (selectedLayer && selectedLayer.type === 'text') {
                      setProject(prev => ({
                        ...prev,
                        layers: prev.layers.map(l => l.id === selectedLayer.id ? { ...l, textFontFamily: f } : l),
                        updatedAt: Date.now(),
                      }));
                      pushHistoryStep(`Change Font: ${f}`);
                    }
                    showShortcutFeedback(`Font: ${f}`);
                  }}
                  className="px-2 py-0.5 rounded border text-xs font-semibold cursor-pointer max-w-[135px] truncate"
                  style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                >
                  {FONT_FAMILIES.map(item => (
                    <option key={item.name} value={item.name} style={{ fontFamily: item.font }}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Weight */}
              <select
                value={selectedLayer?.type === 'text' ? (selectedLayer.textFontWeight || '400') : '400'}
                onChange={e => {
                  const w = e.target.value;
                  setToolOption('fontWeight', w);
                  if (selectedLayer && selectedLayer.type === 'text') {
                    setProject(prev => ({
                      ...prev,
                      layers: prev.layers.map(l => l.id === selectedLayer.id ? { ...l, textFontWeight: w } : l),
                      updatedAt: Date.now(),
                    }));
                    pushHistoryStep(`Set Weight: ${w}`);
                  }
                }}
                className="px-1.5 py-0.5 rounded border text-[11px] font-medium cursor-pointer"
                style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              >
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">SemiBold</option>
                <option value="700">Bold</option>
                <option value="900">Black</option>
              </select>

              {/* Font Size */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Size:</span>
                <input
                  type="number"
                  min="6"
                  max="256"
                  value={selectedLayer?.type === 'text' ? (selectedLayer.textFontSize || 36) : (toolOptions.fontSize || 36)}
                  onChange={e => {
                    const s = parseInt(e.target.value) || 12;
                    setToolOption('fontSize', s);
                    if (selectedLayer && selectedLayer.type === 'text') {
                      setProject(prev => ({
                        ...prev,
                        layers: prev.layers.map(l => l.id === selectedLayer.id ? { ...l, textFontSize: s } : l),
                        updatedAt: Date.now(),
                      }));
                    }
                  }}
                  className="w-12 px-1 py-0.5 rounded border text-[11px] font-mono font-bold text-center"
                  style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                />
                <span className="text-[10px]" style={{ color: theme.textSecondary }}>pt</span>
              </div>

              {/* Color Swatch */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Color:</span>
                <div className="relative w-5 h-5 rounded border overflow-hidden cursor-pointer" style={{ borderColor: theme.borderStrong }}>
                  <input
                    type="color"
                    value={selectedLayer?.type === 'text' && selectedLayer.textColor ? selectedLayer.textColor : foregroundColor}
                    onChange={e => {
                      const c = e.target.value;
                      setForegroundColor(c);
                      setToolOption('textColor', c);
                      if (selectedLayer && selectedLayer.type === 'text') {
                        setProject(prev => ({
                          ...prev,
                          layers: prev.layers.map(l => l.id === selectedLayer.id ? { ...l, textColor: c } : l),
                          updatedAt: Date.now(),
                        }));
                        pushHistoryStep(`Text Color: ${c}`);
                      }
                    }}
                    className="w-full h-full cursor-pointer opacity-0 absolute inset-0"
                  />
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: selectedLayer?.type === 'text' && selectedLayer.textColor ? selectedLayer.textColor : foregroundColor }}
                  />
                </div>
              </div>

              {/* Alignment */}
              <div className="flex items-center gap-0.5 p-0.5 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                {(['left', 'center', 'right'] as const).map(align => (
                  <button
                    key={align}
                    onClick={() => {
                      if (selectedLayer && selectedLayer.type === 'text') {
                        setProject(prev => ({
                          ...prev,
                          layers: prev.layers.map(l => l.id === selectedLayer.id ? { ...l, textAlign: align } : l),
                          updatedAt: Date.now(),
                        }));
                        pushHistoryStep(`Align: ${align}`);
                      }
                    }}
                    className={`p-1 rounded transition-colors ${
                      selectedLayer?.type === 'text' && selectedLayer.textAlign === align
                        ? 'bg-[#0d99ff] text-white shadow-xs'
                        : 'hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                    title={`Align ${align}`}
                  >
                    {align === 'left' ? <AlignLeft className="w-3 h-3" /> : align === 'center' ? <AlignCenter className="w-3 h-3" /> : <AlignRight className="w-3 h-3" />}
                  </button>
                ))}
              </div>

              {/* Open Character Panel Button */}
              <button
                onClick={() => {
                  setActiveDockTab('typography');
                  setDockCollapsed(false);
                }}
                className="px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 bg-[#0d99ff]/10 text-sky-500 border-sky-400 hover:bg-[#0d99ff] hover:text-white transition-colors"
                title="Open Character & Font Palette in Dock"
              >
                <Type className="w-3 h-3" />
                <span>Character Panel</span>
              </button>
            </div>
          )}

          {/* Marquee Options */}
          {activeTool === 'marquee' && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Feather:</span>
              <span className="px-1.5 py-0.5 rounded border font-mono font-bold text-xs" style={{ backgroundColor: boxBg, borderColor: theme.borderStrong }}>
                0 px
              </span>
              <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Style: Normal</span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">Anti-alias Active</span>
            </div>
          )}

          {/* Quick Photo Actions */}
          <div className="h-4 w-px mx-1" style={{ backgroundColor: theme.borderStrong }} />

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                addAdjustmentLayer('brightness-contrast');
                showShortcutFeedback('Auto Tone Applied');
              }}
              className="px-2 py-0.5 rounded border text-[11px] font-medium transition-colors hover:bg-[#0d99ff] hover:text-white"
              style={{ backgroundColor: boxBg, borderColor: theme.border }}
              title="Apply Automatic Tonal Balancing"
            >
              Auto Tone
            </button>
            <button
              onClick={() => {
                addAdjustmentLayer('curves');
                showShortcutFeedback('Gaussian Atmosphere Filter Applied');
              }}
              className="px-2 py-0.5 rounded border text-[11px] font-medium transition-colors hover:bg-[#0d99ff] hover:text-white"
              style={{ backgroundColor: boxBg, borderColor: theme.border }}
              title="Gaussian Blur / Tone Curve"
            >
              Gaussian...
            </button>
            <button
              onClick={() => {
                addAdjustmentLayer('hsl');
                showShortcutFeedback('Vibrance Enhanced (+18%)');
              }}
              className="px-2 py-0.5 rounded border text-[11px] font-medium transition-colors hover:bg-[#0d99ff] hover:text-white"
              style={{ backgroundColor: boxBg, borderColor: theme.border }}
              title="Hue / Saturation / Vibrance"
            >
              Vibrance...
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PERSONA 2: SUIZA-VECTOR (Illustrator CC / Inkscape Bézier Options)
          ========================================================================= */}
      {persona === 'vector' && (
        <div className="flex items-center gap-3">
          {/* Active Tool Label */}
          <div
            className="flex items-center gap-1.5 font-bold pr-2.5 border-r uppercase text-[10px] tracking-wider shrink-0 text-amber-600 dark:text-amber-400"
            style={{ borderColor: theme.borderStrong }}
          >
            <span>Vector: {activeTool.replace('-', ' ')}</span>
          </div>

          {/* Vector Text / Typography Tool Options */}
          {(activeTool === 'text' || activeVectorText) && (
            <div className="flex items-center gap-2 pr-2 border-r" style={{ borderColor: theme.border }}>
              {/* Font Family selector */}
              <div className="flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <select
                  value={activeVectorText?.fontFamily || toolOptions.fontFamily || 'Plus Jakarta Sans'}
                  onChange={e => {
                    const f = e.target.value;
                    setToolOption('fontFamily', f);
                    if (activeVectorText) {
                      updateSelectedVectorShapes({ fontFamily: f });
                      pushHistoryStep(`Change Font: ${f}`);
                    }
                    showShortcutFeedback(`Font: ${f}`);
                  }}
                  className="px-2 py-0.5 rounded border text-xs font-semibold cursor-pointer max-w-[135px] truncate"
                  style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                >
                  {FONT_FAMILIES.map(item => (
                    <option key={item.name} value={item.name} style={{ fontFamily: item.font }}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Weight */}
              <select
                value={activeVectorText?.fontWeight || toolOptions.fontWeight || 'bold'}
                onChange={e => {
                  const w = e.target.value;
                  setToolOption('fontWeight', w);
                  if (activeVectorText) {
                    updateSelectedVectorShapes({ fontWeight: w });
                    pushHistoryStep(`Set Weight: ${w}`);
                  }
                }}
                className="px-1.5 py-0.5 rounded border text-[11px] font-medium cursor-pointer"
                style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              >
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">SemiBold</option>
                <option value="700">Bold</option>
                <option value="900">Black</option>
              </select>

              {/* Font Size */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Size:</span>
                <input
                  type="number"
                  min="6"
                  max="256"
                  value={activeVectorText?.fontSize || toolOptions.fontSize || 36}
                  onChange={e => {
                    const s = parseInt(e.target.value) || 12;
                    setToolOption('fontSize', s);
                    if (activeVectorText) {
                      updateSelectedVectorShapes({ fontSize: s });
                    }
                  }}
                  className="w-12 px-1 py-0.5 rounded border text-[11px] font-mono font-bold text-center"
                  style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                />
                <span className="text-[10px]" style={{ color: theme.textSecondary }}>pt</span>
              </div>

              {/* Alignment */}
              <div className="flex items-center gap-0.5 p-0.5 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                {(['left', 'center', 'right'] as const).map(align => (
                  <button
                    key={align}
                    onClick={() => {
                      if (activeVectorText) {
                        updateSelectedVectorShapes({ textAlign: align });
                        pushHistoryStep(`Align: ${align}`);
                      }
                    }}
                    className={`p-1 rounded transition-colors ${
                      activeVectorText?.textAlign === align
                        ? 'bg-[#0d99ff] text-white shadow-xs'
                        : 'hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                    title={`Align ${align}`}
                  >
                    {align === 'left' ? <AlignLeft className="w-3 h-3" /> : align === 'center' ? <AlignCenter className="w-3 h-3" /> : <AlignRight className="w-3 h-3" />}
                  </button>
                ))}
              </div>

              {/* Open Character Panel Button */}
              <button
                onClick={() => {
                  setActiveDockTab('typography');
                  setDockCollapsed(false);
                }}
                className="px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 bg-[#0d99ff]/10 text-sky-500 border-sky-400 hover:bg-[#0d99ff] hover:text-white transition-colors"
                title="Open Character & Font Palette in Dock"
              >
                <Type className="w-3 h-3" />
                <span>Character Panel</span>
              </button>
            </div>
          )}

          {/* Fill swatch */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Fill:</span>
            <div className="relative w-5 h-5 rounded border overflow-hidden cursor-pointer" style={{ borderColor: theme.borderStrong }}>
              <input
                type="color"
                value={vectorFill === 'transparent' ? '#ffffff' : vectorFill}
                onChange={e => setVectorFill(e.target.value)}
                className="w-full h-full cursor-pointer opacity-0 absolute inset-0"
              />
              <div className="w-full h-full" style={{ backgroundColor: vectorFill }} />
            </div>
            <span className="font-mono text-[10px] uppercase font-bold" style={{ color: theme.textPrimary }}>
              {vectorFill}
            </span>
          </div>

          {/* Stroke swatch & weight */}
          <div className="flex items-center gap-1.5 pl-2 border-l" style={{ borderColor: theme.border }}>
            <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Stroke:</span>
            <div className="relative w-5 h-5 rounded border overflow-hidden cursor-pointer" style={{ borderColor: theme.borderStrong }}>
              <input
                type="color"
                value={vectorStroke}
                onChange={e => setVectorStroke(e.target.value)}
                className="w-full h-full cursor-pointer opacity-0 absolute inset-0"
              />
              <div className="w-full h-full" style={{ backgroundColor: vectorStroke }} />
            </div>
            <select
              value={vectorStrokeWidth}
              onChange={e => setVectorStrokeWidth(parseFloat(e.target.value) || 1)}
              className="px-1.5 py-0.5 rounded border text-[11px] font-mono font-bold cursor-pointer"
              style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            >
              {[0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24].map(w => (
                <option key={w} value={w} className={theme.isLight ? 'bg-white text-slate-900' : 'bg-neutral-900 text-neutral-100'}>
                  {w} pt
                </option>
              ))}
            </select>
          </div>

          {/* Stroke Style */}
          <div className="flex items-center gap-1 pl-2 border-l" style={{ borderColor: theme.border }}>
            <button
              onClick={() => setVectorStrokeStyle('solid')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                vectorStrokeStyle === 'solid' ? 'bg-[#f59e0b] text-neutral-950 font-bold border-[#f59e0b]' : ''
              }`}
              style={{ backgroundColor: vectorStrokeStyle === 'solid' ? undefined : boxBg, borderColor: theme.border }}
            >
              Solid
            </button>
            <button
              onClick={() => setVectorStrokeStyle('dashed')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                vectorStrokeStyle === 'dashed' ? 'bg-[#f59e0b] text-neutral-950 font-bold border-[#f59e0b]' : ''
              }`}
              style={{ backgroundColor: vectorStrokeStyle === 'dashed' ? undefined : boxBg, borderColor: theme.border }}
            >
              Dashed
            </button>
          </div>

          {/* Corner Radius */}
          <div className="flex items-center gap-1.5 pl-2 border-l" style={{ borderColor: theme.border }}>
            <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Corners:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={vectorCornerRadius}
              onChange={e => setVectorCornerRadius(parseInt(e.target.value) || 0)}
              className="w-12 px-1 py-0.5 rounded border text-[11px] font-mono font-bold text-center"
              style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            />
            <span className="text-[10px] font-mono" style={{ color: theme.textSecondary }}>px</span>
          </div>

          {/* Quick Pathfinder Booleans */}
          <div className="h-4 w-px mx-1" style={{ backgroundColor: theme.borderStrong }} />

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Pathfinder:</span>
            <button
              onClick={() => applyPathfinderOp('unite')}
              title="Unite / Union (Combine Shapes)"
              className="p-1 rounded border hover:bg-[#0d99ff] hover:text-white transition-colors"
              style={{ backgroundColor: boxBg, borderColor: theme.border }}
            >
              <Combine className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyPathfinderOp('subtract')}
              title="Minus Front / Subtract"
              className="p-1 rounded border hover:bg-[#0d99ff] hover:text-white transition-colors"
              style={{ backgroundColor: boxBg, borderColor: theme.border }}
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyPathfinderOp('intersect')}
              title="Intersect"
              className="p-1 rounded border hover:bg-[#0d99ff] hover:text-white transition-colors"
              style={{ backgroundColor: boxBg, borderColor: theme.border }}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PERSONA 3: SUIZA-PUBLISH (InDesign CC / Scribus Desktop Publishing)
          ========================================================================= */}
      {persona === 'publish' && (
        <div className="flex items-center gap-3">
          {/* Active Tool Label */}
          <div
            className="flex items-center gap-1.5 font-bold pr-2.5 border-r uppercase text-[10px] tracking-wider shrink-0 text-pink-600 dark:text-pink-400"
            style={{ borderColor: theme.borderStrong }}
          >
            <span>Publish: {activeTool.replace('-', ' ')}</span>
          </div>

          {/* Spread Navigator */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const next = Math.max(0, publishSpreadIndex - 1);
                setPublishSpreadIndex(next);
                showShortcutFeedback(`Spread ${next + 1} of 3`);
              }}
              disabled={publishSpreadIndex === 0}
              className="p-1 rounded border disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/10"
              style={{ backgroundColor: boxBg, borderColor: theme.border }}
              title="Previous Spread"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}>
              Spread {publishSpreadIndex + 1} of 3
            </span>
            <button
              onClick={() => {
                const next = Math.min(2, publishSpreadIndex + 1);
                setPublishSpreadIndex(next);
                showShortcutFeedback(`Spread ${next + 1} of 3`);
              }}
              disabled={publishSpreadIndex === 2}
              className="p-1 rounded border disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/10"
              style={{ backgroundColor: boxBg, borderColor: theme.border }}
              title="Next Spread"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Master Page Dropdown */}
          <div className="flex items-center gap-1.5 pl-2 border-l" style={{ borderColor: theme.border }}>
            <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Master:</span>
            <select
              value={publishMasterPage}
              onChange={e => {
                setPublishMasterPage(e.target.value);
                showShortcutFeedback(`Applied ${e.target.value}`);
              }}
              className="px-2 py-0.5 rounded border text-[11px] font-medium"
              style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            >
              <option value="A-Master 3-Col">A-Master (3-Col)</option>
              <option value="Cover-Master">Cover-Master (Full Bleed)</option>
              <option value="B-Master 2-Col">B-Master (2-Col)</option>
              <option value="None">None</option>
            </select>
          </div>

          {/* Column Grid Controls */}
          <div className="flex items-center gap-1.5 pl-2 border-l" style={{ borderColor: theme.border }}>
            <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Cols:</span>
            <select
              value={publishColumnCount}
              onChange={e => {
                const count = parseInt(e.target.value) || 1;
                setPublishColumnCount(count);
                showShortcutFeedback(`${count} Columns Grid`);
              }}
              className="px-1.5 py-0.5 rounded border text-[11px] font-mono font-bold"
              style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            >
              {[1, 2, 3, 4, 5].map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Column Gutter */}
          <div className="flex items-center gap-1 pl-1">
            <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Gutter:</span>
            <input
              type="number"
              min="4"
              max="36"
              value={publishColumnGutter}
              onChange={e => setPublishColumnGutter(parseInt(e.target.value) || 12)}
              className="w-12 px-1 py-0.5 rounded border text-[11px] font-mono font-bold text-center"
              style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            />
            <span className="text-[10px] font-mono" style={{ color: theme.textSecondary }}>pt</span>
          </div>

          {/* Bleed indicator */}
          <div className="px-2 py-0.5 rounded border font-mono text-[10px] font-bold text-pink-600 dark:text-pink-400" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
            3.0mm Bleed
          </div>

          {/* Text Wrap Mode */}
          <div className="flex items-center gap-1.5 pl-2 border-l" style={{ borderColor: theme.border }}>
            <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>Wrap:</span>
            <select
              value={publishTextWrapMode}
              onChange={e => setPublishTextWrapMode(e.target.value as any)}
              className="px-2 py-0.5 rounded border text-[11px] font-medium capitalize"
              style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            >
              <option value="none">No Wrap</option>
              <option value="box">Bounding Box</option>
              <option value="contour">Contour Mask</option>
              <option value="jump">Jump Object</option>
            </select>
          </div>
        </div>
      )}

      {/* Right side: Precision Rulers, Guides & Magnetic Snapping Quick HUD */}
      <div className="flex items-center gap-1 pl-3 shrink-0 border-l" style={{ borderColor: theme.border }}>
        {/* Character / Font Palette Toggle */}
        <button
          onClick={() => {
            setActiveDockTab('typography');
            setDockCollapsed(false);
            showShortcutFeedback('Opened Character Palette');
          }}
          className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
            activeDockTab === 'typography'
              ? 'bg-[#0d99ff] text-white shadow-xs'
              : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-80'
          }`}
          title="Open Character & Font Palette"
        >
          <Type className="w-3.5 h-3.5 text-sky-400" />
          <span>Character</span>
        </button>

        {/* Toggle Rulers */}
        <button
          onClick={() => {
            setShowRulers(r => !r);
            showShortcutFeedback(showRulers ? 'Hidden Rulers' : 'Shown Rulers');
          }}
          className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
            showRulers
              ? theme.isLight ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70'
          }`}
          title="Toggle Rulers (Ctrl+R / ⌘R)"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Rulers</span>
        </button>

        {/* Toggle Guides */}
        <button
          onClick={() => {
            setShowGuides(g => !g);
            showShortcutFeedback(showGuides ? 'Hidden Guides' : 'Shown Guides');
          }}
          className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
            showGuides
              ? theme.isLight ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70'
          }`}
          title="Toggle Guides (Ctrl+; / ⌘;)"
        >
          {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Guides ({guides.length})</span>
        </button>

        {/* Toggle Magnetic Snapping */}
        <button
          onClick={() => {
            setSnapToGuides(s => !s);
            showShortcutFeedback(snapToGuides ? 'Snapping OFF' : 'Magnetic Snapping ON');
          }}
          className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
            snapToGuides
              ? theme.isLight ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70'
          }`}
          title="Toggle Magnetic Snapping (Shift+Ctrl+; / ⇧⌘;)"
        >
          <Magnet className={`w-3.5 h-3.5 ${snapToGuides ? 'text-amber-500' : ''}`} />
          <span>Snap</span>
        </button>

        {/* Toggle Lock Guides */}
        <button
          onClick={() => {
            setLockGuides(l => !l);
            showShortcutFeedback(lockGuides ? 'Guides Unlocked' : 'Guides Locked');
          }}
          className={`p-1 rounded transition-colors ${
            lockGuides
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70'
          }`}
          title={lockGuides ? 'Guides are Locked (Alt+Ctrl+; / ⌥⌘;)' : 'Lock Guides (Alt+Ctrl+; / ⌥⌘;)'}
        >
          {lockGuides ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
