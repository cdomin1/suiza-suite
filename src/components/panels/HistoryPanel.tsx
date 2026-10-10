import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { History, RotateCcw, Clock, Save, Check } from 'lucide-react';

export const HistoryPanel: React.FC = () => {
  const {
    history,
    historyIndex,
    restoreHistoryStep,
    triggerAutoSave,
    lastSavedAt,
    isOffline,
    theme,
  } = useStudio();

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Header Info */}
      <div
        className="p-2 border-b flex items-center justify-between"
        style={{ borderColor: theme.border }}
      >
        <span className="font-bold flex items-center gap-1.5" style={{ color: theme.textPrimary }}>
          <History className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          <span>Non-destructive History</span>
        </span>
        <button
          onClick={triggerAutoSave}
          title="Create Snapshot (Save State)"
          className="px-2 py-0.5 rounded border text-[10px] font-semibold flex items-center gap-1 transition-colors"
          style={{
            backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.4)',
            borderColor: theme.borderStrong,
            color: theme.textPrimary,
          }}
        >
          <Save className="w-3 h-3" />
          <span>Snapshot</span>
        </button>
      </div>

      {/* History Steps List */}
      <div
        className="flex-1 overflow-y-auto divide-y scrollbar-thin"
        style={{ borderColor: theme.border }}
      >
        {history.map((step, idx) => {
          const isActive = idx === historyIndex;
          const isFuture = idx > historyIndex;

          return (
            <div
              key={step.id}
              onClick={() => restoreHistoryStep(idx)}
              className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                isActive
                  ? theme.isLight
                    ? 'bg-sky-100 border-l-4 border-[#0d99ff] font-bold text-slate-950'
                    : 'bg-[#0d99ff]/25 border-l-2 border-[#0d99ff] text-white font-medium'
                  : isFuture
                  ? 'text-neutral-400 dark:text-neutral-500 line-through opacity-60'
                  : theme.isLight
                  ? 'text-slate-800 hover:bg-slate-100 font-medium'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-[10px] font-bold w-4 opacity-60">
                  {idx + 1}
                </span>
                <span className="truncate">{step.title}</span>
              </div>
              <span className="text-[9px] font-mono tabular-nums shrink-0 opacity-70">
                {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Backup Info */}
      <div
        className="p-2.5 border-t text-[10px] flex items-center justify-between"
        style={{
          backgroundColor: theme.bgSubtle,
          borderColor: theme.border,
          color: theme.textSecondary,
        }}
      >
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 opacity-70" />
          <span>Auto-Backup: {isOffline ? 'Local IndexedDB' : 'Cloud Sync Active'}</span>
        </span>
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Saved</span>
      </div>
    </div>
  );
};
