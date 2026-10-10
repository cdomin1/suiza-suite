import React from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Type,
  Square,
  Layout,
  Sliders,
  Hash,
  Shapes,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Sparkles,
  Trash2,
  Copy,
  BookOpen,
  WrapText,
  Palette,
  Combine,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const {
    persona,
    project,
    setProject,
    selectedLayer,
    toolOptions,
    setToolOption,
    theme,
    vectorShapes,
    setVectorShapes,
    selectedShapeIds,
    setSelectedShapeIds,
    updateVectorShape,
    publishFrames,
    setPublishFrames,
    selectedFrameIds,
    setSelectedFrameIds,
    updatePublishFrame,
    groupSelectedObjects,
    ungroupSelectedObjects,
    alignSelectedObjects,
    deleteSelectedObjects,
    bringForward,
    sendBackward,
    publishSpreadIndex,
    publishMasterPage,
    publishColumnCount,
    publishColumnGutter,
    showShortcutFeedback,
  } = useStudio();

  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.3)';
  const inputBg = theme.isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.4)';

  // =========================================================================
  // 1. VECTOR PERSONA PROPERTIES & TRANSFORM INSPECTOR
  // =========================================================================
  if (persona === 'vector') {
    const selectedShapes = vectorShapes.filter(s => selectedShapeIds.includes(s.id));

    // Case A: Multi-selection (2 or more shapes selected)
    if (selectedShapes.length > 1) {
      const minX = Math.min(...selectedShapes.map(s => s.x));
      const minY = Math.min(...selectedShapes.map(s => s.y));
      const maxX = Math.max(...selectedShapes.map(s => s.x + s.width));
      const maxY = Math.max(...selectedShapes.map(s => s.y + s.height));
      const grpW = maxX - minX;
      const grpH = maxY - minY;

      return (
        <div className="p-3 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
            <div>
              <span className="font-bold text-sm block" style={{ color: theme.textPrimary }}>
                Multi-Selection
              </span>
              <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>
                {selectedShapes.length} Vector Shapes Selected
              </span>
            </div>
            <span
              className="px-2 py-0.5 rounded border text-[10px] font-semibold font-mono"
              style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.accent }}
            >
              Group
            </span>
          </div>

          {/* Group Transform Bounds */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
              Combined Bounding Box
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>W:</span>
                <span className="font-mono tabular-nums font-semibold" style={{ color: theme.textPrimary }}>{Math.round(grpW)}px</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>H:</span>
                <span className="font-mono tabular-nums font-semibold" style={{ color: theme.textPrimary }}>{Math.round(grpH)}px</span>
              </div>
            </div>
          </div>

          {/* Group Actions: Group, Ungroup, Delete */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
              Group Operations
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={groupSelectedObjects}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded font-semibold text-xs transition-colors bg-[#0d99ff] hover:bg-[#0c88e3] text-white shadow-xs"
              >
                <Combine className="w-3.5 h-3.5" />
                <span>Group (Ctrl+G)</span>
              </button>
              <button
                onClick={ungroupSelectedObjects}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded font-semibold text-xs border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
              >
                <span>Ungroup (Ctrl+Shift+G)</span>
              </button>
            </div>
          </div>

          {/* Alignment Tools (Adobe Illustrator Standard) */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
              Align Objects
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => alignSelectedObjects('left')}
                title="Align Left"
                className="p-2 rounded border flex flex-col items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
                style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
              >
                <AlignLeft className="w-4 h-4 mb-0.5" />
                <span className="text-[9px]">Left</span>
              </button>
              <button
                onClick={() => alignSelectedObjects('center')}
                title="Horizontal Center"
                className="p-2 rounded border flex flex-col items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
                style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
              >
                <AlignCenter className="w-4 h-4 mb-0.5" />
                <span className="text-[9px]">Center</span>
              </button>
              <button
                onClick={() => alignSelectedObjects('right')}
                title="Align Right"
                className="p-2 rounded border flex flex-col items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
                style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
              >
                <AlignRight className="w-4 h-4 mb-0.5" />
                <span className="text-[9px]">Right</span>
              </button>
              <button
                onClick={() => alignSelectedObjects('top')}
                title="Align Top"
                className="p-2 rounded border flex flex-col items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
                style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
              >
                <ArrowUp className="w-4 h-4 mb-0.5" />
                <span className="text-[9px]">Top</span>
              </button>
              <button
                onClick={() => alignSelectedObjects('middle')}
                title="Vertical Middle"
                className="p-2 rounded border flex flex-col items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
                style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
              >
                <Sliders className="w-4 h-4 mb-0.5 rotate-90" />
                <span className="text-[9px]">Middle</span>
              </button>
              <button
                onClick={() => alignSelectedObjects('bottom')}
                title="Align Bottom"
                className="p-2 rounded border flex flex-col items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
                style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
              >
                <ArrowDown className="w-4 h-4 mb-0.5" />
                <span className="text-[9px]">Bottom</span>
              </button>
            </div>
          </div>

          {/* Delete Selection */}
          <div className="pt-2 border-t" style={{ borderColor: theme.border }}>
            <button
              onClick={deleteSelectedObjects}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-colors font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selection (Delete)</span>
            </button>
          </div>
        </div>
      );
    }

    // Case B: Exactly 1 shape selected
    if (selectedShapes.length === 1) {
      const shape = selectedShapes[0];

      return (
        <div className="p-3 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
            <span className="font-bold truncate text-sm" style={{ color: theme.textPrimary }}>
              {shape.text ? `Text: ${shape.text.slice(0, 16)}` : `Shape: ${shape.type.toUpperCase()}`}
            </span>
            <span
              className="px-2 py-0.5 rounded border text-[10px] font-semibold capitalize font-mono"
              style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.accent }}
            >
              {shape.type}
            </span>
          </div>

          {/* Position & Size */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
              Transform
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>X:</span>
                <input
                  type="number"
                  value={Math.round(shape.x)}
                  onChange={e => updateVectorShape(shape.id, { x: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent font-mono font-semibold focus:outline-none"
                  style={{ color: theme.textPrimary }}
                />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>Y:</span>
                <input
                  type="number"
                  value={Math.round(shape.y)}
                  onChange={e => updateVectorShape(shape.id, { y: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent font-mono font-semibold focus:outline-none"
                  style={{ color: theme.textPrimary }}
                />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>W:</span>
                <input
                  type="number"
                  value={Math.round(shape.width)}
                  onChange={e => updateVectorShape(shape.id, { width: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-transparent font-mono font-semibold focus:outline-none"
                  style={{ color: theme.textPrimary }}
                />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>H:</span>
                <input
                  type="number"
                  value={Math.round(shape.height)}
                  onChange={e => updateVectorShape(shape.id, { height: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-transparent font-mono font-semibold focus:outline-none"
                  style={{ color: theme.textPrimary }}
                />
              </div>
            </div>
          </div>

          {/* Fill & Stroke Appearance */}
          <div className="space-y-2.5 pt-2 border-t" style={{ borderColor: theme.border }}>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
              Fill & Stroke
            </div>

            {/* Fill Color */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: theme.textSecondary }}>Fill</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={shape.fill.startsWith('#') ? shape.fill : '#0d99ff'}
                  onChange={e => updateVectorShape(shape.id, { fill: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer border border-white/20 p-0"
                />
                <input
                  type="text"
                  value={shape.fill}
                  onChange={e => updateVectorShape(shape.id, { fill: e.target.value })}
                  className="w-20 px-2 py-1 rounded border text-xs font-mono font-semibold uppercase"
                  style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                />
              </div>
            </div>

            {/* Stroke Color */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: theme.textSecondary }}>Stroke</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={shape.stroke.startsWith('#') ? shape.stroke : '#0f172a'}
                  onChange={e => updateVectorShape(shape.id, { stroke: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer border border-white/20 p-0"
                />
                <input
                  type="text"
                  value={shape.stroke}
                  onChange={e => updateVectorShape(shape.id, { stroke: e.target.value })}
                  className="w-20 px-2 py-1 rounded border text-xs font-mono font-semibold uppercase"
                  style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                />
              </div>
            </div>

            {/* Stroke Width */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-medium" style={{ color: theme.textSecondary }}>Stroke Weight</span>
                <span className="font-mono font-bold" style={{ color: theme.textPrimary }}>{shape.strokeWidth} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={shape.strokeWidth}
                onChange={e => updateVectorShape(shape.id, { strokeWidth: parseInt(e.target.value) || 0 })}
                className="w-full accent-[#0d99ff] h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Corner Radius (if rect) */}
            {shape.type === 'rect' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium" style={{ color: theme.textSecondary }}>Corner Radius</span>
                  <span className="font-mono font-bold" style={{ color: theme.textPrimary }}>{shape.cornerRadius || 0} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={shape.cornerRadius || 0}
                  onChange={e => updateVectorShape(shape.id, { cornerRadius: parseInt(e.target.value) || 0 })}
                  className="w-full accent-[#0d99ff] h-1.5 rounded cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Typography properties (if text shape) */}
          {shape.type === 'text' && (
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
              <div className="text-[10px] font-bold text-sky-500 uppercase tracking-wider flex items-center gap-1">
                <Type className="w-3.5 h-3.5" />
                <span>Text Typography</span>
              </div>
              <textarea
                value={shape.text || ''}
                onChange={e => updateVectorShape(shape.id, { text: e.target.value })}
                rows={2}
                className="w-full rounded p-2 text-xs border focus:outline-none focus:border-[#0d99ff]"
                style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Font Size</span>
                <input
                  type="number"
                  min="8"
                  max="144"
                  value={shape.fontSize || 32}
                  onChange={e => updateVectorShape(shape.id, { fontSize: parseInt(e.target.value) || 32 })}
                  className="w-16 px-2 py-1 rounded border text-xs font-mono font-semibold"
                  style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                />
              </div>
            </div>
          )}

          {/* Arrange & Delete */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
              Arrange
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={bringForward}
                className="px-2 py-1.5 rounded border text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/5"
                style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
              >
                Forward (Ctrl+])
              </button>
              <button
                onClick={sendBackward}
                className="px-2 py-1.5 rounded border text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/5"
                style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
              >
                Backward (Ctrl+[)
              </button>
            </div>
            <button
              onClick={deleteSelectedObjects}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-colors font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Shape</span>
            </button>
          </div>
        </div>
      );
    }

    // Case C: No shape selected
    return (
      <div className="p-4 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
        <div className="text-center space-y-1">
          <div className="font-bold text-sm" style={{ color: theme.textPrimary }}>
            Vector Artboard Inspector
          </div>
          <div className="text-[11px]" style={{ color: theme.textMuted }}>
            Click an object or drag on canvas to multi-select.
          </div>
        </div>

        <div className="p-3 rounded border space-y-2" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
            Artboard Dimensions
          </div>
          <div className="flex justify-between font-mono">
            <span style={{ color: theme.textMuted }}>Width:</span>
            <span className="font-bold" style={{ color: theme.textPrimary }}>{project.width} px</span>
          </div>
          <div className="flex justify-between font-mono">
            <span style={{ color: theme.textMuted }}>Height:</span>
            <span className="font-bold" style={{ color: theme.textPrimary }}>{project.height} px</span>
          </div>
          <div className="flex justify-between font-mono">
            <span style={{ color: theme.textMuted }}>Total Shapes:</span>
            <span className="font-bold" style={{ color: theme.accent }}>{vectorShapes.length}</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PUBLISH PERSONA PROPERTIES INSPECTOR (Adobe InDesign / Affinity Publisher)
  // =========================================================================
  if (persona === 'publish') {
    const selectedFrames = publishFrames.filter(f => selectedFrameIds.includes(f.id));

    if (selectedFrames.length > 1) {
      return (
        <div className="p-3 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
            <div>
              <span className="font-bold text-sm block" style={{ color: theme.textPrimary }}>
                Multi-Selection
              </span>
              <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>
                {selectedFrames.length} Editorial Frames Selected
              </span>
            </div>
            <span
              className="px-2 py-0.5 rounded border text-[10px] font-semibold font-mono"
              style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: '#ec4899' }}
            >
              Spread
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={groupSelectedObjects}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded font-semibold text-xs text-white bg-pink-600 hover:bg-pink-700 shadow-xs"
            >
              <Combine className="w-3.5 h-3.5" />
              <span>Group (Ctrl+G)</span>
            </button>
            <button
              onClick={ungroupSelectedObjects}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded font-semibold text-xs border"
              style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
            >
              <span>Ungroup</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
              Align Frames
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={() => alignSelectedObjects('left')} className="p-2 rounded border flex flex-col items-center justify-center" style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}>
                <AlignLeft className="w-4 h-4 mb-0.5" />
                <span className="text-[9px]">Left</span>
              </button>
              <button onClick={() => alignSelectedObjects('center')} className="p-2 rounded border flex flex-col items-center justify-center" style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}>
                <AlignCenter className="w-4 h-4 mb-0.5" />
                <span className="text-[9px]">Center</span>
              </button>
              <button onClick={() => alignSelectedObjects('right')} className="p-2 rounded border flex flex-col items-center justify-center" style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}>
                <AlignRight className="w-4 h-4 mb-0.5" />
                <span className="text-[9px]">Right</span>
              </button>
            </div>
          </div>

          <button
            onClick={deleteSelectedObjects}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-colors font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected Frames</span>
          </button>
        </div>
      );
    }

    if (selectedFrames.length === 1) {
      const frame = selectedFrames[0];

      return (
        <div className="p-3 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
            <span className="font-bold truncate text-sm" style={{ color: theme.textPrimary }}>
              {frame.title || `Frame: ${frame.type.toUpperCase()}`}
            </span>
            <span
              className="px-2 py-0.5 rounded border text-[10px] font-semibold capitalize font-mono text-pink-500"
              style={{ backgroundColor: boxBg, borderColor: theme.borderStrong }}
            >
              {frame.type}
            </span>
          </div>

          {/* Transform & Geometry */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
              Geometry & Flow Bounds
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>X:</span>
                <input
                  type="number"
                  value={Math.round(frame.x)}
                  onChange={e => updatePublishFrame(frame.id, { x: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent font-mono font-semibold focus:outline-none"
                  style={{ color: theme.textPrimary }}
                />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>Y:</span>
                <input
                  type="number"
                  value={Math.round(frame.y)}
                  onChange={e => updatePublishFrame(frame.id, { y: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent font-mono font-semibold focus:outline-none"
                  style={{ color: theme.textPrimary }}
                />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>W:</span>
                <input
                  type="number"
                  value={Math.round(frame.width)}
                  onChange={e => updatePublishFrame(frame.id, { width: Math.max(10, parseInt(e.target.value) || 10) })}
                  className="w-full bg-transparent font-mono font-semibold focus:outline-none"
                  style={{ color: theme.textPrimary }}
                />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
                <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>H:</span>
                <input
                  type="number"
                  value={Math.round(frame.height)}
                  onChange={e => updatePublishFrame(frame.id, { height: Math.max(10, parseInt(e.target.value) || 10) })}
                  className="w-full bg-transparent font-mono font-semibold focus:outline-none"
                  style={{ color: theme.textPrimary }}
                />
              </div>
            </div>
          </div>

          {/* Editorial Content / Title */}
          {frame.content !== undefined && (
            <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: theme.border }}>
              <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                Editorial Text Content
              </label>
              <textarea
                value={frame.content}
                onChange={e => updatePublishFrame(frame.id, { content: e.target.value })}
                rows={4}
                className="w-full rounded p-2 text-xs border focus:outline-none focus:border-pink-500 leading-relaxed font-serif"
                style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              />
            </div>
          )}

          {/* Text Wrap Mode */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
            <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: theme.textSecondary }}>
              <WrapText className="w-3.5 h-3.5 text-pink-500" />
              <span>Text Wrap Interaction</span>
            </div>
            <select
              value={frame.wrapMode || 'box'}
              onChange={e => updatePublishFrame(frame.id, { wrapMode: e.target.value as any })}
              className="w-full px-2 py-1.5 rounded border text-xs font-semibold"
              style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            >
              <option value="none">No Text Wrap</option>
              <option value="box">Wrap Around Bounding Box</option>
              <option value="contour">Wrap Around Contour Shape</option>
              <option value="jump">Jump Object</option>
            </select>
          </div>

          {/* Delete Frame */}
          <div className="pt-2 border-t" style={{ borderColor: theme.border }}>
            <button
              onClick={deleteSelectedObjects}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-colors font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Publication Frame</span>
            </button>
          </div>
        </div>
      );
    }

    // Default Publish spread info
    return (
      <div className="p-4 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
        <div className="text-center space-y-1">
          <div className="font-bold text-sm" style={{ color: theme.textPrimary }}>
            InDesign Spread Inspector
          </div>
          <div className="text-[11px]" style={{ color: theme.textMuted }}>
            Master: {publishMasterPage} · {publishColumnCount} Columns
          </div>
        </div>

        <div className="p-3 rounded border space-y-2" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
            Editorial Spread Specifications
          </div>
          <div className="flex justify-between font-mono">
            <span style={{ color: theme.textMuted }}>Facing Pages:</span>
            <span className="font-bold" style={{ color: theme.textPrimary }}>Active Spread II</span>
          </div>
          <div className="flex justify-between font-mono">
            <span style={{ color: theme.textMuted }}>Bleed Offset:</span>
            <span className="font-bold text-red-500">3.0 mm</span>
          </div>
          <div className="flex justify-between font-mono">
            <span style={{ color: theme.textMuted }}>Column Gutter:</span>
            <span className="font-bold" style={{ color: theme.textPrimary }}>{publishColumnGutter} px</span>
          </div>
          <div className="flex justify-between font-mono">
            <span style={{ color: theme.textMuted }}>Active Frames:</span>
            <span className="font-bold text-pink-500">{publishFrames.length}</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. PHOTO PERSONA PROPERTIES INSPECTOR (Adobe Photoshop Standard)
  // =========================================================================
  if (!selectedLayer) {
    return (
      <div className="p-4 text-xs text-center" style={{ color: theme.textMuted }}>
        No layer selected. Select a layer from the Layers panel to inspect properties.
      </div>
    );
  }

  return (
    <div className="p-3 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
      {/* Layer Header */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
        <span className="font-bold truncate text-sm" style={{ color: theme.textPrimary }}>
          {selectedLayer.name}
        </span>
        <span
          className="px-2 py-0.5 rounded border text-[10px] font-semibold capitalize font-mono"
          style={{
            backgroundColor: boxBg,
            borderColor: theme.borderStrong,
            color: theme.textSecondary,
          }}
        >
          {selectedLayer.type}
        </span>
      </div>

      {/* TRANSFORM & DIMENSIONS */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
          Dimensions & Transform
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded border"
            style={{ backgroundColor: boxBg, borderColor: theme.border }}
          >
            <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>W:</span>
            <span className="font-mono tabular-nums font-semibold" style={{ color: theme.textPrimary }}>{project.width}px</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded border"
            style={{ backgroundColor: boxBg, borderColor: theme.border }}
          >
            <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>H:</span>
            <span className="font-mono tabular-nums font-semibold" style={{ color: theme.textPrimary }}>{project.height}px</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded border"
            style={{ backgroundColor: boxBg, borderColor: theme.border }}
          >
            <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>X:</span>
            <input
              type="number"
              value={Math.round(selectedLayer.x ?? 0)}
              onChange={e => {
                const val = parseInt(e.target.value) || 0;
                setProject(prev => ({
                  ...prev,
                  layers: prev.layers.map(l => l.id === selectedLayer.id ? { ...l, x: val } : l)
                }));
              }}
              className="w-full bg-transparent font-mono font-semibold focus:outline-none"
              style={{ color: theme.textPrimary }}
            />
          </div>
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded border"
            style={{ backgroundColor: boxBg, borderColor: theme.border }}
          >
            <span className="text-[10px] font-mono font-bold" style={{ color: theme.textMuted }}>Y:</span>
            <input
              type="number"
              value={Math.round(selectedLayer.y ?? 0)}
              onChange={e => {
                const val = parseInt(e.target.value) || 0;
                setProject(prev => ({
                  ...prev,
                  layers: prev.layers.map(l => l.id === selectedLayer.id ? { ...l, y: val } : l)
                }));
              }}
              className="w-full bg-transparent font-mono font-semibold focus:outline-none"
              style={{ color: theme.textPrimary }}
            />
          </div>
        </div>
      </div>

      {/* TEXT LAYER SPECIFIC PROPERTIES */}
      {selectedLayer.type === 'text' && (
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: theme.border }}>
          <div className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider flex items-center gap-1">
            <Type className="w-3.5 h-3.5" />
            <span>Typography Inspector</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Content</label>
            <textarea
              value={selectedLayer.textContent || ''}
              onChange={e => {
                const val = e.target.value;
                setProject(prev => ({
                  ...prev,
                  layers: prev.layers.map(l => l.id === selectedLayer.id ? { ...l, textContent: val } : l)
                }));
              }}
              rows={3}
              className="w-full rounded p-2 text-xs border focus:outline-none focus:border-[#0d99ff]"
              style={{
                backgroundColor: inputBg,
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium" style={{ color: theme.textSecondary }}>Font Size</span>
            <input
              type="number"
              value={selectedLayer.textFontSize || 44}
              onChange={e => {
                const val = parseInt(e.target.value) || 44;
                setProject(prev => ({
                  ...prev,
                  layers: prev.layers.map(l => l.id === selectedLayer.id ? { ...l, textFontSize: val } : l)
                }));
              }}
              className="w-20 px-2 py-1 rounded border text-xs font-mono font-semibold"
              style={{
                backgroundColor: inputBg,
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
