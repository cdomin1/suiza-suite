import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Palette, Plus, Droplets, Check, Sparkles, RefreshCw } from 'lucide-react';

const DEFAULT_SWATCHES = [
  { name: 'None / Transparent', color: 'transparent', isNone: true },
  { name: 'Paper White', color: '#ffffff' },
  { name: 'Rich Black (C:60 M:40 Y:40 K:100)', color: '#090a0f' },
  { name: 'Process Cyan', color: '#00a3e0' },
  { name: 'Process Magenta', color: '#e4007c' },
  { name: 'Process Yellow', color: '#fed100' },
  { name: 'Process Black', color: '#000000' },
  { name: 'Suiza Blue', color: '#0d99ff' },
  { name: 'Vibrant Amber', color: '#f59e0b' },
  { name: 'Alpine Pine', color: '#10b981' },
  { name: 'Editorial Rose', color: '#ec4899' },
  { name: 'Deep Indigo', color: '#6366f1' },
  { name: 'Pantone 286 C', color: '#0033a0' },
  { name: 'Pantone 186 C', color: '#c8102e' },
  { name: 'Pantone 368 C', color: '#78be20' },
  { name: 'Warm Gray 1', color: '#d7d2cb' },
];

export const VectorSwatchesPanel: React.FC = () => {
  const {
    theme,
    vectorFill,
    setVectorFill,
    vectorStroke,
    setVectorStroke,
    project,
    setColorMode,
    updateSelectedVectorShapes,
  } = useStudio();

  const [activeTarget, setActiveTarget] = useState<'fill' | 'stroke'>('fill');
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientAngle, setGradientAngle] = useState(45);
  const [swatches, setSwatches] = useState(DEFAULT_SWATCHES);
  const [customColor, setCustomColor] = useState('#0d99ff');

  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.3)';

  const handleSelectSwatch = (color: string) => {
    if (activeTarget === 'fill') {
      setVectorFill(color);
      updateSelectedVectorShapes({ fill: color });
    } else {
      setVectorStroke(color);
      updateSelectedVectorShapes({ stroke: color });
    }
  };

  const handleAddCustomSwatch = () => {
    setSwatches(prev => [...prev, { name: `Custom ${prev.length + 1}`, color: customColor }]);
  };

  return (
    <div className="p-3 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
        <div>
          <span className="font-bold text-sm block" style={{ color: theme.textPrimary }}>
            Swatches & Gradients
          </span>
          <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>
            CMYK Process Plates · Pantone PMS
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
          <span className="px-1.5 py-0.5 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.borderStrong, color: theme.accent }}>
            {project.colorMode}
          </span>
        </div>
      </div>

      {/* TARGET SWITCHER (FILL vs STROKE) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTarget('fill')}
          className={`flex items-center gap-2 p-2 rounded border transition-all ${
            activeTarget === 'fill'
              ? 'border-[#0d99ff] ring-2 ring-[#0d99ff]/20 font-bold'
              : 'border-transparent opacity-80'
          }`}
          style={{ backgroundColor: boxBg, color: theme.textPrimary }}
        >
          <div
            className="w-5 h-5 rounded-sm border-2 shadow-xs"
            style={{
              backgroundColor: vectorFill,
              borderColor: theme.isLight ? '#0f172a' : '#ffffff',
            }}
          />
          <div className="text-left">
            <span className="text-[10px] block opacity-70">Target:</span>
            <span className="text-xs">Fill Color</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTarget('stroke')}
          className={`flex items-center gap-2 p-2 rounded border transition-all ${
            activeTarget === 'stroke'
              ? 'border-[#0d99ff] ring-2 ring-[#0d99ff]/20 font-bold'
              : 'border-transparent opacity-80'
          }`}
          style={{ backgroundColor: boxBg, color: theme.textPrimary }}
        >
          <div
            className="w-5 h-5 rounded-sm border-2 shadow-xs"
            style={{
              backgroundColor: vectorStroke,
              borderColor: theme.isLight ? '#0f172a' : '#ffffff',
            }}
          />
          <div className="text-left">
            <span className="text-[10px] block opacity-70">Target:</span>
            <span className="text-xs">Stroke Color</span>
          </div>
        </button>
      </div>

      {/* SWATCH PALETTE GRID */}
      <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
          <span style={{ color: theme.textSecondary }}>Standard Swatch Library</span>
          <span className="text-[9px] font-mono" style={{ color: theme.textMuted }}>{swatches.length} Colors</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {swatches.map((swatch, idx) => {
            const isSelected = (activeTarget === 'fill' ? vectorFill : vectorStroke) === swatch.color;
            return (
              <button
                key={idx}
                onClick={() => handleSelectSwatch(swatch.color)}
                title={swatch.name}
                className={`h-8 rounded border relative flex items-center justify-center transition-transform hover:scale-105 ${
                  isSelected ? 'ring-2 ring-[#0d99ff] border-[#0d99ff] z-10' : ''
                }`}
                style={{
                  backgroundColor: swatch.isNone ? '#ffffff' : swatch.color,
                  borderColor: theme.borderStrong,
                }}
              >
                {swatch.isNone && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-rose-500 rotate-45" />
                  </div>
                )}
                {isSelected && (
                  <Check className={`w-3.5 h-3.5 ${swatch.color === '#ffffff' || swatch.isNone ? 'text-black' : 'text-white'} drop-shadow`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ADD CUSTOM COLOR SWATCH */}
      <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
          Add Custom Ink Swatch
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded border overflow-hidden shrink-0" style={{ borderColor: theme.borderStrong }}>
            <input
              type="color"
              value={customColor}
              onChange={e => setCustomColor(e.target.value)}
              className="w-full h-full cursor-pointer p-0 border-0"
            />
          </div>
          <input
            type="text"
            value={customColor}
            onChange={e => setCustomColor(e.target.value)}
            className="flex-1 px-2 py-1 rounded border text-xs font-mono font-bold uppercase"
            style={{
              backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.4)',
              borderColor: theme.borderStrong,
              color: theme.textPrimary,
            }}
          />
          <button
            onClick={handleAddCustomSwatch}
            className="px-2.5 py-1 rounded bg-[#0d99ff] hover:bg-sky-500 text-white font-semibold flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* GRADIENT SYNTHESIZER */}
      <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
          <span style={{ color: theme.textSecondary }}>Gradient Studio</span>
          <span className="text-[9px] font-mono" style={{ color: theme.textMuted }}>Bézier Shading</span>
        </div>

        {/* Gradient Preview Bar */}
        <div
          className="h-7 w-full rounded border shadow-inner"
          style={{
            background: `linear-gradient(${gradientAngle}deg, ${vectorFill}, ${vectorStroke})`,
            borderColor: theme.borderStrong,
          }}
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setGradientType('linear')}
            className={`py-1 rounded text-xs font-semibold border transition-colors ${
              gradientType === 'linear'
                ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                : theme.isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-black/30 border-white/10 text-neutral-300'
            }`}
          >
            Linear
          </button>
          <button
            onClick={() => setGradientType('radial')}
            className={`py-1 rounded text-xs font-semibold border transition-colors ${
              gradientType === 'radial'
                ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                : theme.isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-black/30 border-white/10 text-neutral-300'
            }`}
          >
            Radial
          </button>
        </div>

        {/* Angle Slider */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] font-semibold w-10" style={{ color: theme.textSecondary }}>Angle:</span>
          <input
            type="range"
            min="0"
            max="360"
            value={gradientAngle}
            onChange={e => setGradientAngle(parseInt(e.target.value) || 0)}
            className={`flex-1 accent-[#0d99ff] h-1.5 rounded cursor-pointer ${theme.isLight ? 'bg-slate-300' : 'bg-black/40'}`}
          />
          <span className="font-mono text-[10px] font-bold w-9 text-right" style={{ color: theme.textPrimary }}>
            {gradientAngle}°
          </span>
        </div>
      </div>
    </div>
  );
};
