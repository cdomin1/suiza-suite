import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStudio } from '../../context/StudioContext';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { AdjustmentsPanel } from './AdjustmentsPanel';
import { HistoryPanel } from './HistoryPanel';
import { AiAgentPanel } from './AiAgentPanel';
import { VectorPathfinderPanel } from './VectorPathfinderPanel';
import { VectorStrokePanel } from './VectorStrokePanel';
import { SwatchesPanel } from './SwatchesPanel';
import { TypographyPanel } from './TypographyPanel';
import { PublishPagesPanel } from './PublishPagesPanel';
import { PublishPreflightPanel } from './PublishPreflightPanel';
import { PublishTextWrapPanel } from './PublishTextWrapPanel';
import {
  Layers,
  Sliders,
  Palette,
  History,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Combine,
  Paintbrush,
  BookOpen,
  Type,
  FileCheck,
  WrapText,
  Shapes,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronDown,
  ChevronUp,
  SplitSquareVertical,
  Check,
  Maximize2,
  GripVertical,
  GripHorizontal,
} from 'lucide-react';

interface PanelTabConfig {
  id: string;
  label: string;
  shortLabel: string;
  category: 'styling' | 'structure' | 'utility';
  badge?: string;
  icon: React.ReactNode;
  shortcut?: string;
}

