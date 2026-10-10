import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Link,
  Unlink,
} from 'lucide-react';

/* =========================================================================
   AUTHENTIC INDESIGN CC TEXT WRAP SVG ICONS
   ========================================================================= */

// No text wrap: text lines pass straight behind/through box
const IconWrapNone: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="3" y1="5" x2="21" y2="5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" />
    <rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="13" x2="21" y2="13" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
    <line x1="3" y1="17" x2="21" y2="17" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
    <line x1="3" y1="21" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Wrap around bounding box
const IconWrapBox: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="3" y1="4" x2="21" y2="4" stroke="currentColor" strokeWidth="1.5" />
    <rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
    <rect x="5.5" y="5.5" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" />
    <line x1="3" y1="9" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" />
    <line x1="19" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="15" x2="5" y2="15" stroke="currentColor" strokeWidth="1.5" />
    <line x1="19" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="20" x2="21" y2="20" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Wrap around object shape (contour)
const IconWrapContour: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="3" y1="4" x2="21" y2="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" />
    <line x1="3" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.5" />
    <line x1="18" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="16" x2="6" y2="16" stroke="currentColor" strokeWidth="1.5" />
    <line x1="18" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="20" x2="21" y2="20" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Jump object
const IconWrapJump: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="3" y1="4" x2="21" y2="4" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="7" x2="21" y2="7" stroke="currentColor" strokeWidth="1.5" />
    <rect x="6" y="9.5" width="12" height="7" rx="1" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="19" x2="21" y2="19" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="22" x2="21" y2="22" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Jump to next column
const IconWrapJumpCol: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="3" y1="4" x2="21" y2="4" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="7" x2="21" y2="7" stroke="currentColor" strokeWidth="1.5" />
    <rect x="4" y="10" width="16" height="11" rx="1" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const PublishTextWrapPanel: React.FC = () => {
  const {
    theme,
    publishTextWrapMode,
    setPublishTextWrapMode,
    showShortcutFeedback,
    updateSelectedPublishFrames,
  } = useStudio();

  const [topOffset, setTopOffset] = useState(3);
  const [bottomOffset, setBottomOffset] = useState(3);
  const [leftOffset, setLeftOffset] = useState(3);
  const [rightOffset, setRightOffset] = useState(3);
  const [isLinked, setIsLinked] = useState(true);
  const [invert, setInvert] = useState(false);
  const [contourOption, setContourOption] = useState<'bbox' | 'detect' | 'alpha'>('bbox');

  const updateOffset = (key: 'top' | 'bottom' | 'left' | 'right', val: number) => {
    let t = topOffset, b = bottomOffset, l = leftOffset, r = rightOffset;
    if (isLinked) {
      setTopOffset(val);
      setBottomOffset(val);
      setLeftOffset(val);
      setRightOffset(val);
      t = val; b = val; l = val; r = val;
    } else {
      if (key === 'top') { setTopOffset(val); t = val; }
      if (key === 'bottom') { setBottomOffset(val); b = val; }
      if (key === 'left') { setLeftOffset(val); l = val; }
      if (key === 'right') { setRightOffset(val); r = val; }
    }
    updateSelectedPublishFrames({ wrapMargin: { top: t, bottom: b, left: l, right: r } });
  };

  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.25)';
  const inputBg = theme.isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.4)';

  const wrapButtons = [
    { id: 'none' as const, label: 'No Wrap', icon: <IconWrapNone />, title: 'No Text Wrap' },
    { id: 'box' as const, label: 'Wrap Box', icon: <IconWrapBox />, title: 'Wrap Around Bounding Box' },
    { id: 'contour' as const, label: 'Contour', icon: <IconWrapContour />, title: 'Wrap Around Object Shape' },
    { id: 'jump' as const, label: 'Jump', icon: <IconWrapJump />, title: 'Jump Object' },
    { id: 'jump-col' as const, label: 'Next Col', icon: <IconWrapJumpCol />, title: 'Jump to Next Column' },
  ];

  return (
    <div className="flex flex-col h-full text-xs select-none overflow-y-auto scrollbar-thin p-3 space-y-3.5">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
        <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>
          Text Wrap
        </span>
        <span className="text-[10px] font-mono opacity-70" style={{ color: theme.textSecondary }}>
          InDesign Runaround
        </span>
      </div>

      {/* =====================================================================
          ICON ROW: WRAP MODES
          ===================================================================== */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
          Wrap Mode
        </div>

        <div className="flex items-center justify-between gap-1 p-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
          {wrapButtons.map(btn => {
            const isActive = publishTextWrapMode === btn.id || (btn.id === 'jump-col' && publishTextWrapMode === 'jump');
            return (
              <button
                key={btn.id}
                onClick={() => {
                  const m = btn.id === 'jump-col' ? 'jump' : btn.id;
                  setPublishTextWrapMode(m);
                  updateSelectedPublishFrames({ wrapMode: m });
                  showShortcutFeedback(`Text Wrap: ${btn.title}`);
                }}
                title={btn.title}
                className={`flex-1 p-2 flex flex-col items-center justify-center rounded transition-all group ${
                  isActive
                    ? 'bg-[#0d99ff] text-white shadow-xs'
                    : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  {btn.icon}
                </div>
                <span className="text-[9px] font-bold leading-none">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          INSET MARGIN OFFSETS (Top, Bottom, Left, Right + Chain Link)
          ===================================================================== */}
      {publishTextWrapMode !== 'none' && (
        <div className="space-y-2 pt-1 border-t" style={{ borderColor: theme.border }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
              Offsets (mm)
            </span>
            <button
              onClick={() => setIsLinked(!isLinked)}
              title={isLinked ? 'Offsets Linked' : 'Offsets Unlinked'}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-500"
            >
              {isLinked ? <Link className="w-3.5 h-3.5 text-sky-500" /> : <Unlink className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Top Offset:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={topOffset}
                  onChange={e => updateOffset('top', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-0.5 rounded border text-xs font-mono font-bold"
                  style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                />
                <span className="text-[10px] font-mono opacity-60">mm</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Bottom Offset:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={bottomOffset}
                  onChange={e => updateOffset('bottom', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-0.5 rounded border text-xs font-mono font-bold"
                  style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                />
                <span className="text-[10px] font-mono opacity-60">mm</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Left Offset:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={leftOffset}
                  onChange={e => updateOffset('left', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-0.5 rounded border text-xs font-mono font-bold"
                  style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                />
                <span className="text-[10px] font-mono opacity-60">mm</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Right Offset:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={rightOffset}
                  onChange={e => updateOffset('right', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-0.5 rounded border text-xs font-mono font-bold"
                  style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                />
                <span className="text-[10px] font-mono opacity-60">mm</span>
              </div>
            </div>
          </div>

          {/* Contour Options & Invert */}
          <div className="space-y-1.5 pt-1">
            <div className="space-y-0.5">
              <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Contour Options:</span>
              <select
                value={contourOption}
                onChange={e => setContourOption(e.target.value as any)}
                className="w-full px-2 py-1 rounded border text-xs font-medium"
                style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              >
                <option value="bbox">Same as Clipping / Bounding Box</option>
                <option value="detect">Detect Edges (Photoshop Path)</option>
                <option value="alpha">Alpha Channel (Transparency)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={invert}
                onChange={e => setInvert(e.target.checked)}
                className="rounded accent-[#0d99ff]"
              />
              <span className="text-[11px] font-medium" style={{ color: theme.textSecondary }}>Invert Text Wrap</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
