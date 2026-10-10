import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Layers,
  Sparkles,
  Maximize2,
  CornerDownRight,
  Sliders,
  Check,
} from 'lucide-react';

/* =========================================================================
   AUTHENTIC ADOBE ILLUSTRATOR & AFFINITY GEOMETRY SVG GLYPHS
   ========================================================================= */

// Shape Mode: Unite (Add)
const IconUnite: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M3 7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2H5a2 2 0 0 1-2-2V7z"
      fill="currentColor"
      fillOpacity="0.85"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// Shape Mode: Minus Front (Subtract)
const IconMinusFront: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    {/* Bottom shape with cut out overlap */}
    <path
      d="M3 7a2 2 0 0 1 2-2h8v4h-4v4H3V7z"
      fill="currentColor"
      fillOpacity="0.85"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Front cutting shape (dashed outline) */}
    <rect
      x="9"
      y="9"
      width="10"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="2 2"
      fill="none"
    />
  </svg>
);

// Shape Mode: Intersect
const IconIntersect: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    {/* Outer boundary lines */}
    <rect x="3" y="5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    {/* Intersection fill */}
    <rect x="9" y="9" width="4" height="6" fill="currentColor" fillOpacity="0.9" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Shape Mode: Exclude (XOR)
const IconExclude: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M3 7a2 2 0 0 1 2-2h8v4h-4v4H3V7z"
      fill="currentColor"
      fillOpacity="0.85"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M13 13h6v4a2 2 0 0 1-2 2h-6v-4h2v-2z"
      fill="currentColor"
      fillOpacity="0.85"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <rect x="9" y="9" width="4" height="4" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5" fill="none" />
  </svg>
);

// Pathfinder: Divide
const IconDivide: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="2" y="2" width="9" height="9" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.4" />
    <rect x="7" y="7" width="9" height="9" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.4" />
    <path d="M2 11h9M11 2v9M7 16h9M16 7v9" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" />
  </svg>
);

// Pathfinder: Trim
const IconTrim: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2 3a1 1 0 0 1 1-1h7v5H5v5H2V3z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.2" />
    <rect x="7" y="7" width="9" height="9" rx="1" fill="currentColor" fillOpacity="0.85" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

// Pathfinder: Merge
const IconMerge: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <path
      d="M2 4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2H3a1 1 0 0 1-1-1V4z"
      fill="currentColor"
      fillOpacity="0.75"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  </svg>
);

// Pathfinder: Crop
const IconCrop: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="7" y="7" width="4" height="4" fill="currentColor" fillOpacity="0.9" stroke="currentColor" strokeWidth="1.2" />
    <rect x="2" y="2" width="9" height="9" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <rect x="7" y="7" width="9" height="9" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

// Pathfinder: Outline
const IconOutline: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="2" y="2" width="9" height="9" stroke="currentColor" strokeWidth="1.4" fill="none" />
    <rect x="7" y="7" width="9" height="9" stroke="currentColor" strokeWidth="1.4" fill="none" />
  </svg>
);

