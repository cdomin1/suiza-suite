import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  History,
  RotateCcw,
  RotateCw,
  Clock,
  Save,
  Check,
  Trash2,
  Bookmark,
  Layers,
  Shapes,
  Type,
  Paintbrush,
  Sparkles,
  Sliders,
  Folder,
  ArrowUp,
  ArrowDown,
  Rewind,
  FastForward,
} from 'lucide-react';

// Helper to pick an intuitive icon based on the history title
const getStepIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('brush') || lower.includes('paint') || lower.includes('stroke')) {
    return <Paintbrush className="w-3.5 h-3.5 text-sky-400" />;
  }
  if (lower.includes('text') || lower.includes('font') || lower.includes('typo')) {
    return <Type className="w-3.5 h-3.5 text-pink-400" />;
  }
  if (lower.includes('shape') || lower.includes('rect') || lower.includes('ellipse')) {
    return <Shapes className="w-3.5 h-3.5 text-amber-400" />;
  }
  if (lower.includes('group') || lower.includes('folder')) {
    return <Folder className="w-3.5 h-3.5 text-purple-400" />;
  }
  if (lower.includes('delete') || lower.includes('clear')) {
    return <Trash2 className="w-3.5 h-3.5 text-rose-400" />;
  }
  if (lower.includes('swatch') || lower.includes('color') || lower.includes('fill')) {
    return <Sliders className="w-3.5 h-3.5 text-cyan-400" />;
  }
  if (lower.includes('snapshot') || lower.includes('checkpoint')) {
    return <Bookmark className="w-3.5 h-3.5 text-emerald-400" />;
  }
  return <Layers className="w-3.5 h-3.5 text-slate-400" />;
};

