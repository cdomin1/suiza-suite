import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { Sliders, Sun, Palette, Activity } from 'lucide-react';

export const AdjustmentsPanel: React.FC = () => {
  const {
    selectedLayer,
    updateLayerAdjustment,
    cmykColor,
    project,
    setColorMode,
    addAdjustmentLayer,
    theme,
  } = useStudio();

  const values = selectedLayer?.adjustmentValues || {};

  return (
    <div className="p-3 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
      {/* Color Mode Switcher */}
      <div className="space-y-1.5 pb-2 border-b" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
          <span style={{ color: theme.textSecondary }}>Working Color Space</span>
          <span className="font-mono font-bold" style={{ color: theme.accent }}>{project.colorMode}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setColorMode('RGB')}
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
              project.colorMode === 'RGB'
                ? 'bg-[#0d99ff] text-white shadow-xs'
                : theme.isLight
                ? 'bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
                : 'bg-black/30 border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            sRGB IEC61966
          </button>
          <button
            onClick={() => setColorMode('CMYK')}
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
              project.colorMode === 'CMYK'
                ? 'bg-amber-600 text-white shadow-xs'
                : theme.isLight
                ? 'bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
                : 'bg-black/30 border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            CMYK FOGRA39
          </button>
        </div>
      </div>

      {/* CMYK INK DENSITY CHANNELS */}
      <div className="space-y-2 pb-2 border-b" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
          <span style={{ color: theme.textSecondary }}>Offset Ink Densities</span>
          <span className="text-[9px] font-mono font-bold" style={{ color: theme.textMuted }}>
            Total: {cmykColor.c + cmykColor.m + cmykColor.y + cmykColor.k}%
          </span>
        </div>

        {/* Cyan */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-cyan-600 dark:text-cyan-400">Cyan (C)</span>
            <span className="font-mono tabular-nums font-bold" style={{ color: theme.textPrimary }}>{cmykColor.c}%</span>
          </div>
          <div className="h-2 w-full rounded overflow-hidden" style={{ backgroundColor: theme.isLight ? '#e2e8f0' : 'rgba(0,0,0,0.4)' }}>
            <div className="h-full bg-cyan-500 transition-all" style={{ width: `${cmykColor.c}%` }} />
          </div>
        </div>

        {/* Magenta */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-pink-600 dark:text-pink-400">Magenta (M)</span>
            <span className="font-mono tabular-nums font-bold" style={{ color: theme.textPrimary }}>{cmykColor.m}%</span>
          </div>
          <div className="h-2 w-full rounded overflow-hidden" style={{ backgroundColor: theme.isLight ? '#e2e8f0' : 'rgba(0,0,0,0.4)' }}>
            <div className="h-full bg-pink-500 transition-all" style={{ width: `${cmykColor.m}%` }} />
          </div>
        </div>

        {/* Yellow */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-amber-600 dark:text-amber-400">Yellow (Y)</span>
            <span className="font-mono tabular-nums font-bold" style={{ color: theme.textPrimary }}>{cmykColor.y}%</span>
          </div>
          <div className="h-2 w-full rounded overflow-hidden" style={{ backgroundColor: theme.isLight ? '#e2e8f0' : 'rgba(0,0,0,0.4)' }}>
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${cmykColor.y}%` }} />
          </div>
        </div>

        {/* Key / Black */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="font-bold" style={{ color: theme.textPrimary }}>Black (K)</span>
            <span className="font-mono tabular-nums font-bold" style={{ color: theme.textPrimary }}>{cmykColor.k}%</span>
          </div>
          <div className="h-2 w-full rounded overflow-hidden" style={{ backgroundColor: theme.isLight ? '#e2e8f0' : 'rgba(0,0,0,0.4)' }}>
            <div className="h-full bg-neutral-800 dark:bg-neutral-200 transition-all" style={{ width: `${cmykColor.k}%` }} />
          </div>
        </div>
      </div>

      {/* CURVES ADJUSTMENT (Interactive graph simulation) */}
      <div className="space-y-2 pb-2 border-b" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
          <span style={{ color: theme.textSecondary }}>Tone Curve (RGB Master)</span>
          <button
            onClick={() => addAdjustmentLayer('curves')}
            className="text-[10px] font-bold hover:underline"
            style={{ color: theme.accent }}
          >
            + Add Layer
          </button>
        </div>

        {/* Tone Curve Box */}
        <div
          className="w-full h-28 rounded border relative overflow-hidden flex items-center justify-center p-2"
          style={{
            backgroundColor: theme.isLight ? '#0f172a' : '#171717',
            borderColor: theme.borderStrong,
          }}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="border-r border-b border-white/40" />
            ))}
          </div>

          {/* Diagonal Reference line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
            <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
            {/* Tone Spline Curve */}
            <path
              d="M 0 100 Q 30 70, 50 48 T 100 0"
              fill="none"
              stroke="#0d99ff"
              strokeWidth="2.5"
            />
            {/* Control points */}
            <circle cx="28" cy="74" r="3.5" fill="#ffffff" stroke="#0d99ff" strokeWidth="2" />
            <circle cx="50" cy="48" r="3.5" fill="#ffffff" stroke="#0d99ff" strokeWidth="2" />
            <circle cx="78" cy="22" r="3.5" fill="#ffffff" stroke="#0d99ff" strokeWidth="2" />
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center font-bold" style={{ color: theme.textSecondary }}>
          <div>Shadows: +12</div>
          <div>Midtones: +5</div>
          <div>Highlights: -8</div>
        </div>
      </div>

      {/* HUE / SATURATION / LIGHTNESS */}
      <div className="space-y-3 pb-2 border-b" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
          <span style={{ color: theme.textSecondary }}>Hue / Saturation / Lightness</span>
        </div>

        {/* Hue */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="font-semibold" style={{ color: theme.textSecondary }}>Hue</span>
            <span className="font-mono tabular-nums font-bold" style={{ color: theme.textPrimary }}>{values.hue || 0}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            value={values.hue || 0}
            onChange={e => {
              if (selectedLayer) updateLayerAdjustment(selectedLayer.id, { hue: parseInt(e.target.value) || 0 });
            }}
            className="w-full accent-[#0d99ff] h-1.5 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded cursor-pointer"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="font-semibold" style={{ color: theme.textSecondary }}>Saturation</span>
            <span className="font-mono tabular-nums font-bold" style={{ color: theme.textPrimary }}>{values.saturation || 0}%</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={values.saturation || 0}
            onChange={e => {
              if (selectedLayer) updateLayerAdjustment(selectedLayer.id, { saturation: parseInt(e.target.value) || 0 });
            }}
            className={`w-full accent-[#0d99ff] h-1.5 rounded cursor-pointer ${theme.isLight ? 'bg-slate-300' : 'bg-black/40'}`}
          />
        </div>

        {/* Lightness */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="font-semibold" style={{ color: theme.textSecondary }}>Lightness</span>
            <span className="font-mono tabular-nums font-bold" style={{ color: theme.textPrimary }}>{values.lightness || 0}%</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={values.lightness || 0}
            onChange={e => {
              if (selectedLayer) updateLayerAdjustment(selectedLayer.id, { lightness: parseInt(e.target.value) || 0 });
            }}
            className={`w-full accent-[#0d99ff] h-1.5 rounded cursor-pointer ${theme.isLight ? 'bg-slate-300' : 'bg-black/40'}`}
          />
        </div>
      </div>
    </div>
  );
};
