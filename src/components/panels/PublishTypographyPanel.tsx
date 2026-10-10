import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Check,
  ChevronDown,
} from 'lucide-react';

const PARAGRAPH_STYLES = [
  { id: 'body', name: '[Basic Paragraph]', font: 'Merriweather', size: 10.5, leading: 14.5 },
  { id: 'h1', name: 'Headline Display', font: 'Playfair Display', size: 36, leading: 42 },
  { id: 'h2', name: 'Section Subhead', font: 'Helvetica Neue', size: 18, leading: 22 },
  { id: 'pullquote', name: 'Featured Pull Quote', font: 'Playfair Display', size: 20, leading: 26 },
  { id: 'caption', name: 'Photo & Graphic Caption', font: 'Inter', size: 8.5, leading: 11 },
];

export const PublishTypographyPanel: React.FC = () => {
  const {
    theme,
    toolOptions,
    setToolOption,
    publishParagraphStyle,
    setPublishParagraphStyle,
    showShortcutFeedback,
    pushHistoryStep,
    updateSelectedPublishFrames,
  } = useStudio();

  // Character formatting states
  const [fontStyle, setFontStyle] = useState<'regular' | 'bold' | 'italic'>('regular');
  const [leadingAuto, setLeadingAuto] = useState(true);
  const [leadingVal, setLeadingVal] = useState(Math.round(toolOptions.fontSize * 1.25));
  const [kerningMode, setKerningMode] = useState<'metrics' | 'optical' | '0'>('metrics');
  const [trackingVal, setTrackingVal] = useState(0);

  // Character toggles (All Caps, Small Caps, Superscript, Subscript, Underline, Strikethrough)
  const [allCaps, setAllCaps] = useState(false);
  const [smallCaps, setSmallCaps] = useState(false);
  const [superscript, setSuperscript] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strikethrough, setStrikethrough] = useState(false);

  // Paragraph formatting states
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [firstLineIndent, setFirstLineIndent] = useState(12);
  const [leftIndent, setLeftIndent] = useState(0);
  const [rightIndent, setRightIndent] = useState(0);
  const [spaceBefore, setSpaceBefore] = useState(0);
  const [spaceAfter, setSpaceAfter] = useState(6);
  const [dropCapLines, setDropCapLines] = useState(3);
  const [dropCapChars, setDropCapChars] = useState(1);
  const [hyphenate, setHyphenate] = useState(true);

  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.25)';
  const inputBg = theme.isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.4)';

  return (
    <div className="flex flex-col h-full text-xs select-none overflow-y-auto scrollbar-thin p-3 space-y-3.5">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
        <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>
          Character & Paragraph
        </span>
        <span className="text-[10px] font-mono opacity-70" style={{ color: theme.textSecondary }}>
          InDesign Typography
        </span>
      </div>

      {/* =====================================================================
          PARAGRAPH STYLES PICKER (Top Selector)
          ===================================================================== */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: theme.textSecondary }}>
          Paragraph Style
        </label>
        <select
          value={publishParagraphStyle}
          onChange={e => {
            const found = PARAGRAPH_STYLES.find(p => p.name === e.target.value);
            if (found) {
              setPublishParagraphStyle(found.name);
              setToolOption('fontFamily', found.font);
              setToolOption('fontSize', found.size);
              setLeadingVal(found.leading);
              showShortcutFeedback(`Applied: ${found.name}`);
            }
          }}
          className="w-full px-2 py-1.5 rounded border text-xs font-semibold"
          style={{
            backgroundColor: inputBg,
            borderColor: theme.borderStrong,
            color: theme.textPrimary,
          }}
        >
          {PARAGRAPH_STYLES.map(p => (
            <option key={p.id} value={p.name}>
              {p.name} ({p.font})
            </option>
          ))}
        </select>
      </div>

      {/* =====================================================================
          CHARACTER FORMATTING CONTROLS
          ===================================================================== */}
      <div className="space-y-2 pt-1 border-t" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
          Character
        </div>

        {/* Font Family & Weight */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="col-span-2 space-y-0.5">
            <select
              value={toolOptions.fontFamily}
              onChange={e => {
                const ff = e.target.value;
                setToolOption('fontFamily', ff);
                updateSelectedPublishFrames({ fontFamily: ff });
              }}
              className="w-full px-2 py-1 rounded border text-xs font-medium"
              style={{
                backgroundColor: inputBg,
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
              }}
            >
              <option value="Merriweather">Merriweather</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Helvetica Neue">Helvetica Neue</option>
              <option value="Inter">Inter</option>
              <option value="Cinzel">Cinzel</option>
            </select>
          </div>

          <div className="space-y-0.5">
            <select
              value={fontStyle}
              onChange={e => setFontStyle(e.target.value as any)}
              className="w-full px-2 py-1 rounded border text-xs font-medium"
              style={{
                backgroundColor: inputBg,
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
              }}
            >
              <option value="regular">Regular</option>
              <option value="bold">Bold</option>
              <option value="italic">Italic</option>
            </select>
          </div>
        </div>

        {/* 2x2 Grid: Size & Leading, Kerning & Tracking */}
        <div className="grid grid-cols-2 gap-2">
          {/* Size */}
          <div className="flex items-center gap-1.5 p-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
            <span className="text-[10px] font-bold text-slate-500 w-5 text-center">TT</span>
            <input
              type="number"
              min="6"
              max="144"
              value={toolOptions.fontSize}
              onChange={e => {
                const s = parseInt(e.target.value) || 12;
                setToolOption('fontSize', s);
                if (leadingAuto) setLeadingVal(Math.round(s * 1.25));
                updateSelectedPublishFrames({ fontSize: s });
              }}
              className="w-full px-1 py-0.5 rounded border text-xs font-mono font-bold"
              style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            />
            <span className="text-[10px] font-mono text-slate-400 pr-1">pt</span>
          </div>

          {/* Leading */}
          <div className="flex items-center gap-1.5 p-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
            <span className="text-[10px] font-bold text-slate-500 w-5 text-center">A/A</span>
            <input
              type="number"
              min="6"
              max="200"
              value={leadingVal}
              onChange={e => {
                setLeadingAuto(false);
                setLeadingVal(parseInt(e.target.value) || 14);
              }}
              className="w-full px-1 py-0.5 rounded border text-xs font-mono font-bold"
              style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            />
            <span className="text-[10px] font-mono text-slate-400 pr-1">pt</span>
          </div>

          {/* Kerning */}
          <div className="flex items-center gap-1.5 p-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
            <span className="text-[9px] font-bold text-slate-500 w-5 text-center">V/A</span>
            <select
              value={kerningMode}
              onChange={e => setKerningMode(e.target.value as any)}
              className="w-full px-1 py-0.5 rounded border text-xs font-medium"
              style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            >
              <option value="metrics">Metrics</option>
              <option value="optical">Optical</option>
              <option value="0">0</option>
            </select>
          </div>

          {/* Tracking */}
          <div className="flex items-center gap-1.5 p-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
            <span className="text-[9px] font-bold text-slate-500 w-5 text-center">VA</span>
            <input
              type="number"
              min="-200"
              max="500"
              step="10"
              value={trackingVal}
              onChange={e => setTrackingVal(parseInt(e.target.value) || 0)}
              className="w-full px-1 py-0.5 rounded border text-xs font-mono font-bold"
              style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            />
          </div>
        </div>

        {/* Character Toggles Row (TT, Tt, T^1, T_1, U, S) */}
        <div className="flex items-center justify-between gap-1 p-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
          {[
            { id: 'allCaps', label: 'TT', active: allCaps, toggle: () => setAllCaps(!allCaps), title: 'All Caps' },
            { id: 'smallCaps', label: 'Tt', active: smallCaps, toggle: () => setSmallCaps(!smallCaps), title: 'Small Caps' },
            { id: 'superscript', label: 'T¹', active: superscript, toggle: () => setSuperscript(!superscript), title: 'Superscript' },
            { id: 'underline', label: 'U', active: underline, toggle: () => setUnderline(!underline), title: 'Underline' },
            { id: 'strikethrough', label: 'S', active: strikethrough, toggle: () => setStrikethrough(!strikethrough), title: 'Strikethrough' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={btn.toggle}
              title={btn.title}
              className={`flex-1 py-1 rounded text-[11px] font-bold transition-all ${
                btn.active
                  ? 'bg-[#0d99ff] text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          PARAGRAPH FORMATTING CONTROLS
          ===================================================================== */}
      <div className="space-y-2 pt-1 border-t" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
          Paragraph
        </div>

        {/* Alignment Buttons */}
        <div className="flex items-center gap-1 p-1 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
          {[
            { id: 'left' as const, icon: <AlignLeft className="w-3.5 h-3.5" />, title: 'Align Left' },
            { id: 'center' as const, icon: <AlignCenter className="w-3.5 h-3.5" />, title: 'Align Center' },
            { id: 'right' as const, icon: <AlignRight className="w-3.5 h-3.5" />, title: 'Align Right' },
            { id: 'justify' as const, icon: <AlignJustify className="w-3.5 h-3.5" />, title: 'Justify' },
          ].map(a => (
            <button
              key={a.id}
              onClick={() => {
                setAlignment(a.id);
                setToolOption('textAlign', a.id);
              }}
              title={a.title}
              className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${
                alignment === a.id
                  ? 'bg-[#0d99ff] text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              {a.icon}
            </button>
          ))}
        </div>

        {/* Indents Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>First Line Indent:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="72"
                value={firstLineIndent}
                onChange={e => setFirstLineIndent(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-0.5 rounded border text-xs font-mono font-bold"
                style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              />
              <span className="text-[10px] font-mono opacity-60">pt</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Space After:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="72"
                value={spaceAfter}
                onChange={e => setSpaceAfter(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-0.5 rounded border text-xs font-mono font-bold"
                style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              />
              <span className="text-[10px] font-mono opacity-60">pt</span>
            </div>
          </div>
        </div>

        {/* Drop Cap & Hyphenation */}
        <div className="flex items-center justify-between p-2 rounded border" style={{ backgroundColor: boxBg, borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold" style={{ color: theme.textPrimary }}>Drop Cap:</span>
            <input
              type="number"
              min="0"
              max="10"
              value={dropCapLines}
              onChange={e => setDropCapLines(parseInt(e.target.value) || 0)}
              className="w-12 px-1.5 py-0.5 rounded border text-xs font-mono font-bold text-center"
              style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
            />
            <span className="text-[10px] opacity-70">Lines</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hyphenate}
              onChange={e => setHyphenate(e.target.checked)}
              className="rounded accent-[#0d99ff]"
            />
            <span className="text-[11px] font-medium" style={{ color: theme.textSecondary }}>Hyphenate</span>
          </label>
        </div>
      </div>
    </div>
  );
};
