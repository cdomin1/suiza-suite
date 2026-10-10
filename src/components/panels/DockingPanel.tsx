import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { AdjustmentsPanel } from './AdjustmentsPanel';
import { HistoryPanel } from './HistoryPanel';
import { AiAgentPanel } from './AiAgentPanel';
import { VectorPathfinderPanel } from './VectorPathfinderPanel';
import { VectorStrokePanel } from './VectorStrokePanel';
import { VectorSwatchesPanel } from './VectorSwatchesPanel';
import { PublishPagesPanel } from './PublishPagesPanel';
import { PublishTypographyPanel } from './PublishTypographyPanel';
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
} from 'lucide-react';

export const DockingPanel: React.FC = () => {
  const {
    persona,
    theme,
    dockCollapsed,
    setDockCollapsed,
    activeDockTab,
    setActiveDockTab,
    project,
    aiOptIn,
  } = useStudio();

  // Define specialized tabs per persona
  const photoTabs = [
    { id: 'layers', label: 'Layers', badge: `${project.layers.length}`, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'adjustments', label: 'Adjustments', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'properties', label: 'Properties', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'History', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'ai', label: 'AI Assist', icon: <Sparkles className={`w-3.5 h-3.5 ${aiOptIn ? 'text-purple-600 dark:text-purple-400' : ''}`} /> },
  ];

  const vectorTabs = [
    { id: 'pathfinder', label: 'Pathfinder', icon: <Combine className="w-3.5 h-3.5 text-sky-500" /> },
    { id: 'stroke', label: 'Stroke', icon: <Paintbrush className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'swatches', label: 'Swatches', icon: <Palette className="w-3.5 h-3.5 text-pink-500" /> },
    { id: 'properties', label: 'Transform', icon: <Shapes className="w-3.5 h-3.5" /> },
    { id: 'layers', label: 'Layers', badge: `${project.layers.length}`, icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  const publishTabs = [
    { id: 'pages', label: 'Pages', badge: '3 Spreads', icon: <BookOpen className="w-3.5 h-3.5 text-pink-500" /> },
    { id: 'typography', label: 'Typography', icon: <Type className="w-3.5 h-3.5 text-sky-500" /> },
    { id: 'wrap', label: 'Text Wrap', icon: <WrapText className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'properties', label: 'Frame Bounds', icon: <Shapes className="w-3.5 h-3.5 text-cyan-500" /> },
    { id: 'preflight', label: 'Preflight', badge: '0 Err', icon: <FileCheck className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'layers', label: 'Layers', badge: `${project.layers.length}`, icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  const currentTabs = persona === 'photo' ? photoTabs : persona === 'vector' ? vectorTabs : publishTabs;

  if (dockCollapsed) {
    return (
      <aside
        className="w-10 border-l flex flex-col items-center py-2 select-none z-20 shrink-0 transition-colors"
        style={{ backgroundColor: theme.bgPanel, borderColor: theme.border }}
      >
        <button
          onClick={() => setDockCollapsed(false)}
          title="Expand Docking Panels"
          className="p-1.5 rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          style={{ color: theme.textSecondary }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center gap-2 mt-4">
          {currentTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setDockCollapsed(false);
                setActiveDockTab(tab.id);
              }}
              className="p-1.5 rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              style={{ color: activeDockTab === tab.id ? theme.accent : theme.textSecondary }}
              title={tab.label}
            >
              {tab.icon}
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="w-80 border-l flex flex-col select-none z-20 shrink-0 h-full transition-colors"
      style={{
        backgroundColor: theme.bgPanel,
        borderColor: theme.border,
      }}
    >
      {/* Dock Tabs Header */}
      <div
        className="h-9 px-1.5 border-b flex items-center justify-between text-xs"
        style={{
          backgroundColor: theme.bgSubtle,
          borderColor: theme.border,
        }}
      >
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {currentTabs.map(tab => {
            const isActive = activeDockTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDockTab(tab.id)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 ${
                  isActive
                    ? theme.isLight
                      ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                      : 'bg-white/10 text-white font-semibold'
                    : theme.isLight
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] opacity-75 font-mono">({tab.badge})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setDockCollapsed(true)}
          title="Collapse Panel"
          className="p-1 rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
          style={{ color: theme.textSecondary }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: theme.bgPanel }}>
        {/* Photo Persona Tabs */}
        {activeDockTab === 'layers' && <LayersPanel />}
        {activeDockTab === 'adjustments' && <AdjustmentsPanel />}
        {activeDockTab === 'properties' && <PropertiesPanel />}
        {activeDockTab === 'history' && <HistoryPanel />}
        {activeDockTab === 'ai' && <AiAgentPanel />}

        {/* Vector Persona Tabs */}
        {activeDockTab === 'pathfinder' && <VectorPathfinderPanel />}
        {activeDockTab === 'stroke' && <VectorStrokePanel />}
        {activeDockTab === 'swatches' && <VectorSwatchesPanel />}

        {/* Publish Persona Tabs */}
        {activeDockTab === 'pages' && <PublishPagesPanel />}
        {activeDockTab === 'typography' && <PublishTypographyPanel />}
        {activeDockTab === 'preflight' && <PublishPreflightPanel />}
        {activeDockTab === 'wrap' && <PublishTextWrapPanel />}
      </div>
    </aside>
  );
};
