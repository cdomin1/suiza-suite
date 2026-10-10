import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { BlendMode, VectorShape, PublishFrame } from '../../types';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  SlidersHorizontal,
  Layers,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Folder,
  FolderOpen,
  ArrowDown,
  ArrowUp,
  ShieldCheck,
  Combine,
  Type,
  Square,
  Circle,
  Shapes,
  Image as ImageIcon,
} from 'lucide-react';

const BLEND_MODES: { id: BlendMode; name: string }[] = [
  { id: 'normal', name: 'Normal' },
  { id: 'multiply', name: 'Multiply' },
  { id: 'screen', name: 'Screen' },
  { id: 'overlay', name: 'Overlay' },
  { id: 'darken', name: 'Darken' },
  { id: 'lighten', name: 'Lighten' },
  { id: 'color-dodge', name: 'Color Dodge' },
  { id: 'color-burn', name: 'Color Burn' },
  { id: 'soft-light', name: 'Soft Light' },
  { id: 'hard-light', name: 'Hard Light' },
  { id: 'difference', name: 'Difference' },
  { id: 'exclusion', name: 'Exclusion' },
];

export const LayersPanel: React.FC = () => {
  const {
    persona,
    project,
    selectedLayer,
    setSelectedLayerId,
    addLayer,
    createLayerGroup,
    toggleGroupCollapse,
    addAdjustmentLayer,
    deleteLayer,
    duplicateLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    setLayerOpacity,
    setLayerBlendMode,
    moveLayer,
    mergeLayerDown,
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
    deleteSelectedObjects,
    bringForward,
    sendBackward,
    showShortcutFeedback,
    pushHistoryStep,
  } = useStudio();

  // =========================================================================
  // 1. VECTOR PERSONA LAYERS (Shapes, Paths & Groups)
  // =========================================================================
  if (persona === 'vector') {
    const reversedShapes = [...vectorShapes].reverse();

    const handleShapeClick = (id: string, e: React.MouseEvent) => {
      if (e.shiftKey) {
        setSelectedShapeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
      } else {
        setSelectedShapeIds([id]);
      }
    };

    const handleToggleShapeVisibility = (shape: VectorShape) => {
      const nextVis = shape.visible === false ? true : false;
      updateVectorShape(shape.id, { visible: nextVis });
      showShortcutFeedback(`Shape ${nextVis ? 'Visible' : 'Hidden'}`);
    };

    const handleToggleShapeLock = (shape: VectorShape) => {
      const nextLock = !shape.locked;
      updateVectorShape(shape.id, { locked: nextLock });
      showShortcutFeedback(`Shape ${nextLock ? 'Locked' : 'Unlocked'}`);
    };

    const handleAddVectorLayer = () => {
      const newShape: VectorShape = {
        id: `v-rect-${Date.now()}`,
        name: `Rectangle ${vectorShapes.length + 1}`,
        type: 'rect',
        x: 160 + (vectorShapes.length % 5) * 30,
        y: 160 + (vectorShapes.length % 5) * 30,
        width: 180,
        height: 120,
        fill: '#0d99ff',
        stroke: '#0369a1',
        strokeWidth: 2,
        cornerRadius: 4,
      };
      setVectorShapes(prev => [...prev, newShape]);
      setSelectedShapeIds([newShape.id]);
      pushHistoryStep('Add Vector Shape Layer');
      showShortcutFeedback('Added Vector Shape');
    };

    return (
      <div className="flex flex-col h-full text-xs select-none">
        {/* Vector Layers Header */}
        <div
          className="p-2.5 border-b flex items-center justify-between"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>
              Vector Objects & Layers
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border" style={{ borderColor: theme.borderStrong, color: theme.accent }}>
              {vectorShapes.length}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {selectedShapeIds.length > 0 ? `${selectedShapeIds.length} Selected` : 'None'}
          </span>
        </div>

        {/* Shape Items List (Top-to-bottom) */}
        <div className="flex-1 overflow-y-auto divide-y scrollbar-thin" style={{ borderColor: theme.border }}>
          {reversedShapes.map((shape) => {
            const isSelected = selectedShapeIds.includes(shape.id);
            const isGroup = !!shape.groupId;
            const isVisible = shape.visible !== false;

            return (
              <div
                key={shape.id}
                onClick={e => handleShapeClick(shape.id, e)}
                className={`flex items-center justify-between px-2.5 py-2 cursor-pointer transition-colors group ${
                  isSelected
                    ? theme.isLight
                      ? 'bg-sky-100 border-l-4 border-[#0d99ff]'
                      : 'bg-[#0d99ff]/25 border-l-2 border-[#0d99ff]'
                    : isGroup
                    ? (theme.isLight ? 'bg-slate-50 hover:bg-slate-100' : 'bg-black/20 hover:bg-white/5')
                    : (theme.isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5')
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  {/* Visibility eye */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleShapeVisibility(shape);
                    }}
                    className="p-1 rounded transition-colors"
                    style={{ color: isVisible ? (theme.isLight ? '#0f172a' : '#ededed') : (theme.isLight ? '#94a3b8' : '#52525b') }}
                    title="Toggle Visibility"
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Thumbnail / Type Icon with fill color swatch */}
                  <div
                    className="w-5 h-5 rounded-xs shrink-0 flex items-center justify-center border shadow-2xs"
                    style={{
                      backgroundColor: shape.fill && shape.fill !== 'none' ? shape.fill : (theme.isLight ? '#f1f5f9' : '#27272a'),
                      borderColor: shape.stroke && shape.stroke !== 'none' ? shape.stroke : theme.borderStrong,
                    }}
                  >
                    {shape.type === 'text' ? (
                      <span className="text-[10px] font-bold text-white drop-shadow-xs">T</span>
                    ) : shape.type === 'polygon' ? (
                      <Shapes className="w-3 h-3 text-white/90 drop-shadow-xs" />
                    ) : shape.type === 'ellipse' ? (
                      <Circle className="w-3 h-3 text-white/90 drop-shadow-xs" />
                    ) : (
                      <Square className="w-3 h-3 text-white/90 drop-shadow-xs" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-[11px]" style={{ color: theme.textPrimary }}>
                      {shape.name || (shape.text ? `"${shape.text.slice(0, 16)}"` : `Vector ${shape.type.toUpperCase()}`)}
                    </span>
                    <span className="text-[10px] font-mono opacity-65" style={{ color: theme.textSecondary }}>
                      {shape.type} · {Math.round(shape.width)}×{Math.round(shape.height)}px {isGroup ? '· Grouped' : ''}
                    </span>
                  </div>
                </div>

                {/* Lock button */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleShapeLock(shape);
                    }}
                    className="p-1 rounded opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{ color: shape.locked ? '#f59e0b' : theme.textSecondary }}
                    title={shape.locked ? 'Unlock Shape' : 'Lock Shape'}
                  >
                    {shape.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-40 hover:opacity-100" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vector Layers Footer Action Bar */}
        <div
          className="p-2 border-t flex items-center justify-between"
          style={{ borderColor: theme.border, backgroundColor: theme.bgSubtle }}
        >
          <div className="flex items-center gap-1">
            <button
              onClick={handleAddVectorLayer}
              title="New Vector Shape Layer"
              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              style={{ color: theme.textPrimary }}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={groupSelectedObjects}
              disabled={selectedShapeIds.length < 2}
              title="Group Selected Shapes (Ctrl+G)"
              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
              style={{ color: theme.textPrimary }}
            >
              <Combine className="w-4 h-4" />
            </button>
            <button
              onClick={bringForward}
              disabled={selectedShapeIds.length === 0}
              title="Bring Forward (Ctrl+])"
              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
              style={{ color: theme.textPrimary }}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={sendBackward}
              disabled={selectedShapeIds.length === 0}
              title="Send Backward (Ctrl+[)"
              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
              style={{ color: theme.textPrimary }}
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={deleteSelectedObjects}
            disabled={selectedShapeIds.length === 0}
            title="Delete Selected Shape (Delete)"
            className="p-1.5 rounded hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PUBLISH PERSONA LAYERS (Publication Frames)
  // =========================================================================
  if (persona === 'publish') {
    const reversedFrames = [...publishFrames].reverse();

    const handleFrameClick = (id: string, e: React.MouseEvent) => {
      if (e.shiftKey) {
        setSelectedFrameIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
      } else {
        setSelectedFrameIds([id]);
      }
    };

    const handleToggleFrameVisibility = (frame: PublishFrame) => {
      const nextVis = frame.visible === false ? true : false;
      updatePublishFrame(frame.id, { visible: nextVis });
      showShortcutFeedback(`Frame ${nextVis ? 'Visible' : 'Hidden'}`);
    };

    const handleToggleFrameLock = (frame: PublishFrame) => {
      const nextLock = !frame.locked;
      updatePublishFrame(frame.id, { locked: nextLock });
      showShortcutFeedback(`Frame ${nextLock ? 'Locked' : 'Unlocked'}`);
    };

    const handleAddFrame = () => {
      const newFrame: PublishFrame = {
        id: `pub-f-${Date.now()}`,
        name: `Text Frame ${publishFrames.length + 1}`,
        type: 'text',
        x: 80 + (publishFrames.length % 4) * 40,
        y: 120 + (publishFrames.length % 4) * 30,
        width: 320,
        height: 180,
        title: 'New Publication Story',
        content: 'Editorial body paragraph text flows across columns.',
      };
      setPublishFrames(prev => [...prev, newFrame]);
      setSelectedFrameIds([newFrame.id]);
      pushHistoryStep('Add Publication Frame');
      showShortcutFeedback('Added Publication Frame');
    };

    return (
      <div className="flex flex-col h-full text-xs select-none">
        {/* Publish Layers Header */}
        <div
          className="p-2.5 border-b flex items-center justify-between"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>
              Publication Document Layers
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border text-pink-500 font-bold" style={{ borderColor: theme.borderStrong }}>
              {publishFrames.length}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {selectedFrameIds.length > 0 ? `${selectedFrameIds.length} Selected` : 'None'}
          </span>
        </div>

        {/* Frames List */}
        <div className="flex-1 overflow-y-auto divide-y scrollbar-thin" style={{ borderColor: theme.border }}>
          {reversedFrames.map((frame) => {
            const isSelected = selectedFrameIds.includes(frame.id);
            const isVisible = frame.visible !== false;

            return (
              <div
                key={frame.id}
                onClick={e => handleFrameClick(frame.id, e)}
                className={`flex items-center justify-between px-2.5 py-2 cursor-pointer transition-colors group ${
                  isSelected
                    ? theme.isLight
                      ? 'bg-pink-100/80 border-l-4 border-pink-500'
                      : 'bg-pink-500/25 border-l-2 border-pink-500'
                    : (theme.isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5')
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleFrameVisibility(frame);
                    }}
                    className="p-1 rounded transition-colors"
                    style={{ color: isVisible ? (theme.isLight ? '#0f172a' : '#ededed') : (theme.isLight ? '#94a3b8' : '#52525b') }}
                    title="Toggle Visibility"
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <div
                    className="w-5 h-5 rounded-xs shrink-0 flex items-center justify-center border bg-slate-100 dark:bg-neutral-800"
                    style={{ borderColor: theme.borderStrong }}
                  >
                    {frame.type === 'picture' ? (
                      <ImageIcon className="w-3 h-3 text-emerald-500" />
                    ) : frame.type === 'rule' ? (
                      <span className="text-[10px] font-mono text-slate-400">—</span>
                    ) : (
                      <Type className="w-3 h-3 text-pink-500" />
                    )}
                  </div>

                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-[11px]" style={{ color: theme.textPrimary }}>
                      {frame.name || frame.title || `Frame: ${frame.type}`}
                    </span>
                    <span className="text-[10px] font-mono opacity-65 truncate" style={{ color: theme.textSecondary }}>
                      {frame.type} · {Math.round(frame.width)}×{Math.round(frame.height)}px
                    </span>
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleToggleFrameLock(frame);
                  }}
                  className="p-1 rounded opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ color: frame.locked ? '#f59e0b' : theme.textSecondary }}
                >
                  {frame.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-40 hover:opacity-100" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Publish Layers Footer Action Bar */}
        <div
          className="p-2 border-t flex items-center justify-between"
          style={{ borderColor: theme.border, backgroundColor: theme.bgSubtle }}
        >
          <div className="flex items-center gap-1">
            <button
              onClick={handleAddFrame}
              title="New Frame"
              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              style={{ color: theme.textPrimary }}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={groupSelectedObjects}
              disabled={selectedFrameIds.length < 2}
              title="Group Frames (Ctrl+G)"
              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
              style={{ color: theme.textPrimary }}
            >
              <Combine className="w-4 h-4" />
            </button>
            <button
              onClick={bringForward}
              disabled={selectedFrameIds.length === 0}
              title="Bring Forward (Ctrl+])"
              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
              style={{ color: theme.textPrimary }}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={sendBackward}
              disabled={selectedFrameIds.length === 0}
              title="Send Backward (Ctrl+[)"
              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
              style={{ color: theme.textPrimary }}
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={deleteSelectedObjects}
            disabled={selectedFrameIds.length === 0}
            title="Delete Selected Frame"
            className="p-1.5 rounded hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. PHOTO PERSONA LAYERS (Raster, Text & Adjustment Layers)
  // =========================================================================
  const reversedLayers = [...project.layers].reverse();

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Top Layer Controls: Blend Mode & Opacity */}
      <div
        className="p-2.5 border-b space-y-2"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Blend Mode */}
          <div className="flex-1">
            <select
              value={selectedLayer?.blendMode || 'normal'}
              onChange={e => {
                if (selectedLayer) setLayerBlendMode(selectedLayer.id, e.target.value as BlendMode);
              }}
              disabled={!selectedLayer || selectedLayer.locked}
              className="w-full rounded px-2 py-1 text-xs font-medium border focus:outline-none focus:border-[#0d99ff] disabled:opacity-50"
              style={{
                backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.4)',
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
              }}
            >
              {BLEND_MODES.map(bm => (
                <option key={bm.id} value={bm.id} className={theme.isLight ? 'bg-white text-slate-900' : 'bg-neutral-900 text-neutral-100'}>
                  {bm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center gap-1.5 w-32">
            <span className="text-[10px] font-semibold" style={{ color: theme.textSecondary }}>Op:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedLayer?.opacity ?? 100}
              onChange={e => {
                if (selectedLayer) setLayerOpacity(selectedLayer.id, parseInt(e.target.value) || 0);
              }}
              disabled={!selectedLayer || selectedLayer.locked}
              className={`w-full accent-[#0d99ff] h-1.5 rounded cursor-pointer disabled:opacity-50 ${theme.isLight ? 'bg-slate-300' : 'bg-black/40'}`}
            />
            <span className="font-mono text-[10px] w-7 text-right tabular-nums font-bold" style={{ color: theme.textPrimary }}>
              {selectedLayer?.opacity ?? 100}%
            </span>
          </div>
        </div>

        {/* Lock & Non-destructive status */}
        <div className="flex items-center justify-between text-[10px] px-0.5">
          <span className={`flex items-center gap-1 font-semibold ${theme.isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Non-destructive Stack</span>
          </span>
          {selectedLayer && (
            <button
              onClick={() => toggleLayerLock(selectedLayer.id)}
              className="flex items-center gap-1 font-medium transition-colors"
              style={{ color: theme.textSecondary }}
            >
              {selectedLayer.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3 opacity-60" />}
              <span>{selectedLayer.locked ? 'Locked' : 'Unlocked'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Layer List Stack */}
      <div
        className="flex-1 overflow-y-auto divide-y scrollbar-thin"
        style={{ borderColor: theme.border }}
      >
        {reversedLayers.map((layer) => {
          const isSelected = layer.id === project.selectedLayerId;
          const isGroup = layer.type === 'group';

          return (
            <div
              key={layer.id}
              onClick={() => setSelectedLayerId(layer.id)}
              className={`flex items-center justify-between px-2.5 py-2 cursor-pointer transition-colors group ${
                isSelected
                  ? theme.isLight
                    ? 'bg-sky-100 border-l-4 border-[#0d99ff]'
                    : 'bg-[#0d99ff]/25 border-l-2 border-[#0d99ff]'
                  : isGroup
                  ? (theme.isLight ? 'bg-slate-50 hover:bg-slate-100 font-bold' : 'bg-black/30 hover:bg-white/5 font-semibold')
                  : (theme.isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5')
              } ${layer.groupId ? 'pl-6' : ''}`}
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                {/* Group Expand / Collapse */}
                {isGroup ? (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleGroupCollapse(layer.id);
                    }}
                    className="p-0.5"
                    style={{ color: theme.textSecondary }}
                  >
                    {layer.collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                ) : (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleLayerVisibility(layer.id);
                    }}
                    className="p-1 rounded transition-colors"
                    style={{ color: layer.visible ? (theme.isLight ? '#0f172a' : '#ededed') : (theme.isLight ? '#94a3b8' : '#52525b') }}
                    title="Toggle Layer Visibility"
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* Layer Thumbnail Preview */}
                <div
                  className="w-6 h-6 rounded shrink-0 flex items-center justify-center overflow-hidden border"
                  style={{
                    backgroundColor: theme.isLight ? '#f1f5f9' : '#27272a',
                    borderColor: theme.borderStrong,
                  }}
                >
                  {isGroup ? (
                    layer.collapsed ? <Folder className="w-3.5 h-3.5 text-amber-500" /> : <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                  ) : layer.type === 'adjustment' ? (
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  ) : layer.type === 'vector' ? (
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">V</span>
                  ) : layer.type === 'text' ? (
                    <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold">T</span>
                  ) : (
                    <Layers className="w-3.5 h-3.5" style={{ color: theme.textSecondary }} />
                  )}
                </div>

                {/* Layer Name & Type */}
                <div className="flex flex-col truncate">
                  <span
                    className="truncate font-semibold text-[11px]"
                    style={{ color: theme.textPrimary }}
                  >
                    {layer.name}
                  </span>
                  <span
                    className="text-[10px] capitalize font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    {layer.type} · {layer.blendMode}
                  </span>
                </div>
              </div>

              {/* Layer Actions (Lock) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleLayerLock(layer.id);
                  }}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  style={{ color: layer.locked ? '#f59e0b' : theme.textSecondary }}
                >
                  {layer.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Layer Action Bar */}
      <div
        className="p-2 border-t flex items-center justify-between"
        style={{
          borderColor: theme.border,
          backgroundColor: theme.bgSubtle,
        }}
      >
        <div className="flex items-center gap-1">
          {/* New Raster Layer */}
          <button
            onClick={addLayer}
            title="Create New Raster Layer (Ctrl+Shift+N)"
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            style={{ color: theme.textPrimary }}
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* New Group Folder */}
          <button
            onClick={createLayerGroup}
            title="Create New Group (Ctrl+G)"
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            style={{ color: theme.textPrimary }}
          >
            <FolderPlus className="w-4 h-4" />
          </button>

          {/* New Adjustment Layer */}
          <div className="relative group">
            <button
              title="Add Non-destructive Adjustment Layer (Curves, HSL, Levels)"
              className="p-1 rounded transition-colors"
              style={{ color: theme.isLight ? '#b45309' : '#fbbf24' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <div
              className="absolute bottom-full left-0 mb-1 hidden group-hover:flex flex-col w-48 rounded border shadow-xl py-1 z-30"
              style={{
                backgroundColor: theme.bgPanel,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            >
              <button
                onClick={() => addAdjustmentLayer('curves')}
                className="text-left px-3 py-1 hover:bg-[#0d99ff] hover:text-white"
              >
                Curves...
              </button>
              <button
                onClick={() => addAdjustmentLayer('hsl')}
                className="text-left px-3 py-1 hover:bg-[#0d99ff] hover:text-white"
              >
                Hue / Saturation / Lightness
              </button>
              <button
                onClick={() => addAdjustmentLayer('brightness-contrast')}
                className="text-left px-3 py-1 hover:bg-[#0d99ff] hover:text-white"
              >
                Brightness & Contrast
              </button>
              <button
                onClick={() => addAdjustmentLayer('invert')}
                className="text-left px-3 py-1 hover:bg-[#0d99ff] hover:text-white"
              >
                Invert Filter
              </button>
            </div>
          </div>

          {/* Duplicate Layer */}
          {selectedLayer && (
            <button
              onClick={() => duplicateLayer(selectedLayer.id)}
              title="Duplicate Selected Layer"
              className="p-1 rounded transition-colors"
              style={{ color: theme.textSecondary }}
            >
              <Copy className="w-4 h-4" />
            </button>
          )}

          {/* Merge Down */}
          {selectedLayer && project.layers.findIndex(l => l.id === selectedLayer.id) > 0 && (
            <button
              onClick={() => mergeLayerDown(selectedLayer.id)}
              title="Merge Down (Ctrl+E)"
              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors"
              style={{
                backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.3)',
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
              }}
            >
              Merge
            </button>
          )}
        </div>

        {/* Delete Layer */}
        {selectedLayer && project.layers.length > 1 && (
          <button
            onClick={() => deleteLayer(selectedLayer.id)}
            title="Delete Layer"
            className="p-1 rounded hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
