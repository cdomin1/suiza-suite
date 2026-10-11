import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  X,
  Terminal,
  Cpu,
  Monitor,
  PenTool,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Layers,
  FileCheck,
  ExternalLink,
  Laptop,
} from 'lucide-react';

export const LinuxNativeModal: React.FC = () => {
  const { setActiveModal, theme, showShortcutFeedback } = useStudio();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'packaging' | 'color-wacom' | 'pro-interchange'>('architecture');
  const [tabletTestPressure, setTabletTestPressure] = useState(0.85);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCmd(label);
    showShortcutFeedback(`Copied: ${label}`);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div
        className="w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: theme.bgPanel,
          borderColor: theme.borderStrong,
          color: theme.textPrimary,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{
            backgroundColor: theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.4)',
            borderColor: theme.border,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
              🐧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Linux Creative Freedom & Native Architecture
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Tier-1 Native
                </span>
              </div>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                Breaking proprietary suite lock-in on creative professionals through first-class Linux deployment
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            style={{ color: theme.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex items-center px-6 border-b text-xs font-semibold gap-1 shrink-0 overflow-x-auto scrollbar-none"
          style={{
            backgroundColor: theme.bgSubtle,
            borderColor: theme.border,
          }}
        >
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-[#0d99ff] text-[#0d99ff] font-bold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
            style={{ color: activeTab === 'architecture' ? undefined : theme.textSecondary }}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Why Linux Needs This</span>
          </button>
          <button
            onClick={() => setActiveTab('packaging')}
            className={`px-3 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'packaging'
                ? 'border-[#0d99ff] text-[#0d99ff] font-bold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
            style={{ color: activeTab === 'packaging' ? undefined : theme.textSecondary }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Flatpak & AppImage</span>
          </button>
          <button
            onClick={() => setActiveTab('color-wacom')}
            className={`px-3 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'color-wacom'
                ? 'border-[#0d99ff] text-[#0d99ff] font-bold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
            style={{ color: activeTab === 'color-wacom' ? undefined : theme.textSecondary }}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Wayland, Color & Wacom</span>
          </button>
          <button
            onClick={() => setActiveTab('pro-interchange')}
            className={`px-3 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'pro-interchange'
                ? 'border-[#0d99ff] text-[#0d99ff] font-bold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
            style={{ color: activeTab === 'pro-interchange' ? undefined : theme.textSecondary }}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Industry File Interchange</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs scrollbar-thin">
          {/* TAB 1: ARCHITECTURE & THE MONOPOLY BREAK */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-lg border leading-relaxed space-y-2"
                style={{
                  backgroundColor: theme.isLight ? '#f1f5f9' : 'rgba(13, 153, 255, 0.06)',
                  borderColor: theme.border,
                }}
              >
                <div className="font-bold text-sm text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>The Problem: Proprietary Lock-In on the Creative Community</span>
                </div>
                <p style={{ color: theme.textSecondary }}>
                  Millions of designers, photographers, illustrators, and layout artists would switch to Linux overnight if they had a unified, pro-tier creative suite.
                  Previously, Linux forced users to stitch together disparate standalone tools with conflicting shortcuts and fragmented color workflows.
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  SUIZA Atelier solves this at the root: one integrated suite combining <span className="text-[#0d99ff]">Suiza-Photo</span>, <span className="text-[#f59e0b]">Suiza-Vector</span>, and <span className="text-[#ec4899]">Suiza-Publish</span> with unified professional hotkeys, shared layer hierarchy, non-destructive GPU compute, and pristine native Linux desktop integration.
                </p>
              </div>

              {/* Direct Comparison Grid */}
              <div
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: theme.border }}
              >
                <div
                  className="grid grid-cols-3 p-2.5 font-bold text-[11px] border-b"
                  style={{
                    backgroundColor: theme.isLight ? '#e2e8f0' : 'rgba(0, 0, 0, 0.5)',
                    borderColor: theme.border,
                  }}
                >
                  <span>Capability</span>
                  <span className="text-amber-600 dark:text-amber-400">Legacy Linux (GIMP / Scribus)</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Suiza-Suite (Rust / Vulkan)</span>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-white/5 text-[11px]">
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-semibold">Suite Integration</span>
                    <span className="text-slate-500 dark:text-neutral-400">3 separate programs, mismatched shortcuts</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1 unified app, 1-click persona switch
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-semibold">Non-destructive Adjustments</span>
                    <span className="text-slate-500 dark:text-neutral-400">Limited (mostly destructive layer edits)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Real-time Curves, HSL, Levels stacks
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-semibold">Hardware Acceleration</span>
                    <span className="text-slate-500 dark:text-neutral-400">CPU GEGL single-threaded bottlenecks</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Vulkan 1.3 / OpenGL 120 FPS SIMD
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-semibold">Wayland Display & HDR</span>
                    <span className="text-slate-500 dark:text-neutral-400">XWayland fallback with blur & scaling bugs</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Native Wayland wp_color_management_v1
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-semibold">Professional CMYK / Preflight</span>
                    <span className="text-slate-500 dark:text-neutral-400">Plugin required / cumbersome setup</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Native FOGRA39 / SWOP CMYK 300 DPI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PACKAGING (FLATPAK & APPIMAGE) */}
          {activeTab === 'packaging' && (
            <div className="space-y-4">
              <p style={{ color: theme.textSecondary }}>
                Suiza-Suite ships with modern, zero-dependency deployment targets so creatives on Ubuntu, Fedora, Debian, Arch Linux, Pop!_OS, Manjaro, or openSUSE can install in seconds.
              </p>

              {/* 1. Flatpak Command */}
              <div
                className="p-4 rounded-lg border space-y-2"
                style={{ backgroundColor: theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.3)', borderColor: theme.border }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 font-mono text-[10px]">FLATPAK</span>
                    <span>Flathub Sandboxed Distribution</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('flatpak install --user flathub org.suizasuite.Studio', 'Flatpak Command')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border transition-all hover:bg-black/5 dark:hover:bg-white/10"
                    style={{ borderColor: theme.border, color: theme.textPrimary }}
                  >
                    {copiedCmd === 'Flatpak Command' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'Flatpak Command' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] p-2.5 rounded bg-slate-900 text-slate-100 overflow-x-auto">
                  flatpak install --user flathub org.suizasuite.Studio
                </div>
                <p className="text-[11px]" style={{ color: theme.textSecondary }}>
                  Includes native Wayland socket, pipewire screen capture permission, and direct hardware graphics access.
                </p>
              </div>

              {/* 2. AppImage Command */}
              <div
                className="p-4 rounded-lg border space-y-2"
                style={{ backgroundColor: theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.3)', borderColor: theme.border }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px]">APPIMAGE</span>
                    <span>Single Executable (Zero Dependencies)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('chmod +x Suiza-Suite-x86_64.AppImage && ./Suiza-Suite-x86_64.AppImage', 'AppImage Command')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border transition-all hover:bg-black/5 dark:hover:bg-white/10"
                    style={{ borderColor: theme.border, color: theme.textPrimary }}
                  >
                    {copiedCmd === 'AppImage Command' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'AppImage Command' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] p-2.5 rounded bg-slate-900 text-slate-100 overflow-x-auto">
                  chmod +x Suiza-Suite-x86_64.AppImage && ./Suiza-Suite-x86_64.AppImage
                </div>
                <p className="text-[11px]" style={{ color: theme.textSecondary }}>
                  Runs instantly off USB or external drives on any modern Linux kernel (5.15+ / 6.x) without root privileges.
                </p>
              </div>

              {/* Arch AUR & Debian */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-3 rounded-lg border text-[11px]"
                  style={{ backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.2)', borderColor: theme.border }}
                >
                  <span className="font-bold text-sky-500 font-mono">Arch Linux AUR:</span>
                  <p className="font-mono mt-1 text-[10px] text-slate-700 dark:text-neutral-300">yay -S suiza-suite-bin</p>
                </div>
                <div
                  className="p-3 rounded-lg border text-[11px]"
                  style={{ backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.2)', borderColor: theme.border }}
                >
                  <span className="font-bold text-rose-500 font-mono">Ubuntu / Debian:</span>
                  <p className="font-mono mt-1 text-[10px] text-slate-700 dark:text-neutral-300">sudo apt install ./suiza-suite.deb</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WAYLAND, COLOR & WACOM TABLET */}
          {activeTab === 'color-wacom' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LittleCMS Color Engine */}
                <div
                  className="p-4 rounded-lg border space-y-2.5"
                  style={{ backgroundColor: theme.isLight ? '#f8fafc' : 'rgba(0,0,0,0.3)', borderColor: theme.border }}
                >
                  <div className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Monitor className="w-4 h-4 text-sky-500" />
                    <span>LittleCMS 2.15 Color Management</span>
                  </div>
                  <p className="text-[11px]" style={{ color: theme.textSecondary }}>
                    Linux Wayland color profile calibration protocol ensures hardware monitor matching for print accuracy.
                  </p>
                  <div className="space-y-1 font-mono text-[10px]">
                    <div className="flex justify-between py-1 border-b border-black/10 dark:border-white/10">
                      <span>Working Profile:</span>
                      <span className="text-[#0d99ff] font-bold">Wide-Gamut RGB (1998) D65</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/10 dark:border-white/10">
                      <span>Print Profile:</span>
                      <span className="text-amber-500 font-bold">ISO Coated v2 (FOGRA39)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/10 dark:border-white/10">
                      <span>Display Server:</span>
                      <span className="text-emerald-500 font-bold">Wayland 10-bit HDR (wp_color)</span>
                    </div>
                  </div>
                </div>

                {/* Wacom Stylus Integration */}
                <div
                  className="p-4 rounded-lg border space-y-2.5"
                  style={{ backgroundColor: theme.isLight ? '#f8fafc' : 'rgba(0,0,0,0.3)', borderColor: theme.border }}
                >
                  <div className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <PenTool className="w-4 h-4 text-emerald-500" />
                    <span>Wacom & Tablet Pressure</span>
                  </div>
                  <p className="text-[11px]" style={{ color: theme.textSecondary }}>
                    Direct Linux <code className="font-mono bg-black/10 dark:bg-white/10 px-1 rounded">libinput</code> / Web Pointer Events Level 3 bridge with 8,192 pressure levels and ±60° tilt.
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span>Stylus Pressure Calibration:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{Math.round(tabletTestPressure * 8192)} / 8192 levels</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.01"
                      value={tabletTestPressure}
                      onChange={e => setTabletTestPressure(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="h-6 rounded bg-black/10 dark:bg-black/40 flex items-center px-3 border border-black/10 dark:border-white/10 overflow-hidden">
                      <div
                        className="h-2 rounded bg-emerald-500 transition-all"
                        style={{ width: `${tabletTestPressure * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Wayland Advantages */}
              <div
                className="p-4 rounded-lg border space-y-2"
                style={{ backgroundColor: theme.isLight ? '#f1f5f9' : 'rgba(0,0,0,0.2)', borderColor: theme.border }}
              >
                <div className="font-bold text-slate-900 dark:text-white">Zero Fractional Scaling Blur on High-DPI Displays</div>
                <p style={{ color: theme.textSecondary }}>
                  Legacy creative apps on Linux running through X11 or XWayland suffer severe blurring at 125%, 150%, or 175% desktop fractional scale.
                  SUIZA Atelier uses native Wayland buffer rendering at the true physical device pixel ratio, delivering pinpoint retina sharpness on 4K & 5K creative workstations.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: INDUSTRY INTERCHANGE */}
          {activeTab === 'pro-interchange' && (
            <div className="space-y-4">
              <p style={{ color: theme.textSecondary }}>
                The true obstacle to leaving legacy operating systems has never been hardware—it is universal file compatibility with external studios and clients.
                SUIZA Atelier uses the unified native <span className="font-mono text-sky-400 font-bold">.szt</span> format across Mac, Windows, and Linux, plus open industry interchange:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  className="p-3 rounded-lg border space-y-1.5"
                  style={{ backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.3)', borderColor: theme.border }}
                >
                  <div className="font-bold flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                    <span className="font-mono text-xs">.SZT / Layers</span>
                    <span>Multi-Layer Raster Document Stacks</span>
                  </div>
                  <p className="text-[11px]" style={{ color: theme.textSecondary }}>
                    Imports and exports multi-layer raster document packages with 8-bit, 16-bit, and 32-bit floating point depth, layer masks, and blend modes intact.
                  </p>
                </div>

                <div
                  className="p-3 rounded-lg border space-y-1.5"
                  style={{ backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.3)', borderColor: theme.border }}
                >
                  <div className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="font-mono text-xs">.SZT / SVG</span>
                    <span>PostScript & Scalable Bézier Vectors</span>
                  </div>
                  <p className="text-[11px]" style={{ color: theme.textSecondary }}>
                    Native parser for vector PDF stream vectors, SVG 2.0 with mesh gradients, and standard XML subpaths.
                  </p>
                </div>

                <div
                  className="p-3 rounded-lg border space-y-1.5"
                  style={{ backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.3)', borderColor: theme.border }}
                >
                  <div className="font-bold flex items-center gap-1.5 text-pink-600 dark:text-pink-400">
                    <span className="font-mono text-xs">.SZT / Spreads</span>
                    <span>Universal Publication Layout Packages</span>
                  </div>
                  <p className="text-[11px]" style={{ color: theme.textSecondary }}>
                    Opens editorial layout packages with facing page spreads, master pages, text threads, paragraph styles, and bleed geometries preserved.
                  </p>
                </div>

                <div
                  className="p-3 rounded-lg border space-y-1.5"
                  style={{ backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.3)', borderColor: theme.border }}
                >
                  <div className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="font-mono text-xs">PDF/X-4</span>
                    <span>Commercial Print Standards</span>
                  </div>
                  <p className="text-[11px]" style={{ color: theme.textSecondary }}>
                    Export press-ready ISO 15930-7 PDF/X-4 files with embedded CMYK profiles, crop marks, registration targets, and 3mm bleeds.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="px-6 py-3.5 border-t flex items-center justify-between shrink-0"
          style={{
            backgroundColor: theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.4)',
            borderColor: theme.border,
          }}
        >
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: theme.textSecondary }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Target Distros: Ubuntu, Fedora, Arch, Pop!_OS, Debian</span>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 rounded-lg bg-[#0d99ff] hover:bg-sky-500 text-white font-semibold shadow-sm transition-all text-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
