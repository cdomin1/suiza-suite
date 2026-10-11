import React, { useRef, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Camera,
  PenTool,
  BookOpen,
  Cloud,
  CloudOff,
  Cpu,
  Sparkles,
  Download,
  Settings,
} from 'lucide-react';
import { THEMES } from '../../constants/shortcuts';

export const TopNav: React.FC = () => {
  const {
    persona,
    setPersona,
    project,
    theme,
    setThemeId,
    osMode,
    setOsMode,
    zoom,
    isOffline,
    syncStatus,
    setActiveModal,
    aiOptIn,
    setAiOptIn,
    showShortcutFeedback,
  } = useStudio();

  return (
    <header
      className="h-10 flex items-center justify-between px-3 text-xs border-b select-none z-40 transition-colors shrink-0"
      style={{
        backgroundColor: theme.bgMain,
        borderColor: theme.border,
        color: theme.textPrimary,
      }}
    >
      {/* ZONE 1: Window Controls & Persona Switcher */}
      <div className="flex items-center gap-2.5">
        {/* macOS Traffic Lights (shown in macOS mode) */}
        {osMode === 'macos' && (
          <div className="flex items-center gap-2 mr-1">
            <span
              onClick={() => showShortcutFeedback('Closed SUIZA Atelier Window')}
              className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] cursor-pointer hover:opacity-80 shadow-xs flex items-center justify-center text-[8px] text-red-950 font-bold opacity-90 group"
              title="Close Window (⌘W)"
            >
              <span className="opacity-0 group-hover:opacity-100 leading-none">×</span>
            </span>
            <span
              onClick={() => showShortcutFeedback('Minimized Window to Dock')}
              className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] cursor-pointer hover:opacity-80 shadow-xs flex items-center justify-center text-[8px] text-amber-950 font-bold opacity-90 group"
              title="Minimize (⌘M)"
            >
              <span className="opacity-0 group-hover:opacity-100 leading-none">−</span>
            </span>
            <span
              onClick={() => showShortcutFeedback('Entered Full Screen')}
              className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] cursor-pointer hover:opacity-80 shadow-xs flex items-center justify-center text-[8px] text-emerald-950 font-bold opacity-90 group"
              title="Full Screen (⌘F)"
            >
              <span className="opacity-0 group-hover:opacity-100 leading-none">+</span>
            </span>
          </div>
        )}

        {/* Brand Wordmark */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded border shrink-0 font-semibold"
          style={{
            backgroundColor: theme.isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
            borderColor: theme.borderStrong,
            color: theme.textPrimary,
          }}
        >
          <span className="text-[#0d99ff] font-black text-sm leading-none">✦</span>
          <span className="text-xs tracking-tight font-bold">SUIZA Atelier</span>
        </div>

        {/* SUIZA Persona Switcher */}
        <div
          className="flex items-center p-0.5 rounded border gap-0.5"
          style={{
            backgroundColor: theme.isLight ? '#e2e8f0' : 'rgba(0,0,0,0.4)',
            borderColor: theme.border,
          }}
        >
          {/* 1. SUIZA Photo */}
          <button
            onClick={() => setPersona('photo')}
            title="SUIZA Photo (Raster & Darkroom Retouching)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              persona === 'photo'
                ? 'bg-[#0d99ff] text-white shadow-sm font-bold'
                : theme.isLight
                ? 'text-slate-800 hover:text-slate-950 hover:bg-white/80'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Photo</span>
          </button>

          {/* 2. SUIZA Vector */}
          <button
            onClick={() => setPersona('vector')}
            title="SUIZA Vector (Bézier Engine & Vector Design)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              persona === 'vector'
                ? 'bg-[#f59e0b] text-neutral-950 shadow-sm font-bold'
                : theme.isLight
                ? 'text-slate-800 hover:text-slate-950 hover:bg-white/80'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vector</span>
          </button>

          {/* 3. SUIZA Publish */}
          <button
            onClick={() => setPersona('publish')}
            title="SUIZA Publish (Publication & Editorial Spreads)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              persona === 'publish'
                ? 'bg-[#ec4899] text-white shadow-sm font-bold'
                : theme.isLight
                ? 'text-slate-800 hover:text-slate-950 hover:bg-white/80'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Publish</span>
          </button>
        </div>
      </div>

      {/* ZONE 2: Central Document Status (Studio Document Title Bar) */}
      <div
        className="hidden md:flex items-center gap-2 px-3 py-0.5 rounded border text-[11px] font-mono shadow-xs"
        style={{
          backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.3)',
          borderColor: theme.border,
          color: theme.textPrimary,
        }}
      >
        <span className="font-semibold">{project.name}</span>
        <span style={{ color: theme.textMuted }}>@</span>
        <span className="tabular-nums font-bold" style={{ color: theme.accent }}>
          {Math.round(zoom * 100)}%
        </span>
        <span style={{ color: theme.textMuted }}>·</span>
        <span
          className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
            project.colorMode === 'CMYK'
              ? (theme.isLight ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-amber-500/20 text-amber-300')
              : (theme.isLight ? 'bg-sky-100 text-sky-900 border border-sky-300' : 'bg-blue-500/20 text-blue-300')
          }`}
        >
          {project.colorMode}/8bpc
        </span>
        <span style={{ color: theme.textMuted }}>·</span>
        <span className="tabular-nums font-medium" style={{ color: theme.textSecondary }}>
          {persona === 'publish' ? '1400×780 Spread' : persona === 'vector' ? '1200×800 Artboard' : `${project.width}×${project.height}px`}
        </span>
      </div>

      {/* ZONE 3: View Controls, Theme & Export CTA */}
      <div className="flex items-center gap-2">
        {/* Fit to Screen Zoom Helper */}
        <button
          onClick={() => {
            showShortcutFeedback('Fit Document to Screen');
          }}
          title="Fit to Screen"
          className="hidden lg:flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          style={{ borderColor: theme.border, color: theme.textSecondary }}
        >
          <span>Fit Screen</span>
        </button>

        {/* Theme Picker */}
        <div className="relative group">
          <select
            value={theme.id}
            onChange={e => setThemeId(e.target.value as any)}
            className="rounded px-2 py-1 text-[11px] font-medium cursor-pointer border focus:outline-none focus:border-[#0d99ff]"
            style={{
              backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.4)',
              borderColor: theme.borderStrong,
              color: theme.textPrimary,
            }}
          >
            {THEMES.map(t => (
              <option key={t.id} value={t.id} className={theme.isLight ? 'bg-white text-slate-900' : 'bg-neutral-900 text-neutral-100'}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Export Studio CTA (Primary Action) */}
        <button
          onClick={() => setActiveModal('export')}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0d99ff] hover:bg-sky-500 text-white font-semibold shadow-sm transition-all text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