export const HistoryPanel: React.FC = () => {
  const {
    history,
    historyIndex,
    restoreHistoryStep,
    undo,
    redo,
    clearHistory,
    createSnapshot,
    lastSavedAt,
    isOffline,
    theme,
  } = useStudio();

  const [snapshotInput, setSnapshotInput] = useState('');
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);

  const handleCreateSnapshot = () => {
    createSnapshot(snapshotInput.trim() || undefined);
    setSnapshotInput('');
    setShowSnapshotDialog(false);
  };

  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.25)';
  const inputBg = theme.isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.4)';

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Panel Header */}
      <div
        className="p-2.5 border-b flex items-center justify-between"
        style={{ borderColor: theme.border, backgroundColor: theme.bgSubtle }}
      >
        <div className="flex items-center gap-1.5 font-bold" style={{ color: theme.textPrimary }}>
          <History className="w-4 h-4 text-sky-500" />
          <span>History Stack</span>
          <span className="text-[10px] font-mono opacity-70">
            ({historyIndex + 1}/{history.length})
          </span>
        </div>

        {/* Quick Undo / Redo Toolbar */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className={`p-1.5 rounded transition-colors ${
              historyIndex > 0
                ? 'hover:bg-black/10 dark:hover:bg-white/10 opacity-100 cursor-pointer'
                : 'opacity-30 cursor-not-allowed'
            }`}
            title="Undo Step (Ctrl+Z / ⌘Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={`p-1.5 rounded transition-colors ${
              historyIndex < history.length - 1
                ? 'hover:bg-black/10 dark:hover:bg-white/10 opacity-100 cursor-pointer'
                : 'opacity-30 cursor-not-allowed'
            }`}
            title="Redo Step (Ctrl+Shift+Z / ⇧⌘Z)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowSnapshotDialog(true)}
            className="px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 bg-[#0d99ff] text-white hover:bg-sky-500 transition-colors shadow-xs ml-1"
            title="Create Named Checkpoint"
          >
            <Bookmark className="w-3 h-3" />
            <span>Checkpoint</span>
          </button>
        </div>
      </div>

      {/* Snapshot Prompt Dialog */}
      {showSnapshotDialog && (
        <div className="p-2.5 border-b space-y-2 bg-sky-500/10" style={{ borderColor: theme.border }}>
          <label className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            Checkpoint Snapshot Name
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={snapshotInput}
              onChange={e => setSnapshotInput(e.target.value)}
              placeholder="e.g. Before Layout Reorganization..."
              className="flex-1 px-2 py-1 rounded border text-xs focus:outline-none focus:border-[#0d99ff]"
              style={{ backgroundColor: inputBg, borderColor: theme.borderStrong, color: theme.textPrimary }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateSnapshot()}
            />
            <button
              onClick={handleCreateSnapshot}
              className="px-2.5 py-1 rounded bg-[#0d99ff] text-white font-bold text-[10px]"
            >
              Save
            </button>
            <button
              onClick={() => setShowSnapshotDialog(false)}
              className="px-2 py-1 rounded border text-[10px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Time-Scrubber Slider */}
      {history.length > 1 && (
        <div className="px-3 py-1.5 border-b flex items-center gap-2" style={{ borderColor: theme.border, backgroundColor: boxBg }}>
          <span className="text-[9px] font-mono opacity-60">Scrub:</span>
          <input
            type="range"
            min="0"
            max={history.length - 1}
            value={historyIndex}
            onChange={e => restoreHistoryStep(parseInt(e.target.value) || 0)}
            className="flex-1 accent-[#0d99ff] cursor-ew-resize"
          />
          <span className="font-mono text-[10px] font-bold text-sky-500">
            #{historyIndex + 1}
          </span>
        </div>
      )}

      {/* Chronological Steps List */}
      <div
        className="flex-1 overflow-y-auto divide-y scrollbar-thin"
        style={{ borderColor: theme.border }}
      >
        {history.map((step, idx) => {
          const isActive = idx === historyIndex;
          const isPast = idx < historyIndex;
          const isFuture = idx > historyIndex;

          return (
            <div
              key={step.id}
              onClick={() => restoreHistoryStep(idx)}
              className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors group ${
                isActive
                  ? theme.isLight
                    ? 'bg-sky-100 border-l-4 border-[#0d99ff] font-bold text-slate-950 shadow-inner'
                    : 'bg-[#0d99ff]/20 border-l-4 border-[#0d99ff] text-white font-bold'
                  : isFuture
                  ? 'text-neutral-400 dark:text-neutral-500 opacity-60 hover:opacity-90 line-through'
                  : theme.isLight
                  ? 'text-slate-800 hover:bg-slate-100 font-medium'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
              title={`Click to jump to state #${idx + 1}: ${step.title}`}
            >
              <div className="flex items-center gap-2 truncate">
                {/* Step index pill */}
                <span className={`font-mono text-[10px] font-bold w-5 shrink-0 ${isActive ? 'text-sky-500' : 'opacity-50'}`}>
                  {idx + 1}
                </span>

                {/* Step action icon */}
                <div className="shrink-0">
                  {getStepIcon(step.title)}
                </div>

                {/* Step title */}
                <span className="truncate">
                  {step.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isActive && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#0d99ff] text-white">
                    Current
                  </span>
                )}
                <span className="text-[9px] font-mono tabular-nums opacity-60">
                  {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div
        className="p-2 border-t text-[10px] flex items-center justify-between"
        style={{
          backgroundColor: theme.bgSubtle,
          borderColor: theme.border,
          color: theme.textSecondary,
        }}
      >
        <button
          onClick={() => restoreHistoryStep(0)}
          className="hover:underline flex items-center gap-1 opacity-75 hover:opacity-100"
          title="Revert to initial state when document was created"
        >
          <Rewind className="w-3 h-3" />
          <span>Revert to Start</span>
        </button>

        <button
          onClick={clearHistory}
          className="hover:text-rose-500 transition-colors flex items-center gap-1 opacity-75 hover:opacity-100"
          title="Clear history stack and keep current state"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear History</span>
        </button>
      </div>
    </div>
  );
};
