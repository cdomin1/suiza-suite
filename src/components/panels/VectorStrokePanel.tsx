import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  SlidersHorizontal,
  Minus,
  Check,
  Eye,
  Plus,
  Trash2,
  Square,
  Circle,
  CornerDownRight,
  ArrowRight,
} from 'lucide-react';

export const VectorStrokePanel: React.FC = () => {
  const {
    theme,
    vectorStroke,
    setVectorStroke,
    vectorStrokeWidth,
    setVectorStrokeWidth,
    vectorStrokeStyle,
    setVectorStrokeStyle,
    vectorFill,
    setVectorFill,
    selectedLayer,
    updateSelectedVectorShapes,
  } = useStudio();

  const handleUpdateWidth = (w: number) => {
    setVectorStrokeWidth(w);
    updateSelectedVectorShapes({ strokeWidth: w });
  };

  const [cap, setCap] = useState<'butt' | 'round' | 'square'>('round');
  const [join, setJoin] = useState<'miter' | 'round' | 'bevel'>('round');
  const [isDashed, setIsDashed] = useState(vectorStrokeStyle === 'dashed');
  const [dashLength, setDashLength] = useState(12);
  const [gapLength, setGapLength] = useState(6);
  const [strokeAlign, setStrokeAlign] = useState<'center' | 'inside' | 'outside'>('center');

  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.3)';

  return (
    <div className="p-3 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
        <div>
          <span className="font-bold text-sm block" style={{ color: theme.textPrimary }}>
            Stroke & Appearance
          </span>
          <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>
            Bézier Contour Weights & Caps
          </span>
        </div>
        <span
          className="font-mono text-xs font-bold px-2 py-0.5 rounded border"
          style={{
            backgroundColor: boxBg,
            borderColor: theme.borderStrong,
            color: theme.accent,
          }}
        >
          {vectorStrokeWidth} pt
        </span>
      </div>

      {/* WEIGHT CONTROLS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
          <span style={{ color: theme.textSecondary }}>Stroke Weight</span>
          <span className="font-mono tabular-nums font-bold" style={{ color: theme.textPrimary }}>
            {vectorStrokeWidth} pt
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0.5"
            max="64"
            step="0.5"
            value={vectorStrokeWidth}
            onChange={e => handleUpdateWidth(parseFloat(e.target.value) || 1)}
            className={`w-full accent-[#0d99ff] h-1.5 rounded cursor-pointer ${theme.isLight ? 'bg-slate-300' : 'bg-black/40'}`}
          />
          <input
            type="number"
            min="0.25"
            max="200"
            step="0.5"
            value={vectorStrokeWidth}
            onChange={e => handleUpdateWidth(parseFloat(e.target.value) || 1)}
            className="w-14 px-1 py-0.5 rounded border text-xs font-mono font-bold text-center"
            style={{
              backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.4)',
              borderColor: theme.borderStrong,
              color: theme.textPrimary,
            }}
          />
        </div>

        {/* Quick weight presets */}
        <div className="flex items-center gap-1 pt-1">
          {[0.5, 1, 2, 4, 8, 16, 24].map(w => (
            <button
              key={w}
              onClick={() => handleUpdateWidth(w)}
              className={`flex-1 py-0.5 rounded text-[10px] font-mono font-semibold border transition-colors ${
                vectorStrokeWidth === w
                  ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                  : theme.isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-black/30 hover:bg-white/10 border-white/10 text-neutral-300'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* CAP & JOIN CONTROLS */}
      <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
        <div className="grid grid-cols-2 gap-3">
          {/* Cap */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: theme.textSecondary }}>
              Cap End
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(['butt', 'round', 'square'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCap(c)}
                  className={`py-1 rounded text-[10px] font-semibold capitalize border transition-colors ${
                    cap === c
                      ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                      : theme.isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-800'
                      : 'bg-black/30 border-white/10 text-neutral-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Join */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: theme.textSecondary }}>
              Corner Join
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(['miter', 'round', 'bevel'] as const).map(j => (
                <button
                  key={j}
                  onClick={() => setJoin(j)}
                  className={`py-1 rounded text-[10px] font-semibold capitalize border transition-colors ${
                    join === j
                      ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                      : theme.isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-800'
                      : 'bg-black/30 border-white/10 text-neutral-300'
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STROKE ALIGNMENT */}
      <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
        <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: theme.textSecondary }}>
          Stroke Alignment
        </span>
        <div className="grid grid-cols-3 gap-1">
          {(['center', 'inside', 'outside'] as const).map(a => (
            <button
              key={a}
              onClick={() => setStrokeAlign(a)}
              className={`py-1.5 rounded text-xs font-semibold capitalize border transition-colors ${
                strokeAlign === a
                  ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                  : theme.isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-black/30 border-white/10 text-neutral-300'
              }`}
            >
              Align {a}
            </button>
          ))}
        </div>
      </div>

      {/* DASHED LINE SETTINGS */}
      <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-xs" style={{ color: theme.textPrimary }}>
            <input
              type="checkbox"
              checked={isDashed}
              onChange={e => {
                setIsDashed(e.target.checked);
                setVectorStrokeStyle(e.target.checked ? 'dashed' : 'solid');
              }}
              className="accent-[#0d99ff] w-3.5 h-3.5 rounded cursor-pointer"
            />
            <span>Dashed Stroke Pattern</span>
          </label>
        </div>

        {isDashed && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold" style={{ color: theme.textSecondary }}>Dash (pt):</span>
              <input
                type="number"
                min="1"
                max="100"
                value={dashLength}
                onChange={e => setDashLength(parseInt(e.target.value) || 12)}
                className="w-full px-2 py-1 rounded border text-xs font-mono font-bold"
                style={{
                  backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.4)',
                  borderColor: theme.borderStrong,
                  color: theme.textPrimary,
                }}
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-semibold" style={{ color: theme.textSecondary }}>Gap (pt):</span>
              <input
                type="number"
                min="1"
                max="100"
                value={gapLength}
                onChange={e => setGapLength(parseInt(e.target.value) || 6)}
                className="w-full px-2 py-1 rounded border text-xs font-mono font-bold"
                style={{
                  backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.4)',
                  borderColor: theme.borderStrong,
                  color: theme.textPrimary,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* APPEARANCE STACK (ILLUSTRATOR CC STYLE) */}
      <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
          <span style={{ color: theme.textSecondary }}>Appearance Stack</span>
          <span className="text-[9px] font-mono" style={{ color: theme.textMuted }}>Live Stack</span>
        </div>

        <div className="space-y-1">
          {/* Stroke item */}
          <div
            className="flex items-center justify-between p-2 rounded border"
            style={{
              backgroundColor: boxBg,
              borderColor: theme.border,
            }}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-sky-500" />
              <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: vectorStroke, borderColor: theme.borderStrong }} />
              <span className="font-semibold text-xs" style={{ color: theme.textPrimary }}>Stroke: {vectorStrokeWidth}pt</span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold" style={{ color: theme.textSecondary }}>{vectorStroke}</span>
          </div>

          {/* Fill item */}
          <div
            className="flex items-center justify-between p-2 rounded border"
            style={{
              backgroundColor: boxBg,
              borderColor: theme.border,
            }}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-sky-500" />
              <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: vectorFill, borderColor: theme.borderStrong }} />
              <span className="font-semibold text-xs" style={{ color: theme.textPrimary }}>Solid Fill</span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold" style={{ color: theme.textSecondary }}>{vectorFill}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
