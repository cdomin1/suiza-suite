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
} from 'lucide-react';

export const OptionBar: React.FC = () => {
  const {
    persona,
    activeTool,
    toolOptions,
    setToolOption,
    theme,
    foregroundColor,
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
  } = useStudio();

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

      {/* Right side: Snap & Guide quick toggles */}
      <div className="flex items-center gap-2 pl-3 shrink-0">
        <span className="text-[10px] font-mono opacity-60">Snap: 100%</span>
      </div>
    </div>
  );
};
