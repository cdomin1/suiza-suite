import React from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';

interface SpreadItem {
  index: number;
  label: string;
  type: 'single-right' | 'facing' | 'single-left';
  pages: number[];
  parentMaster: string;
}

const DEFAULT_SPREADS: SpreadItem[] = [
  {
    index: 0,
    label: 'Page 1',
    type: 'single-right',
    pages: [1],
    parentMaster: 'A',
  },
  {
    index: 1,
    label: 'Pages 2–3',
    type: 'facing',
    pages: [2, 3],
    parentMaster: 'A',
  },
  {
    index: 2,
    label: 'Page 4',
    type: 'single-left',
    pages: [4],
    parentMaster: 'A',
  },
];

export const PublishPagesPanel: React.FC = () => {
  const {
    theme,
    publishSpreadIndex,
    setPublishSpreadIndex,
    publishMasterPage,
    setPublishMasterPage,
    showShortcutFeedback,
    pushHistoryStep,
  } = useStudio();

  const [spreads, setSpreads] = React.useState<SpreadItem[]>(DEFAULT_SPREADS);

  const totalPages = spreads.reduce((acc, s) => acc + s.pages.length, 0);

  const handleAddSpread = () => {
    const nextStartPage = totalPages + 1;
    const newSpread: SpreadItem = {
      index: spreads.length,
      label: `Pages ${nextStartPage}–${nextStartPage + 1}`,
      type: 'facing',
      pages: [nextStartPage, nextStartPage + 1],
      parentMaster: publishMasterPage.slice(0, 1) || 'A',
    };
    setSpreads(prev => [...prev, newSpread]);
    setPublishSpreadIndex(spreads.length);
    pushHistoryStep('Insert New Page Spread');
    showShortcutFeedback(`Added Spread (${newSpread.label})`);
  };

  const handleDuplicateSpread = () => {
    const active = spreads[publishSpreadIndex] || spreads[0];
    const nextStartPage = totalPages + 1;
    const dupSpread: SpreadItem = {
      ...active,
      index: spreads.length,
      label: `Pages ${nextStartPage}–${nextStartPage + 1} (Copy)`,
      pages: [nextStartPage, nextStartPage + 1],
    };
    setSpreads(prev => [...prev, dupSpread]);
    setPublishSpreadIndex(spreads.length);
    pushHistoryStep('Duplicate Spread');
    showShortcutFeedback('Duplicated Spread');
  };

  const handleDeleteSpread = () => {
    if (spreads.length <= 1) {
      showShortcutFeedback('Document must contain at least 1 spread');
      return;
    }
    const filtered = spreads.filter((_, idx) => idx !== publishSpreadIndex).map((s, idx) => ({ ...s, index: idx }));
    setSpreads(filtered);
    setPublishSpreadIndex(Math.max(0, publishSpreadIndex - 1));
    pushHistoryStep('Delete Spread');
    showShortcutFeedback('Deleted Spread');
  };

  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.25)';

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Panel Header */}
      <div
        className="px-3 py-2 border-b flex items-center justify-between"
        style={{ borderColor: theme.border, backgroundColor: theme.bgSubtle }}
      >
        <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>
          Pages
        </span>
        <span className="text-[10px] font-mono opacity-70" style={{ color: theme.textSecondary }}>
          {totalPages} Pages in {spreads.length} Spreads
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
        {/* =====================================================================
            TOP ZONE: PARENT / MASTER PAGES (InDesign CC Standard)
            ===================================================================== */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between" style={{ color: theme.textSecondary }}>
            <span>Parent Pages</span>
            <span className="text-[9px] font-mono opacity-60">Double-click to edit</span>
          </div>

          <div
            className="rounded border divide-y overflow-hidden"
            style={{ borderColor: theme.border, backgroundColor: boxBg }}
          >
            {[
              { id: 'None', label: '[None]', spreads: 'Single' },
              { id: 'A', label: 'A-Parent (Facing Pages)', spreads: '2 Pages' },
              { id: 'B', label: 'B-Parent (3-Column Grid)', spreads: '2 Pages' },
            ].map(m => {
              const isSelected = publishMasterPage === m.id || (m.id === 'A' && publishMasterPage.includes('A'));
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setPublishMasterPage(m.id);
                    showShortcutFeedback(`Applied ${m.label}`);
                  }}
                  className={`px-2.5 py-1.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? theme.isLight
                        ? 'bg-sky-50 text-sky-950 font-semibold'
                        : 'bg-sky-950/40 text-sky-200 font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Master thumbnail icon */}
                    <div className="w-5 h-4 border rounded-xs flex items-center justify-center bg-white dark:bg-neutral-800 text-[8px] font-mono font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                      {m.id === 'None' ? '·' : m.id}
                    </div>
                    <span className="text-xs truncate">{m.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            BOTTOM ZONE: SPREADS TREE (Facing Pages & Single Covers)
            ===================================================================== */}
        <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: theme.border }}>
          <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between" style={{ color: theme.textSecondary }}>
            <span>Document Pages</span>
            <span className="text-[9px] font-mono opacity-60">Facing Pages</span>
          </div>

          <div className="space-y-2">
            {spreads.map(spread => {
              const isSelected = publishSpreadIndex === spread.index;

              return (
                <div
                  key={spread.index}
                  onClick={() => {
                    setPublishSpreadIndex(spread.index);
                    showShortcutFeedback(`Selected Spread: ${spread.label}`);
                  }}
                  className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between group ${
                    isSelected
                      ? theme.isLight
                        ? 'bg-sky-50/70 border-sky-500 ring-2 ring-sky-500/20'
                        : 'bg-sky-950/30 border-sky-500 ring-2 ring-sky-500/20'
                      : 'hover:border-slate-400'
                  }`}
                  style={{
                    backgroundColor: isSelected ? undefined : boxBg,
                    borderColor: isSelected ? '#0d99ff' : theme.border,
                  }}
                >
                  {/* Left: Thumbnail Layout */}
                  <div className="flex items-center gap-3">
                    {/* Mini Spread Visualization */}
                    <div className="flex items-center justify-center h-12 w-20 bg-slate-200/50 dark:bg-black/40 rounded border border-black/5 dark:border-white/5 px-1">
                      {spread.type === 'single-right' && (
                        <div className="flex items-center">
                          {/* Empty left spine spacer */}
                          <div className="w-7 h-9 border-r border-dashed border-red-400/40 opacity-0" />
                          {/* Right Page 1 */}
                          <div className="w-7 h-9 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 shadow-2xs rounded-xs flex flex-col justify-between p-0.5 relative">
                            <span className="text-[7px] font-bold text-sky-600 dark:text-sky-400 font-mono leading-none">
                              {spread.parentMaster}
                            </span>
                            <div className="w-full h-0.5 bg-slate-200 dark:bg-neutral-800" />
                            <span className="text-[7px] font-mono text-center text-slate-500">1</span>
                          </div>
                        </div>
                      )}

                      {spread.type === 'facing' && (
                        <div className="flex items-center">
                          {/* Left Page 2 */}
                          <div className="w-7 h-9 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 shadow-2xs rounded-xs flex flex-col justify-between p-0.5 relative">
                            <span className="text-[7px] font-bold text-sky-600 dark:text-sky-400 font-mono leading-none">
                              {spread.parentMaster}
                            </span>
                            <div className="w-full h-0.5 bg-slate-200 dark:bg-neutral-800" />
                            <span className="text-[7px] font-mono text-center text-slate-500">2</span>
                          </div>
                          {/* Spine Line */}
                          <div className="w-px h-9 bg-red-400/70 mx-0.5" />
                          {/* Right Page 3 */}
                          <div className="w-7 h-9 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 shadow-2xs rounded-xs flex flex-col justify-between p-0.5 relative">
                            <span className="text-[7px] font-bold text-sky-600 dark:text-sky-400 font-mono leading-none">
                              {spread.parentMaster}
                            </span>
                            <div className="w-full h-0.5 bg-slate-200 dark:bg-neutral-800" />
                            <span className="text-[7px] font-mono text-center text-slate-500">3</span>
                          </div>
                        </div>
                      )}

                      {spread.type === 'single-left' && (
                        <div className="flex items-center">
                          {/* Left Page 4 */}
                          <div className="w-7 h-9 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 shadow-2xs rounded-xs flex flex-col justify-between p-0.5 relative">
                            <span className="text-[7px] font-bold text-sky-600 dark:text-sky-400 font-mono leading-none">
                              {spread.parentMaster}
                            </span>
                            <div className="w-full h-0.5 bg-slate-200 dark:bg-neutral-800" />
                            <span className="text-[7px] font-mono text-center text-slate-500">4</span>
                          </div>
                          {/* Empty right spine spacer */}
                          <div className="w-7 h-9 opacity-0" />
                        </div>
                      )}
                    </div>

                    {/* Label & Details */}
                    <div>
                      <span className="font-semibold text-xs block" style={{ color: theme.textPrimary }}>
                        {spread.label}
                      </span>
                      <span className="text-[10px] font-mono opacity-70" style={{ color: theme.textSecondary }}>
                        [{spread.parentMaster}] {spread.type === 'facing' ? 'Facing Spread' : 'Single Page'}
                      </span>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[#0d99ff] ring-4 ring-[#0d99ff]/20" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          BOTTOM ACTION BAR (InDesign CC Standard)
          ===================================================================== */}
      <div
        className="p-1.5 border-t flex items-center justify-between"
        style={{ borderColor: theme.border, backgroundColor: theme.bgSubtle }}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={handleAddSpread}
            title="Create New Page (Cmd+Shift+P)"
            className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDuplicateSpread}
            title="Duplicate Spread"
            className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={handleDeleteSpread}
          title="Delete Selected Page"
          className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
