import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Wifi,
  Battery,
  Search,
  SlidersHorizontal,
  Cloud,
  CloudOff,
  Cpu,
  Layers,
  Plus,
  Save,
  Download,
  Settings,
  Sparkles,
  Check,
  Folder,
  Terminal,
  ExternalLink,
  Laptop,
} from 'lucide-react';

export const MacGlobalMenu: React.FC = () => {
  const {
    persona,
    setPersona,
    project,
    theme,
    isOffline,
    syncStatus,
    triggerAutoSave,
    setActiveModal,
    undo,
    redo,
    fitToScreen,
    resetViewport,
    showRulers,
    setShowRulers,
    showGrid,
    setShowGrid,
    addLayer,
    createLayerGroup,
    addAdjustmentLayer,
    aiOptIn,
    setAiOptIn,
    macActiveApp,
    setMacActiveApp,
    setIsSpotlightOpen,
    osMode,
    setOsMode,
    showShortcutFeedback,
  } = useStudio();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Live macOS system clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
        '  ' +
        now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Menu item lists depending on active app
  const suizaMenuItems = [
    'File',
    'Edit',
    persona === 'photo' ? 'Image' : persona === 'vector' ? 'Object' : 'Layout',
    'Layer',
    'Type',
    'Select',
    'Filter',
    'View',
    'Window',
    'Help',
  ];

  const finderMenuItems = ['File', 'Edit', 'View', 'Go', 'Window', 'Help'];

  return (
    <div
      ref={menuBarRef}
      className="h-7 px-2.5 flex items-center justify-between text-xs select-none border-b z-50 backdrop-blur-md transition-colors shrink-0"
      style={{
        backgroundColor: theme.isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(24, 24, 27, 0.88)',
        borderColor: theme.border,
        color: theme.textPrimary,
      }}
    >
      {/* =====================================================================
          LEFT: GNOME Activities (Linux) or Apple  Menu (macOS)
          ===================================================================== */}
      <div className="flex items-center gap-0.5">
        {/* Linux GNOME Activities Button */}
        {osMode === 'linux' ? (
          <div className="flex items-center gap-1 mr-1">
            <button
              onClick={() => setIsSpotlightOpen(true)}
              className="px-2.5 py-0.5 rounded-full bg-slate-900/10 dark:bg-white/10 hover:bg-[#0d99ff] hover:text-white transition-all font-semibold text-[11px]"
              title="GNOME Activities Overview (Super Key)"
            >
              Activities
            </button>
            <button
              onClick={() => setActiveModal('linux-native')}
              className="px-2 py-0.5 rounded text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1"
              title="Linux Workstation Architecture & Flatpak Deploy"
            >
              <span>🐧</span>
              <span className="font-semibold">Suiza-Suite</span>
            </button>
          </div>
        ) : (
          /* Apple  Logo Menu */
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'apple' ? null : 'apple')}
              className="px-2 py-0.5 rounded text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-colors font-serif leading-none"
              title="Apple Menu"
            >
              
            </button>
            {activeMenu === 'apple' && (
              <div
                className="absolute left-0 top-full mt-1 w-56 rounded-md shadow-2xl py-1 text-xs border z-50 animate-in fade-in duration-100"
                style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, color: theme.textPrimary }}
              >
                <button
                  onClick={() => { setActiveModal('rust-arch'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors"
                >
                  About This Mac
                </button>
                <button
                  onClick={() => { setActiveModal('rust-arch'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors"
                >
                  System Settings...
                </button>
                <button
                  onClick={() => { setActiveModal('plugins'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors"
                >
                  App Store...
                </button>
                <div className="my-1 border-t" style={{ borderColor: theme.border }} />
                <button
                  onClick={() => {
                    setMacActiveApp(macActiveApp === 'suiza' ? 'finder' : 'suiza');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center transition-colors font-medium"
                >
                  <span>Switch to {macActiveApp === 'suiza' ? 'Finder' : 'Suiza-Suite'}</span>
                  <span className="text-[10px] opacity-70">⌘Tab</span>
                </button>
                <div className="my-1 border-t" style={{ borderColor: theme.border }} />
                <button
                  onClick={() => { setActiveModal('linux-native'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>🐧</span>
                  <span>Linux Creative Architecture...</span>
                </button>
                <button
                  onClick={() => { setActiveModal('rust-arch'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors"
                >
                  Rust AppKit Core Architecture
                </button>
                <button
                  onClick={() => { setActiveMenu(null); showShortcutFeedback('macOS Safe Sleep Mode'); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors"
                >
                  Sleep
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            APP FOCUS STATE: SUIZA-SUITE vs FINDER
            =================================================================== */}
        {macActiveApp === 'suiza' ? (
          /* Active App: Suiza-Suite */
          <>
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'suiza-app' ? null : 'suiza-app')}
                className={`px-2 py-0.5 rounded font-extrabold text-xs transition-colors flex items-center gap-1 ${
                  activeMenu === 'suiza-app' ? 'bg-[#0d99ff] text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                <span>Suiza-Suite</span>
              </button>
              {activeMenu === 'suiza-app' && (
                <div
                  className="absolute left-0 top-full mt-1 w-64 rounded-md shadow-2xl py-1 text-xs border z-50 animate-in fade-in duration-100"
                  style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, color: theme.textPrimary }}
                >
                  <button
                    onClick={() => { setActiveModal('rust-arch'); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors font-bold"
                  >
                    About Suiza-Suite (Safe Rust Edition)
                  </button>
                  <div className="my-1 border-t" style={{ borderColor: theme.border }} />
                  <button
                    onClick={() => { setActiveModal('shortcuts'); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center transition-colors"
                  >
                    <span>Settings & Preferences...</span>
                    <span className="text-[10px] opacity-70 font-mono">⌘,</span>
                  </button>
                  <button
                    onClick={() => { setActiveModal('plugins'); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors"
                  >
                    Extension & Plugin Manager...
                  </button>
                  <div className="my-1 border-t" style={{ borderColor: theme.border }} />
                  <button
                    onClick={() => {
                      setMacActiveApp('finder');
                      setActiveMenu(null);
                      showShortcutFeedback('Switched to Finder Desktop');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center transition-colors"
                  >
                    <span>Hide Suiza-Suite (Go to Finder)</span>
                    <span className="text-[10px] opacity-70 font-mono">⌘H</span>
                  </button>
                  <button
                    onClick={() => { triggerAutoSave(); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center transition-colors"
                  >
                    <span>Save Snapshot & Quit</span>
                    <span className="text-[10px] opacity-70 font-mono">⌘Q</span>
                  </button>
                </div>
              )}
            </div>

            {/* Suiza-Suite Menus */}
            {suizaMenuItems.map(item => (
              <div key={item} className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === item ? null : item)}
                  className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                    activeMenu === item
                      ? 'bg-[#0d99ff] text-white font-semibold'
                      : 'hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                  style={{ color: activeMenu === item ? undefined : theme.textPrimary }}
                >
                  {item}
                </button>

                {activeMenu === item && (
                  <div
                    className="absolute left-0 top-full mt-1 w-56 rounded-md shadow-2xl py-1 text-xs border z-50 animate-in fade-in duration-100"
                    style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, color: theme.textPrimary }}
                  >
                    {item === 'File' && (
                      <>
                        <button
                          onClick={() => { setActiveModal('new-doc'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>New Document...</span>
                          <span className="text-[10px] opacity-70 font-mono">⌘N</span>
                        </button>
                        <button
                          onClick={() => { triggerAutoSave(); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Save Project</span>
                          <span className="text-[10px] opacity-70 font-mono">⌘S</span>
                        </button>
                        <button
                          onClick={() => { setActiveModal('export'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center font-bold"
                        >
                          <span>Export Studio (High-Res)...</span>
                          <span className="text-[10px] opacity-70 font-mono">⇧⌘E</span>
                        </button>
                        <div className="my-1 border-t" style={{ borderColor: theme.border }} />
                        <button
                          onClick={() => { setActiveModal('cloud-sync'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Cloud & Offline Backups...</span>
                          <span className="text-[10px] opacity-70 font-mono">Snapshots</span>
                        </button>
                      </>
                    )}

                    {item === 'Edit' && (
                      <>
                        <button
                          onClick={() => { undo(); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Undo</span>
                          <span className="text-[10px] opacity-70 font-mono">⌘Z</span>
                        </button>
                        <button
                          onClick={() => { redo(); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Redo</span>
                          <span className="text-[10px] opacity-70 font-mono">⇧⌘Z</span>
                        </button>
                        <div className="my-1 border-t" style={{ borderColor: theme.border }} />
                        <button
                          onClick={() => { setActiveModal('shortcuts'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Keyboard Shortcuts...</span>
                          <span className="text-[10px] opacity-70 font-mono">⌘K</span>
                        </button>
                      </>
                    )}

                    {item === 'Image' && (
                      <>
                        <div className="px-3 py-1 text-[10px] font-bold tracking-wider opacity-70">PHOTO COLOR MODE</div>
                        <div className="px-3 py-1 font-semibold flex items-center justify-between">
                          <span>Active Mode:</span>
                          <span className="font-mono text-sky-500 font-bold">{project.colorMode}</span>
                        </div>
                        <div className="my-1 border-t" style={{ borderColor: theme.border }} />
                        <button
                          onClick={() => { addAdjustmentLayer('curves'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white"
                        >
                          Tone Curves Adjustment...
                        </button>
                        <button
                          onClick={() => { addAdjustmentLayer('hsl'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white"
                        >
                          Hue / Saturation / Vibrance...
                        </button>
                        <button
                          onClick={() => { addAdjustmentLayer('brightness-contrast'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white"
                        >
                          Brightness & Contrast...
                        </button>
                      </>
                    )}

                    {item === 'Object' && (
                      <>
                        <div className="px-3 py-1 text-[10px] font-bold tracking-wider opacity-70">VECTOR OPERATIONS</div>
                        <button
                          onClick={() => { showShortcutFeedback('Expanded Appearance'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white"
                        >
                          Expand Appearance...
                        </button>
                        <button
                          onClick={() => { showShortcutFeedback('Path Offset +10pt'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white"
                        >
                          Path & Offset Contour...
                        </button>
                        <button
                          onClick={() => { showShortcutFeedback('Converted to Compound Path'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Make Compound Path</span>
                          <span className="text-[10px] opacity-70 font-mono">⌘8</span>
                        </button>
                      </>
                    )}

                    {item === 'Layout' && (
                      <>
                        <div className="px-3 py-1 text-[10px] font-bold tracking-wider opacity-70">PUBLICATION SPREADS</div>
                        <button
                          onClick={() => { showShortcutFeedback('Opened Margins & Columns Dialog'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white"
                        >
                          Margins & Columns Setup...
                        </button>
                        <button
                          onClick={() => { showShortcutFeedback('Created Master Spread B'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white"
                        >
                          New Master Page...
                        </button>
                        <button
                          onClick={() => { showShortcutFeedback('Preflight Audit Passed'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white"
                        >
                          Run Preflight Audit (0 Errors)
                        </button>
                      </>
                    )}

                    {item === 'Layer' && (
                      <>
                        <button
                          onClick={() => { addLayer('raster'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>New Raster Layer</span>
                          <span className="text-[10px] opacity-70 font-mono">⇧⌘N</span>
                        </button>
                        <button
                          onClick={() => { addLayer('vector'); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white"
                        >
                          New Vector Layer
                        </button>
                        <button
                          onClick={() => { createLayerGroup(); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>New Layer Group (Folder)</span>
                          <span className="text-[10px] opacity-70 font-mono">⌘G</span>
                        </button>
                      </>
                    )}

                    {item === 'View' && (
                      <>
                        <button
                          onClick={() => { fitToScreen(); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Fit on Screen</span>
                          <span className="text-[10px] opacity-70 font-mono">⌘0</span>
                        </button>
                        <button
                          onClick={() => { resetViewport(); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Actual Pixels (100%)</span>
                          <span className="text-[10px] opacity-70 font-mono">⌘1</span>
                        </button>
                        <div className="my-1 border-t" style={{ borderColor: theme.border }} />
                        <button
                          onClick={() => { setShowRulers(r => !r); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Show Rulers</span>
                          <span>{showRulers ? '✓' : ''}</span>
                        </button>
                        <button
                          onClick={() => { setShowGrid(g => !g); setActiveMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Show Pixel Grid</span>
                          <span>{showGrid ? '✓' : ''}</span>
                        </button>
                      </>
                    )}

                    {['Type', 'Select', 'Filter', 'Window', 'Help'].includes(item) && (
                      <div className="px-3 py-2 text-xs" style={{ color: theme.textSecondary }}>
                        <div className="font-semibold mb-1">{item} Operations</div>
                        <div className="text-[11px] opacity-80">Full actions available for {persona} persona.</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          /* ===================================================================
              Active App: Finder (macOS Finder Global Menu Integration)
              =================================================================== */
          <>
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'finder-app' ? null : 'finder-app')}
                className={`px-2 py-0.5 rounded font-extrabold text-xs transition-colors flex items-center gap-1 ${
                  activeMenu === 'finder-app' ? 'bg-[#0d99ff] text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                <span>Finder</span>
              </button>
              {activeMenu === 'finder-app' && (
                <div
                  className="absolute left-0 top-full mt-1 w-64 rounded-md shadow-2xl py-1 text-xs border z-50 animate-in fade-in duration-100"
                  style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, color: theme.textPrimary }}
                >
                  <button
                    onClick={() => {
                      setMacActiveApp('suiza');
                      setActiveMenu(null);
                      showShortcutFeedback('Returned to Suiza-Suite Window');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white font-bold transition-colors"
                  >
                    ✦ Return to Suiza-Suite Window
                  </button>
                  <div className="my-1 border-t" style={{ borderColor: theme.border }} />
                  <button
                    onClick={() => { setActiveMenu(null); showShortcutFeedback('Finder Preferences'); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                  >
                    <span>Settings & Preferences...</span>
                    <span className="text-[10px] opacity-70 font-mono">⌘,</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); showShortcutFeedback('Emptied Trash'); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white"
                  >
                    Empty Trash...
                  </button>
                </div>
              )}
            </div>

            {/* Finder Menus: File, Edit, View, Go, Window, Help */}
            {finderMenuItems.map(item => (
              <div key={item} className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === `finder-${item}` ? null : `finder-${item}`)}
                  className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                    activeMenu === `finder-${item}`
                      ? 'bg-[#0d99ff] text-white font-semibold'
                      : 'hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                  style={{ color: activeMenu === `finder-${item}` ? undefined : theme.textPrimary }}
                >
                  {item}
                </button>

                {activeMenu === `finder-${item}` && (
                  <div
                    className="absolute left-0 top-full mt-1 w-60 rounded-md shadow-2xl py-1 text-xs border z-50 animate-in fade-in duration-100"
                    style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, color: theme.textPrimary }}
                  >
                    {item === 'Go' && (
                      <>
                        <button
                          onClick={() => {
                            setActiveMenu(null);
                            showShortcutFeedback('Opened ~/Developer in Finder');
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white font-bold flex justify-between items-center"
                        >
                          <span className="flex items-center gap-1.5"><Folder className="w-3.5 h-3.5 text-sky-500" /> Developer Folder</span>
                          <span className="text-[10px] font-mono opacity-70">~/Developer</span>
                        </button>
                        <div className="my-1 border-t" style={{ borderColor: theme.border }} />
                        <button
                          onClick={() => { setActiveMenu(null); showShortcutFeedback('Opened Applications'); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Applications</span>
                          <span className="text-[10px] font-mono opacity-70">⇧⌘A</span>
                        </button>
                        <button
                          onClick={() => { setActiveMenu(null); showShortcutFeedback('Opened Home Folder'); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Home</span>
                          <span className="text-[10px] font-mono opacity-70">⇧⌘H</span>
                        </button>
                        <button
                          onClick={() => { setActiveMenu(null); showShortcutFeedback('Opened Documents'); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Documents</span>
                          <span className="text-[10px] font-mono opacity-70">⇧⌘O</span>
                        </button>
                        <button
                          onClick={() => { setActiveMenu(null); showShortcutFeedback('Opened Downloads'); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>Downloads</span>
                          <span className="text-[10px] font-mono opacity-70">⌥⌘L</span>
                        </button>
                        <button
                          onClick={() => { setActiveMenu(null); showShortcutFeedback('Opened AirDrop'); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>AirDrop</span>
                          <span className="text-[10px] font-mono opacity-70">⇧⌘R</span>
                        </button>
                      </>
                    )}

                    {item === 'File' && (
                      <>
                        <button
                          onClick={() => { setActiveMenu(null); showShortcutFeedback('New Finder Window'); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>New Finder Window</span>
                          <span className="text-[10px] font-mono opacity-70">⌘N</span>
                        </button>
                        <button
                          onClick={() => { setActiveMenu(null); showShortcutFeedback('New Folder Created'); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex justify-between items-center"
                        >
                          <span>New Folder</span>
                          <span className="text-[10px] font-mono opacity-70">⇧⌘N</span>
                        </button>
                      </>
                    )}

                    {['Edit', 'View', 'Window', 'Help'].includes(item) && (
                      <div className="px-3 py-2 text-xs" style={{ color: theme.textSecondary }}>
                        <div className="font-semibold mb-1">Finder {item}</div>
                        <div className="text-[11px] opacity-80">Desktop file management options.</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Quick Button to Return to Suiza-Suite Window */}
            <button
              onClick={() => {
                setMacActiveApp('suiza');
                showShortcutFeedback('Focused Suiza-Suite Creative Window');
              }}
              className="ml-2 px-2 py-0.5 rounded text-[11px] font-bold bg-[#0d99ff] hover:bg-sky-500 text-white flex items-center gap-1 shadow-xs transition-colors"
            >
              <span>Focus Suiza-Suite</span>
            </button>
          </>
        )}
      </div>

      {/* =====================================================================
          RIGHT: Clean Desktop Extras & Shell Switcher (Linux GNOME vs macOS)
          ===================================================================== */}
      <div className="flex items-center gap-2">
        {/* Linux Workstation Native Modal Trigger (clean subtle badge) */}
        {osMode === 'linux' && (
          <button
            onClick={() => setActiveModal('linux-native')}
            title="Linux Workstation Architecture, Wayland & Flatpak Guide"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <span>🐧 Linux Native</span>
          </button>
        )}

        {/* OS Desktop Switcher (Compact Linux vs Mac Toggle) */}
        <div
          className="flex items-center p-0.5 rounded border gap-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: theme.isLight ? '#f1f5f9' : 'rgba(0, 0, 0, 0.4)',
            borderColor: theme.border,
          }}
        >
          <button
            onClick={() => {
              setOsMode('linux');
              showShortcutFeedback('Switched to Linux GNOME / Wayland Interface');
            }}
            title="Switch to Linux Desktop Style"
            className={`px-1.5 py-0.5 rounded transition-all flex items-center gap-1 ${
              osMode === 'linux'
                ? 'bg-[#0d99ff] text-white font-bold shadow-xs'
                : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            <span>🐧</span>
            <span className="hidden sm:inline">Linux</span>
          </button>
          <button
            onClick={() => {
              setOsMode('macos');
              showShortcutFeedback('Switched to macOS Menu Bar Interface');
            }}
            title="Switch to macOS Desktop Style"
            className={`px-1.5 py-0.5 rounded transition-all flex items-center gap-1 ${
              osMode === 'macos'
                ? 'bg-[#0d99ff] text-white font-bold shadow-xs'
                : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            <span>🍏</span>
            <span className="hidden sm:inline">Mac</span>
          </button>
        </div>

        {/* Spotlight Search */}
        <button
          onClick={() => setIsSpotlightOpen(true)}
          title="Spotlight Search & Command Palette (⌘Space)"
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          style={{ color: theme.textPrimary }}
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Live System Clock */}
        <span className="font-semibold text-[11px] tabular-nums pl-1" style={{ color: theme.textPrimary }}>
          {currentTime}
        </span>
      </div>
    </div>
  );
};