export const DockingPanel: React.FC = () => {
  const {
    persona,
    theme,
    dockCollapsed,
    setDockCollapsed,
    activeDockTab,
    setActiveDockTab,
    project,
    setProject,
    aiOptIn,
    vectorShapes,
    selectedShapeIds,
    setSelectedShapeIds,
    updateVectorShape,
    publishFrames,
    selectedFrameIds,
    setSelectedFrameIds,
    updatePublishFrame,
    selectedLayer,
    bringForward,
    sendBackward,
    deleteSelectedObjects,
    setLayerOpacity,
    setLayerBlendMode,
  } = useStudio();

  // State for dock width & resize dragging
  const [dockWidth, setDockWidth] = useState<number>(() => {
    const saved = localStorage.getItem('suiza_dock_width');
    return saved ? Math.max(280, Math.min(560, parseInt(saved))) : 340;
  });
  const [isResizing, setIsResizing] = useState(false);

  // State to toggle the compact Live Inspector header
  const [showLiveInspector, setShowLiveInspector] = useState(true);

  // State for Dual-Panel (Split Dock) mode: Upper (Styling/Contextual) & Lower (Structure/Session)
  const [splitDock, setSplitDock] = useState<boolean>(() => {
    return localStorage.getItem('suiza_split_dock') === 'true';
  });
  const [splitRatio, setSplitRatio] = useState<number>(55); // percentage for upper panel
  const [isSplitting, setIsSplitting] = useState(false);

  // Lower panel active tab in split mode (defaults to 'layers' or 'history')
  const [lowerDockTab, setLowerDockTab] = useState<string>('layers');

  // Popover state for full panel switcher dropdown
  const [showPanelPicker, setShowPanelPicker] = useState(false);
  const panelPickerRef = useRef<HTMLDivElement>(null);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('suiza_dock_width', dockWidth.toString());
  }, [dockWidth]);

  useEffect(() => {
    localStorage.setItem('suiza_split_dock', splitDock.toString());
  }, [splitDock]);

  // Close panel switcher popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelPickerRef.current && !panelPickerRef.current.contains(e.target as Node)) {
        setShowPanelPicker(false);
      }
    };
    if (showPanelPicker) {
      window.addEventListener('mousedown', handleClickOutside);
      return () => window.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPanelPicker]);

  // Define specialized panel list per persona
  const photoTabs: PanelTabConfig[] = [
    { id: 'layers', label: 'Layers', shortLabel: 'Layers', category: 'structure', badge: `${project.layers.length}`, icon: <Layers className="w-3.5 h-3.5" />, shortcut: 'F7 / ⌘L' },
    { id: 'typography', label: 'Character & Fonts', shortLabel: 'Type', category: 'styling', icon: <Type className="w-3.5 h-3.5 text-sky-500" />, shortcut: '⌘T' },
    { id: 'swatches', label: 'Swatches & Palettes', shortLabel: 'Swatches', category: 'styling', icon: <Palette className="w-3.5 h-3.5 text-pink-500" />, shortcut: '⌘K' },
    { id: 'adjustments', label: 'Adjustments', shortLabel: 'Adjust', category: 'styling', icon: <Sliders className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'properties', label: 'Properties', shortLabel: 'Props', category: 'structure', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'History & Snapshots', shortLabel: 'History', category: 'utility', icon: <History className="w-3.5 h-3.5" />, shortcut: '⌘Y' },
    { id: 'ai', label: 'AI Assistant', shortLabel: 'AI', category: 'utility', icon: <Sparkles className={`w-3.5 h-3.5 ${aiOptIn ? 'text-purple-600 dark:text-purple-400' : ''}`} /> },
  ];

  const vectorTabs: PanelTabConfig[] = [
    { id: 'pathfinder', label: 'Pathfinder & Boolean', shortLabel: 'Pathfinder', category: 'styling', badge: selectedShapeIds.length >= 2 ? `${selectedShapeIds.length}` : undefined, icon: <Combine className="w-3.5 h-3.5 text-sky-500" />, shortcut: 'Shift+⌘P' },
    { id: 'typography', label: 'Character & Fonts', shortLabel: 'Type', category: 'styling', icon: <Type className="w-3.5 h-3.5 text-sky-500" />, shortcut: '⌘T' },
    { id: 'stroke', label: 'Stroke & Appearance', shortLabel: 'Stroke', category: 'styling', icon: <Paintbrush className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'swatches', label: 'Swatches & Palettes', shortLabel: 'Swatches', category: 'styling', icon: <Palette className="w-3.5 h-3.5 text-pink-500" />, shortcut: '⌘K' },
    { id: 'properties', label: 'Transform & Bounds', shortLabel: 'Transform', category: 'structure', badge: selectedShapeIds.length > 0 ? `${selectedShapeIds.length}` : undefined, icon: <Shapes className="w-3.5 h-3.5" /> },
    { id: 'layers', label: 'Layers & Objects', shortLabel: 'Layers', category: 'structure', badge: `${vectorShapes.length}`, icon: <Layers className="w-3.5 h-3.5" />, shortcut: 'F7 / ⌘L' },
    { id: 'history', label: 'History & Snapshots', shortLabel: 'History', category: 'utility', icon: <History className="w-3.5 h-3.5" />, shortcut: '⌘Y' },
  ];

  const publishTabs: PanelTabConfig[] = [
    { id: 'pages', label: 'Pages & Spreads', shortLabel: 'Pages', category: 'structure', badge: '3 Spreads', icon: <BookOpen className="w-3.5 h-3.5 text-pink-500" />, shortcut: 'F12' },
    { id: 'typography', label: 'Typography & Styles', shortLabel: 'Type', category: 'styling', icon: <Type className="w-3.5 h-3.5 text-sky-500" />, shortcut: '⌘T' },
    { id: 'swatches', label: 'Swatches & Colors', shortLabel: 'Swatches', category: 'styling', icon: <Palette className="w-3.5 h-3.5 text-pink-500" />, shortcut: '⌘K' },
    { id: 'wrap', label: 'Text Wrap', shortLabel: 'Wrap', category: 'styling', icon: <WrapText className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'properties', label: 'Frame Bounds', shortLabel: 'Bounds', category: 'structure', badge: selectedFrameIds.length > 0 ? `${selectedFrameIds.length}` : undefined, icon: <Shapes className="w-3.5 h-3.5 text-cyan-500" /> },
    { id: 'preflight', label: 'Preflight & Output', shortLabel: 'Preflight', category: 'utility', badge: '0 Err', icon: <FileCheck className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'layers', label: 'Layers Stack', shortLabel: 'Layers', category: 'structure', badge: `${publishFrames.length}`, icon: <Layers className="w-3.5 h-3.5" />, shortcut: 'F7 / ⌘L' },
    { id: 'history', label: 'History & Snapshots', shortLabel: 'History', category: 'utility', icon: <History className="w-3.5 h-3.5" />, shortcut: '⌘Y' },
  ];

  const currentTabs = persona === 'photo' ? photoTabs : persona === 'vector' ? vectorTabs : publishTabs;

  // Selected active tab object
  const activeTabConfig = currentTabs.find(t => t.id === activeDockTab) || currentTabs[0];

  // Auto-switch to valid tab if persona switches
  useEffect(() => {
    const validTabIds = currentTabs.map(t => t.id);
    if (!validTabIds.includes(activeDockTab)) {
      setActiveDockTab(currentTabs[0]?.id || 'layers');
    }
    if (!validTabIds.includes(lowerDockTab)) {
      setLowerDockTab(validTabIds.includes('layers') ? 'layers' : validTabIds[validTabIds.length - 1]);
    }
  }, [persona, currentTabs, activeDockTab, lowerDockTab, setActiveDockTab]);

  // Primary pinned tabs for quick 1-click switcher without horizontal overflow
  // (3-4 primary tabs tailored for each persona)
  const pinnedTabs = currentTabs.slice(0, 4);

  // Active object mapping based on active persona
  const activeVectorShape = vectorShapes.find(s => selectedShapeIds.includes(s.id));
  const activePublishFrame = publishFrames.find(f => selectedFrameIds.includes(f.id));
  const activePhotoLayer = selectedLayer || project.layers[0];

  const hasVectorSelection = selectedShapeIds.length > 0;
  const hasPublishSelection = selectedFrameIds.length > 0;
  const hasPhotoSelection = !!selectedLayer;

  const inputBg = theme.isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.4)';
  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.25)';

  // Mouse resize handler for dock width
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = dockWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const newWidth = Math.max(280, Math.min(540, startWidth + deltaX));
      setDockWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Mouse resize handler for split dock ratio
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSplitting(true);
    const container = e.currentTarget.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const relativeY = moveEvent.clientY - rect.top;
      const percentage = Math.max(25, Math.min(75, (relativeY / rect.height) * 100));
      setSplitRatio(percentage);
    };

    const handleMouseUp = () => {
      setIsSplitting(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Function to render panel content by tab ID
  const renderPanelContent = useCallback((tabId: string) => {
    switch (tabId) {
      case 'layers':
        return <LayersPanel />;
      case 'typography':
        return <TypographyPanel />;
      case 'swatches':
        return <SwatchesPanel />;
      case 'adjustments':
        return <AdjustmentsPanel />;
      case 'properties':
        return <PropertiesPanel />;
      case 'history':
        return <HistoryPanel />;
      case 'ai':
        return <AiAgentPanel />;
      case 'pathfinder':
        return <VectorPathfinderPanel />;
      case 'stroke':
        return <VectorStrokePanel />;
      case 'pages':
        return <PublishPagesPanel />;
      case 'preflight':
        return <PublishPreflightPanel />;
      case 'wrap':
        return <PublishTextWrapPanel />;
      default:
        return <LayersPanel />;
    }
  }, []);

  // When dock is collapsed: show the sleek vertical studio rail on the right edge
  // Adobe/Affinity users love this because every tool is 1-click away even when collapsed!
  if (dockCollapsed) {
    return (
      <aside
        className="w-11 border-l flex flex-col items-center py-2 select-none z-20 shrink-0 transition-colors h-full justify-between"
        style={{ backgroundColor: theme.bgPanel, borderColor: theme.border }}
      >
        <div className="flex flex-col items-center w-full">
          {/* Expand Toggle */}
          <button
            onClick={() => setDockCollapsed(false)}
            title="Expand Studio Dock (⌘\)"
            className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10 mb-2"
            style={{ color: theme.textSecondary }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="w-6 h-px mb-2 border-b" style={{ borderColor: theme.border }} />

          {/* Vertical Studio Rail Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full px-1">
            {currentTabs.map(tab => {
              const isActive = activeDockTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setDockCollapsed(false);
                    setActiveDockTab(tab.id);
                  }}
                  className={`w-8 h-8 rounded flex items-center justify-center transition-all relative group ${
                    isActive
                      ? theme.isLight
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                        : 'bg-white/15 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title={`${tab.label} ${tab.shortcut ? `(${tab.shortcut})` : ''}`}
                >
                  {tab.icon}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#0d99ff]" />
                  )}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 text-[8px] px-1 py-0.2 rounded-full font-mono bg-[#0d99ff] text-white font-bold leading-tight">
                      {tab.badge.length > 3 ? '•' : tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom studio rail tools */}
        <div className="flex flex-col items-center gap-1.5 pb-1">
          <button
            onClick={() => {
              setDockCollapsed(false);
              setSplitDock(prev => !prev);
            }}
            title="Open Dual Stacked Dock"
            className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="flex select-none z-20 shrink-0 h-full transition-colors relative"
      style={{
        width: `${dockWidth + 42}px`, // panel body width + 42px studio rail
        backgroundColor: theme.bgPanel,
        borderColor: theme.border,
      }}
    >
      {/* =====================================================================
          1. DRAGGABLE RESIZE HANDLE (LEFT BORDER)
          ===================================================================== */}
      <div
        onMouseDown={handleMouseDownResize}
        onDoubleClick={() => setDockWidth(prev => prev === 340 ? 460 : 340)}
        title="Drag to resize dock width (Double-click to toggle width)"
        className={`absolute left-0 top-0 bottom-0 w-1.5 -ml-1 cursor-col-resize z-30 transition-colors group flex items-center justify-center ${
          isResizing ? 'bg-[#0d99ff]/60' : 'hover:bg-[#0d99ff]/40'
        }`}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-2.5 h-2.5 text-[#0d99ff]" />
        </div>
      </div>

      {/* =====================================================================
          2. MAIN DOCK BODY (HEADER, INSPECTOR & TAB PANELS)
          ===================================================================== */}
      <div
        className="flex-1 flex flex-col border-l overflow-hidden h-full"
        style={{ borderColor: theme.border }}
      >
        {/* =====================================================================
            REWORKED DOCK HEADER: CLEAN SELECTOR + PINNED TABS + DUAL SPLIT TOGGLE
            (Zero horizontal scrolling!)
            ===================================================================== */}
        <div
          className="h-9 px-2 border-b flex items-center justify-between text-xs shrink-0 relative"
          style={{
            backgroundColor: theme.bgSubtle,
            borderColor: theme.border,
          }}
        >
          {/* Active Panel Dropdown Selector */}
          <div className="relative" ref={panelPickerRef}>
            <button
              onClick={() => setShowPanelPicker(prev => !prev)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold transition-all border ${
                theme.isLight
                  ? 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50 shadow-xs'
                  : 'bg-white/10 text-white border-white/10 hover:bg-white/15'
              }`}
              title="Click to switch dock panel"
            >
              <div className="shrink-0">{activeTabConfig.icon}</div>
              <span className="truncate max-w-[110px]">{activeTabConfig.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
            </button>

            {/* Smart Panel Navigator Popover */}
            {showPanelPicker && (
              <div
                className="absolute left-0 top-full mt-1 w-64 rounded-lg shadow-2xl border p-1.5 z-50 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
                style={{
                  backgroundColor: theme.isLight ? '#ffffff' : '#1e293b',
                  borderColor: theme.borderStrong,
                  color: theme.textPrimary,
                }}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {persona.toUpperCase()} PANELS & DOCKS
                </div>

                <div className="space-y-0.5 mt-1">
                  {currentTabs.map(tab => {
                    const isSelected = activeDockTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveDockTab(tab.id);
                          setShowPanelPicker(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors text-left ${
                          isSelected
                            ? 'bg-[#0d99ff] text-white font-semibold'
                            : 'hover:bg-black/5 dark:hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="shrink-0">{tab.icon}</span>
                          <span className="truncate">{tab.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {tab.badge && (
                            <span
                              className={`text-[10px] px-1 rounded font-mono ${
                                isSelected ? 'bg-white/20 text-white' : 'opacity-60'
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}
                          {tab.shortcut && (
                            <span
                              className={`text-[9px] font-mono ${
                                isSelected ? 'text-white/80' : 'opacity-50'
                              }`}
                            >
                              {tab.shortcut}
                            </span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t my-1.5" style={{ borderColor: theme.border }} />

                {/* Quick Split Dock Option in Dropdown */}
                <button
                  onClick={() => {
                    setSplitDock(prev => !prev);
                    setShowPanelPicker(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-left font-medium text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <SplitSquareVertical className="w-3.5 h-3.5 text-purple-400" />
                    <span>Dual Dock (Split View)</span>
                  </div>
                  <span className={`text-[10px] font-bold ${splitDock ? 'text-[#0d99ff]' : 'opacity-50'}`}>
                    {splitDock ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Pinned Quick Tabs: Compact segmented group of primary tabs (Zero horizontal overflow!) */}
          <div className="flex items-center gap-1">
            {pinnedTabs.map(tab => {
              const isActive = activeDockTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDockTab(tab.id)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 shrink-0 ${
                    isActive
                      ? theme.isLight
                        ? 'bg-slate-200 text-slate-900 font-bold'
                        : 'bg-white/15 text-white font-bold'
                      : theme.isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={`${tab.label} ${tab.shortcut ? `(${tab.shortcut})` : ''}`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Header Controls: Split Dock toggle + Collapse Button */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSplitDock(prev => !prev)}
              title={splitDock ? 'Switch to Single Panel View' : 'Split Dock into Dual Panels (Upper & Lower)'}
              className={`p-1 rounded transition-colors ${
                splitDock
                  ? 'bg-[#0d99ff] text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
              style={{ color: splitDock ? '#ffffff' : theme.textSecondary }}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setDockCollapsed(true)}
              title="Collapse Dock Panel (⌘\)"
              className="p-1 rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
              style={{ color: theme.textSecondary }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =====================================================================
            PERSISTENT LIVE PROPERTY INSPECTOR: MAPS DIRECTLY TO ACTIVE OBJECT
            ===================================================================== */}
        <div
          className="border-b px-2.5 py-1.5 text-xs shrink-0 transition-colors"
          style={{
            backgroundColor: theme.isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.03)',
            borderColor: theme.border,
          }}
        >
          {/* Live Inspector Bar Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor: boxBg,
                  borderColor: theme.borderStrong,
                  color: theme.accent,
                }}
              >
                {persona === 'vector'
                  ? selectedShapeIds.length > 1
                    ? `Group (${selectedShapeIds.length})`
                    : activeVectorShape
                    ? activeVectorShape.type.toUpperCase()
                    : 'Artboard'
                  : persona === 'publish'
                  ? selectedFrameIds.length > 1
                    ? `Group (${selectedFrameIds.length})`
                    : activePublishFrame
                    ? activePublishFrame.type.toUpperCase()
                    : 'Document'
                  : activePhotoLayer
                  ? activePhotoLayer.type.toUpperCase()
                  : 'Canvas'}
              </span>
              <span
                className="font-bold text-[11px] truncate max-w-[140px]"
                style={{ color: theme.textPrimary }}
                title={
                  persona === 'vector'
                    ? activeVectorShape?.name || activeVectorShape?.text || 'No shape selected'
                    : persona === 'publish'
                    ? activePublishFrame?.title || activePublishFrame?.name || 'No frame selected'
                    : activePhotoLayer?.name || 'No layer selected'
                }
              >
                {persona === 'vector'
                  ? activeVectorShape?.name || (activeVectorShape?.text ? `"${activeVectorShape.text.slice(0, 14)}"` : activeVectorShape ? `Vector ${activeVectorShape.type}` : 'Click shape')
                  : persona === 'publish'
                  ? activePublishFrame?.title || activePublishFrame?.name || (activePublishFrame ? `Frame ${activePublishFrame.type}` : 'Click frame')
                  : activePhotoLayer?.name || 'Click layer'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={bringForward}
                title="Bring Forward (Ctrl+])"
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                style={{ color: theme.textSecondary }}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={sendBackward}
                title="Send Backward (Ctrl+[)"
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                style={{ color: theme.textSecondary }}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={deleteSelectedObjects}
                title="Delete Selected (Delete)"
                className="p-1 rounded hover:bg-rose-500/20 text-rose-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowLiveInspector(prev => !prev)}
                title={showLiveInspector ? 'Collapse Live Inspector' : 'Expand Live Inspector'}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ml-1"
                style={{ color: theme.textSecondary }}
              >
                {showLiveInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Live Property Inputs (Coordinates, Dimensions & Styling) */}
          {showLiveInspector && (
            <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: theme.border }}>
              {/* 1. VECTOR ACTIVE OBJECT PROPERTIES */}
              {persona === 'vector' && activeVectorShape && (
                <>
                  <div className="grid grid-cols-4 gap-1 font-mono">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: inputBg, borderColor: theme.borderStrong }}>
                      <span className="text-[9px] font-bold opacity-60">X</span>
                      <input
                        type="number"
                        value={Math.round(activeVectorShape.x)}
                        onChange={e => updateVectorShape(activeVectorShape.id, { x: parseInt(e.target.value) || 0 })}
                        className="w-full bg-transparent text-[10px] font-semibold focus:outline-none"
                        style={{ color: theme.textPrimary }}
                      />
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: inputBg, borderColor: theme.borderStrong }}>
                      <span className="text-[9px] font-bold opacity-60">Y</span>
                      <input
                        type="number"
                        value={Math.round(activeVectorShape.y)}
                        onChange={e => updateVectorShape(activeVectorShape.id, { y: parseInt(e.target.value) || 0 })}
                        className="w-full bg-transparent text-[10px] font-semibold focus:outline-none"
                        style={{ color: theme.textPrimary }}
                      />
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: inputBg, borderColor: theme.borderStrong }}>
                      <span className="text-[9px] font-bold opacity-60">W</span>
                      <input
                        type="number"
                        value={Math.round(activeVectorShape.width)}
                        onChange={e => updateVectorShape(activeVectorShape.id, { width: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full bg-transparent text-[10px] font-semibold focus:outline-none"
                        style={{ color: theme.textPrimary }}
                      />
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: inputBg, borderColor: theme.borderStrong }}>
                      <span className="text-[9px] font-bold opacity-60">H</span>
                      <input
                        type="number"
                        value={Math.round(activeVectorShape.height)}
                        onChange={e => updateVectorShape(activeVectorShape.id, { height: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full bg-transparent text-[10px] font-semibold focus:outline-none"
                        style={{ color: theme.textPrimary }}
                      />
                    </div>
                  </div>

                  {/* Fill & Stroke Quick Color Pickers */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold" style={{ color: theme.textSecondary }}>Fill:</span>
                      <input
                        type="color"
                        value={activeVectorShape.fill.startsWith('#') ? activeVectorShape.fill : '#0d99ff'}
                        onChange={e => updateVectorShape(activeVectorShape.id, { fill: e.target.value })}
                        className="w-4 h-4 rounded-xs border cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={activeVectorShape.fill}
                        onChange={e => updateVectorShape(activeVectorShape.id, { fill: e.target.value })}
                        className="w-14 px-1 py-0.5 rounded border text-[10px] font-mono uppercase"
                        style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold" style={{ color: theme.textSecondary }}>Stroke:</span>
                      <input
                        type="color"
                        value={activeVectorShape.stroke.startsWith('#') ? activeVectorShape.stroke : '#0f172a'}
                        onChange={e => updateVectorShape(activeVectorShape.id, { stroke: e.target.value })}
                        className="w-4 h-4 rounded-xs border cursor-pointer p-0"
                      />
                      <input
                        type="number"
                        min="0"
                        max="48"
                        value={activeVectorShape.strokeWidth}
                        onChange={e => updateVectorShape(activeVectorShape.id, { strokeWidth: parseInt(e.target.value) || 0 })}
                        className="w-8 px-1 py-0.5 rounded border text-[10px] font-mono text-center font-bold"
                        style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 2. PUBLISH ACTIVE FRAME PROPERTIES */}
              {persona === 'publish' && activePublishFrame && (
                <div className="grid grid-cols-4 gap-1 font-mono">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: inputBg, borderColor: theme.borderStrong }}>
                    <span className="text-[9px] font-bold opacity-60">X</span>
                    <input
                      type="number"
                      value={Math.round(activePublishFrame.x)}
                      onChange={e => updatePublishFrame(activePublishFrame.id, { x: parseInt(e.target.value) || 0 })}
                      className="w-full bg-transparent text-[10px] font-semibold focus:outline-none"
                      style={{ color: theme.textPrimary }}
                    />
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: inputBg, borderColor: theme.borderStrong }}>
                    <span className="text-[9px] font-bold opacity-60">Y</span>
                    <input
                      type="number"
                      value={Math.round(activePublishFrame.y)}
                      onChange={e => updatePublishFrame(activePublishFrame.id, { y: parseInt(e.target.value) || 0 })}
                      className="w-full bg-transparent text-[10px] font-semibold focus:outline-none"
                      style={{ color: theme.textPrimary }}
                    />
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: inputBg, borderColor: theme.borderStrong }}>
                    <span className="text-[9px] font-bold opacity-60">W</span>
                    <input
                      type="number"
                      value={Math.round(activePublishFrame.width)}
                      onChange={e => updatePublishFrame(activePublishFrame.id, { width: Math.max(10, parseInt(e.target.value) || 10) })}
                      className="w-full bg-transparent text-[10px] font-semibold focus:outline-none"
                      style={{ color: theme.textPrimary }}
                    />
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: inputBg, borderColor: theme.borderStrong }}>
                    <span className="text-[9px] font-bold opacity-60">H</span>
                    <input
                      type="number"
                      value={Math.round(activePublishFrame.height)}
                      onChange={e => updatePublishFrame(activePublishFrame.id, { height: Math.max(10, parseInt(e.target.value) || 10) })}
                      className="w-full bg-transparent text-[10px] font-semibold focus:outline-none"
                      style={{ color: theme.textPrimary }}
                    />
                  </div>
                </div>
              )}

              {/* 3. PHOTO ACTIVE LAYER PROPERTIES */}
              {persona === 'photo' && activePhotoLayer && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold" style={{ color: theme.textSecondary }}>Op:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activePhotoLayer.opacity}
                      onChange={e => setLayerOpacity(activePhotoLayer.id, parseInt(e.target.value) || 0)}
                      className="w-full accent-[#0d99ff] h-1.5 rounded cursor-pointer"
                    />
                    <span className="text-[10px] font-mono font-bold w-7 text-right" style={{ color: theme.textPrimary }}>
                      {activePhotoLayer.opacity}%
                    </span>
                  </div>

                  <select
                    value={activePhotoLayer.blendMode}
                    onChange={e => setLayerBlendMode(activePhotoLayer.id, e.target.value as any)}
                    className="px-1.5 py-0.5 rounded border text-[10px] font-medium"
                    style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
                  >
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                    <option value="color-dodge">Color Dodge</option>
                  </select>
                </div>
              )}

              {/* Empty selection state: quick select button */}
              {((persona === 'vector' && !hasVectorSelection) ||
                (persona === 'publish' && !hasPublishSelection) ||
                (persona === 'photo' && !hasPhotoSelection)) && (
                <div className="flex items-center justify-between text-[11px] py-0.5">
                  <span style={{ color: theme.textMuted }}>No element selected</span>
                  <button
                    onClick={() => {
                      if (persona === 'vector' && vectorShapes.length > 0) {
                        setSelectedShapeIds([vectorShapes[0].id]);
                      } else if (persona === 'publish' && publishFrames.length > 0) {
                        setSelectedFrameIds([publishFrames[0].id]);
                      } else if (project.layers.length > 0) {
                        setProject(p => ({ ...p, selectedLayerId: p.layers[0].id }));
                      }
                    }}
                    className="px-2 py-0.5 rounded border text-[10px] font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    style={{ borderColor: theme.borderStrong, color: theme.accent }}
                  >
                    Select First Object
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =====================================================================
            PANEL CONTENT AREA: SINGLE MODE OR DUAL STACKED DOCK (SPLIT MODE)
            ===================================================================== */}
        {!splitDock ? (
          /* Single Panel Mode: Takes full vertical height */
          <div className="flex-1 overflow-hidden" style={{ backgroundColor: theme.bgPanel }}>
            {renderPanelContent(activeDockTab)}
          </div>
        ) : (
          /* Dual Stacked Dock Mode: Upper panel + Draggable splitter + Lower panel */
          <div className="flex-1 flex flex-col overflow-hidden relative" style={{ backgroundColor: theme.bgPanel }}>
            {/* UPPER PANEL: Contextual / Styling Panel */}
            <div
              className="overflow-hidden flex flex-col"
              style={{ height: `${splitRatio}%` }}
            >
              <div
                className="px-2 py-1 border-b flex items-center justify-between text-[11px] font-bold shrink-0"
                style={{ backgroundColor: theme.bgSubtle, borderColor: theme.border }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">UPPER DOCK</span>
                  <span className="text-[#0d99ff] flex items-center gap-1">
                    {activeTabConfig.icon}
                    {activeTabConfig.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {currentTabs.filter(t => t.id !== lowerDockTab).slice(0, 3).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDockTab(tab.id)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        activeDockTab === tab.id
                          ? 'bg-[#0d99ff] text-white'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={tab.label}
                    >
                      {tab.shortLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                {renderPanelContent(activeDockTab)}
              </div>
            </div>

            {/* HORIZONTAL SPLITTER BAR */}
            <div
              onMouseDown={handleSplitterMouseDown}
              title="Drag to resize upper and lower panel height"
              className={`h-2 border-y cursor-row-resize z-10 flex items-center justify-center transition-colors select-none ${
                isSplitting ? 'bg-[#0d99ff]/60 border-[#0d99ff]' : 'hover:bg-[#0d99ff]/30'
              }`}
              style={{
                backgroundColor: theme.isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
                borderColor: theme.border,
              }}
            >
              <GripHorizontal className="w-3 h-3 opacity-60 text-slate-400" />
            </div>

            {/* LOWER PANEL: Structural / Session Panel (Layers, History, Pages) */}
            <div
              className="overflow-hidden flex flex-col flex-1"
            >
              <div
                className="px-2 py-1 border-b flex items-center justify-between text-[11px] font-bold shrink-0"
                style={{ backgroundColor: theme.bgSubtle, borderColor: theme.border }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">LOWER DOCK</span>
                  <span className="text-pink-500 flex items-center gap-1">
                    {currentTabs.find(t => t.id === lowerDockTab)?.icon}
                    {currentTabs.find(t => t.id === lowerDockTab)?.label || 'Layers'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {['layers', 'history', persona === 'publish' ? 'pages' : 'swatches'].map(tabId => {
                    const tab = currentTabs.find(t => t.id === tabId);
                    if (!tab) return null;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setLowerDockTab(tab.id)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                          lowerDockTab === tab.id
                            ? 'bg-[#0d99ff] text-white'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={tab.label}
                      >
                        {tab.icon}
                        <span>{tab.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                {renderPanelContent(lowerDockTab)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          3. VERTICAL STUDIO DOCK RAIL (ALWAYS VISIBLE & ZERO HORIZONTAL SCROLL)
          Adobe-familiar iconic strip: all panels displayed vertically at a glance!
          ===================================================================== */}
      <div
        className="w-11 border-l flex flex-col items-center py-2 select-none z-20 shrink-0 transition-colors h-full justify-between"
        style={{
          backgroundColor: theme.bgSubtle,
          borderColor: theme.border,
        }}
      >
        <div className="flex flex-col items-center w-full">
          {/* Vertical Studio Rail Icons */}
          <div className="flex flex-col items-center gap-1 w-full px-1">
            {currentTabs.map(tab => {
              const isActive = activeDockTab === tab.id;
              const isLowerActive = splitDock && lowerDockTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveDockTab(tab.id);
                  }}
                  className={`w-8 h-8 rounded flex items-center justify-center transition-all relative group ${
                    isActive
                      ? theme.isLight
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-300 font-bold'
                        : 'bg-white/20 text-white shadow-xs font-bold'
                      : isLowerActive
                      ? 'bg-[#0d99ff]/20 text-[#0d99ff]'
                      : 'text-neutral-400 hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  title={`${tab.label} ${tab.shortcut ? `(${tab.shortcut})` : ''}`}
                >
                  {tab.icon}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#0d99ff]" />
                  )}
                  {isLowerActive && !isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-pink-500" />
                  )}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 text-[8px] px-1 py-0.2 rounded-full font-mono bg-[#0d99ff] text-white font-bold leading-tight">
                      {tab.badge.length > 3 ? '•' : tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Rail Actions */}
        <div className="flex flex-col items-center gap-1 pb-1">
          <button
            onClick={() => setSplitDock(prev => !prev)}
            title={splitDock ? 'Switch to Single Panel' : 'Split Dock into Dual Panels (Upper/Lower)'}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              splitDock
                ? 'bg-[#0d99ff] text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDockWidth(prev => (prev >= 440 ? 300 : prev >= 360 ? 460 : 360))}
            title="Cycle Dock Width (Compact / Standard / Wide)"
            className="w-8 h-8 rounded flex items-center justify-center transition-colors text-neutral-400 hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