// Pathfinder: Minus Back
const IconMinusBack: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="2" y="2" width="9" height="9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
    <path d="M7 11h4v5H7v-5zM11 7h5v9h-5V7z" fill="currentColor" fillOpacity="0.85" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const VectorPathfinderPanel: React.FC = () => {
  const {
    theme,
    applyPathfinderOp,
    vectorCornerRadius,
    setVectorCornerRadius,
    showShortcutFeedback,
    pushHistoryStep,
    selectedShapeIds,
    updateSelectedVectorShapes,
  } = useStudio();

  const [cornerStyle, setCornerStyle] = useState<'round' | 'inverted' | 'chamfer'>('round');
  const [expandHover, setExpandHover] = useState(false);

  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.3)';

  return (
    <div className="p-3 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
        <div>
          <span className="font-bold text-sm block" style={{ color: theme.textPrimary }}>
            Pathfinder
          </span>
          <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>
            Shape Modes & Geometry Operations
          </span>
        </div>
        <span
          className="px-2 py-0.5 rounded border text-[10px] font-semibold font-mono"
          style={{
            backgroundColor: boxBg,
            borderColor: theme.borderStrong,
            color: selectedShapeIds.length >= 2 ? '#10b981' : theme.accent,
          }}
        >
          {selectedShapeIds.length >= 2 ? `${selectedShapeIds.length} Selected` : 'Vector'}
        </span>
      </div>

      {/* =====================================================================
          SECTION 1: SHAPE MODES (UNITE, MINUS FRONT, INTERSECT, EXCLUDE)
          ===================================================================== */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
          <span style={{ color: theme.textSecondary }}>Shape Modes</span>
          <span className="text-[9px] font-mono opacity-60">Alt-click for Compound</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {/* 1. Unite */}
          <button
            onClick={() => {
              applyPathfinderOp('unite');
              showShortcutFeedback('Pathfinder: Unite');
            }}
            title="Unite (Alt-click to create a Compound Shape and add to shape area)"
            className="flex flex-col items-center justify-center p-2 rounded border transition-all hover:border-[#0d99ff] hover:bg-[#0d99ff]/10 group"
            style={{
              backgroundColor: boxBg,
              borderColor: theme.border,
              color: theme.textPrimary,
            }}
          >
            <IconUnite className="w-5 h-5 mb-1 text-sky-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">Unite</span>
          </button>

          {/* 2. Minus Front */}
          <button
            onClick={() => {
              applyPathfinderOp('subtract');
              showShortcutFeedback('Pathfinder: Minus Front');
            }}
            title="Minus Front (Alt-click to create a Compound Shape and subtract from shape area)"
            className="flex flex-col items-center justify-center p-2 rounded border transition-all hover:border-amber-500 hover:bg-amber-500/10 group"
            style={{
              backgroundColor: boxBg,
              borderColor: theme.border,
              color: theme.textPrimary,
            }}
          >
            <IconMinusFront className="w-5 h-5 mb-1 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">Minus Front</span>
          </button>

          {/* 3. Intersect */}
          <button
            onClick={() => {
              applyPathfinderOp('intersect');
              showShortcutFeedback('Pathfinder: Intersect');
            }}
            title="Intersect (Alt-click to create a Compound Shape and intersect shape areas)"
            className="flex flex-col items-center justify-center p-2 rounded border transition-all hover:border-emerald-500 hover:bg-emerald-500/10 group"
            style={{
              backgroundColor: boxBg,
              borderColor: theme.border,
              color: theme.textPrimary,
            }}
          >
            <IconIntersect className="w-5 h-5 mb-1 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">Intersect</span>
          </button>

          {/* 4. Exclude */}
          <button
            onClick={() => {
              applyPathfinderOp('exclude');
              showShortcutFeedback('Pathfinder: Exclude');
            }}
            title="Exclude (Alt-click to create a Compound Shape and exclude overlapping shape areas)"
            className="flex flex-col items-center justify-center p-2 rounded border transition-all hover:border-pink-500 hover:bg-pink-500/10 group"
            style={{
              backgroundColor: boxBg,
              borderColor: theme.border,
              color: theme.textPrimary,
            }}
          >
            <IconExclude className="w-5 h-5 mb-1 text-pink-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">Exclude</span>
          </button>
        </div>

        {/* Expand Button (Standard Illustrator CC button) */}
        <button
          onClick={() => {
            pushHistoryStep('Expand Compound Shape');
            showShortcutFeedback('Expanded Compound Shape into Single Path');
          }}
          onMouseEnter={() => setExpandHover(true)}
          onMouseLeave={() => setExpandHover(false)}
          title="Expand (Commits non-destructive Compound Shape into permanent paths)"
          className="w-full py-1.5 px-3 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          style={{
            backgroundColor: expandHover ? theme.accent : boxBg,
            borderColor: expandHover ? theme.accent : theme.borderStrong,
            color: expandHover ? '#ffffff' : theme.textPrimary,
          }}
        >
          <span>Expand</span>
        </button>
      </div>

      {/* =====================================================================
          SECTION 2: PATHFINDERS (DIVIDE, TRIM, MERGE, CROP, OUTLINE, MINUS BACK)
          ===================================================================== */}
      <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
          <span style={{ color: theme.textSecondary }}>Pathfinders</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {/* Divide */}
          <button
            onClick={() => {
              applyPathfinderOp('divide');
              showShortcutFeedback('Pathfinder: Divide');
            }}
            title="Divide (Separates all overlapping faces into individual distinct paths)"
            className="flex flex-col items-center justify-center p-1.5 rounded border transition-all hover:border-[#0d99ff] hover:bg-[#0d99ff]/5 group"
            style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
          >
            <IconDivide className="w-4 h-4 mb-1 text-sky-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-medium">Divide</span>
          </button>

          {/* Trim */}
          <button
            onClick={() => {
              applyPathfinderOp('subtract');
              showShortcutFeedback('Pathfinder: Trim');
            }}
            title="Trim (Removes hidden overlapping paths under top objects)"
            className="flex flex-col items-center justify-center p-1.5 rounded border transition-all hover:border-[#0d99ff] hover:bg-[#0d99ff]/5 group"
            style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
          >
            <IconTrim className="w-4 h-4 mb-1 text-slate-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-medium">Trim</span>
          </button>

          {/* Merge */}
          <button
            onClick={() => {
              applyPathfinderOp('unite');
              showShortcutFeedback('Pathfinder: Merge');
            }}
            title="Merge (Combines adjacent paths that share the same fill color)"
            className="flex flex-col items-center justify-center p-1.5 rounded border transition-all hover:border-[#0d99ff] hover:bg-[#0d99ff]/5 group"
            style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
          >
            <IconMerge className="w-4 h-4 mb-1 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-medium">Merge</span>
          </button>

          {/* Crop */}
          <button
            onClick={() => {
              applyPathfinderOp('intersect');
              showShortcutFeedback('Pathfinder: Crop');
            }}
            title="Crop (Masks and crops artwork to boundary of top selected object)"
            className="flex flex-col items-center justify-center p-1.5 rounded border transition-all hover:border-[#0d99ff] hover:bg-[#0d99ff]/5 group"
            style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
          >
            <IconCrop className="w-4 h-4 mb-1 text-indigo-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-medium">Crop</span>
          </button>

          {/* Outline */}
          <button
            onClick={() => {
              pushHistoryStep('Outline Paths');
              showShortcutFeedback('Pathfinder: Outline');
            }}
            title="Outline (Converts path boundaries into independent stroked line segments)"
            className="flex flex-col items-center justify-center p-1.5 rounded border transition-all hover:border-[#0d99ff] hover:bg-[#0d99ff]/5 group"
            style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
          >
            <IconOutline className="w-4 h-4 mb-1 text-violet-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-medium">Outline</span>
          </button>

          {/* Minus Back */}
          <button
            onClick={() => {
              applyPathfinderOp('subtract');
              showShortcutFeedback('Pathfinder: Minus Back');
            }}
            title="Minus Back (Subtracts bottom shape from top shape)"
            className="flex flex-col items-center justify-center p-1.5 rounded border transition-all hover:border-[#0d99ff] hover:bg-[#0d99ff]/5 group"
            style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
          >
            <IconMinusBack className="w-4 h-4 mb-1 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-medium">Minus Back</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          SECTION 3: LIVE CORNERS & ROUNDING (AFFINITY / ILLUSTRATOR CC)
          ===================================================================== */}
      <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
          <span style={{ color: theme.textSecondary }}>Live Corners</span>
          <span className="font-mono tabular-nums font-bold" style={{ color: theme.accent }}>
            {vectorCornerRadius} px
          </span>
        </div>

        {/* Corner Type Selector */}
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'round' as const, label: 'Round' },
            { id: 'inverted' as const, label: 'Inverted' },
            { id: 'chamfer' as const, label: 'Chamfer' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => {
                setCornerStyle(type.id);
                showShortcutFeedback(`Corner Style: ${type.label}`);
              }}
              className={`py-1 px-1.5 rounded border text-[11px] font-medium text-center transition-all ${
                cornerStyle === type.id
                  ? 'border-[#0d99ff] bg-[#0d99ff]/15 font-bold text-sky-600 dark:text-sky-400'
                  : 'hover:border-slate-400'
              }`}
              style={{
                backgroundColor: cornerStyle === type.id ? undefined : boxBg,
                borderColor: cornerStyle === type.id ? '#0d99ff' : theme.border,
                color: cornerStyle === type.id ? undefined : theme.textPrimary,
              }}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={vectorCornerRadius}
            onChange={e => {
              const r = parseInt(e.target.value) || 0;
              setVectorCornerRadius(r);
              updateSelectedVectorShapes({ cornerRadius: r });
            }}
            className={`w-full accent-[#0d99ff] h-1.5 rounded cursor-pointer ${theme.isLight ? 'bg-slate-300' : 'bg-black/40'}`}
          />
          <input
            type="number"
            min="0"
            max="200"
            value={vectorCornerRadius}
            onChange={e => {
              const r = parseInt(e.target.value) || 0;
              setVectorCornerRadius(r);
              updateSelectedVectorShapes({ cornerRadius: r });
            }}
            className="w-14 px-1.5 py-0.5 rounded border text-xs font-mono font-bold text-center"
            style={{
              backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.4)',
              borderColor: theme.borderStrong,
              color: theme.textPrimary,
            }}
          />
        </div>
      </div>

      {/* =====================================================================
          SECTION 4: COMPOUND PATHS & EXPANSION
          ===================================================================== */}
      <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
          Compound Paths
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              applyPathfinderOp('exclude');
              showShortcutFeedback('Compound Path: Make (Cmd+8)');
            }}
            className="px-2 py-1.5 rounded border text-left flex items-center justify-between transition-colors hover:border-[#0d99ff]"
            style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
          >
            <span className="font-semibold text-xs">Make</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/10 dark:bg-white/10 opacity-70">⌘8</span>
          </button>

          <button
            onClick={() => {
              pushHistoryStep('Release Compound Path');
              showShortcutFeedback('Compound Path: Release (⌥⌘8)');
            }}
            className="px-2 py-1.5 rounded border text-left flex items-center justify-between transition-colors hover:border-[#0d99ff]"
            style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
          >
            <span className="font-semibold text-xs">Release</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/10 dark:bg-white/10 opacity-70">⌥⌘8</span>
          </button>
        </div>

        <div className="space-y-1 pt-1">
          <button
            onClick={() => {
              pushHistoryStep('Outline Stroke');
              showShortcutFeedback('Outlined Stroke to Fill Shape');
            }}
            className="w-full text-left px-2.5 py-1.5 rounded border flex justify-between items-center transition-colors hover:bg-[#0d99ff] hover:text-white group"
            style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
          >
            <span className="font-medium">Outline Stroke</span>
            <CornerDownRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </button>

          <button
            onClick={() => {
              pushHistoryStep('Offset Path (+8 pt)');
              showShortcutFeedback('Offset Path (+8 pt)');
            }}
            className="w-full text-left px-2.5 py-1.5 rounded border flex justify-between items-center transition-colors hover:bg-[#0d99ff] hover:text-white group"
            style={{ backgroundColor: boxBg, borderColor: theme.border, color: theme.textPrimary }}
          >
            <span className="font-medium">Offset Path...</span>
            <Maximize2 className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </button>
        </div>
      </div>
    </div>
  );
};
