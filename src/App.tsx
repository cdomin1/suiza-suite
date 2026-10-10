import React from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { MacGlobalMenu } from './components/layout/MacGlobalMenu';
import { TopNav } from './components/layout/TopNav';
import { OptionBar } from './components/layout/OptionBar';
import { Toolbox } from './components/layout/Toolbox';
import { CanvasEngine } from './components/canvas/CanvasEngine';
import { DockingPanel } from './components/panels/DockingPanel';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { ExportModal } from './components/modals/ExportModal';
import { NewDocumentModal } from './components/modals/NewDocumentModal';
import { RustArchitectureModal } from './components/modals/RustArchitectureModal';
import { PluginsModal } from './components/modals/PluginsModal';
import { CloudSyncModal } from './components/modals/CloudSyncModal';
import { SpotlightModal } from './components/modals/SpotlightModal';
import { LinuxNativeModal } from './components/modals/LinuxNativeModal';
import { Command } from 'lucide-react';

const StudioMain: React.FC = () => {
  const { activeModal, activeShortcutHint, theme } = useStudio();

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden select-none font-sans"
      style={{
        backgroundColor: theme.bgMain,
        color: theme.textPrimary,
      }}
    >
      {/* 1. macOS Top Global Menu Bar (Finder Integrated) */}
      <MacGlobalMenu />

      {/* 2. macOS Application Window (Unified Titlebar, OptionBar, Workspace) */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Window Bar (Traffic Lights, Persona Switcher & Telemetry) */}
        <TopNav />

        {/* Contextual Tool Options Bar */}
        <OptionBar />

        {/* Central Workspace: Toolbar + Canvas Engine + Docking Panels */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Modular Tool Palette */}
          <Toolbox />

          {/* Central Hardware-Accelerated Interactive Canvas Engine */}
          <CanvasEngine />

          {/* Right Collapsible Inspector Dock */}
          <DockingPanel />
        </div>
      </div>

      {/* Modal Dialogs */}
      {activeModal === 'shortcuts' && <ShortcutsModal />}
      {activeModal === 'export' && <ExportModal />}
      {activeModal === 'new-doc' && <NewDocumentModal />}
      {activeModal === 'rust-arch' && <RustArchitectureModal />}
      {activeModal === 'plugins' && <PluginsModal />}
      {activeModal === 'cloud-sync' && <CloudSyncModal />}
      {activeModal === 'linux-native' && <LinuxNativeModal />}
      <SpotlightModal />

      {/* Visual Keystroke Shortcut HUD for Confirmation */}
      {activeShortcutHint && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md text-white border border-[#0d99ff]/60 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 z-50 animate-bounce text-xs font-mono">
          <Command className="w-3.5 h-3.5 text-[#0d99ff]" />
          <span>{activeShortcutHint}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <StudioMain />
    </StudioProvider>
  );
}

