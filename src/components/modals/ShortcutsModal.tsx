import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { KeyboardShortcut } from '../../types';
import { DEFAULT_SHORTCUTS } from '../../constants/shortcuts';
import { X, Search, RotateCcw, Check, AlertTriangle, Key } from 'lucide-react';

export const ShortcutsModal: React.FC = () => {
  const {
    shortcuts,
    setShortcuts,
    setActiveModal,
    theme,
  } = useStudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordedKey, setRecordedKey] = useState<string>('');
  const [recordedCtrl, setRecordedCtrl] = useState(false);
  const [recordedShift, setRecordedShift] = useState(false);
  const [recordedAlt, setRecordedAlt] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const categories = ['All', 'Tools', 'File', 'Edit', 'View', 'Layer', 'Studio'];

  const filteredShortcuts = shortcuts.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Start recording new key for shortcut
  const handleStartEdit = (sc: KeyboardShortcut) => {
    setEditingId(sc.id);
    setRecordedKey(sc.key);
    setRecordedCtrl(!!sc.ctrl);
    setRecordedShift(!!sc.shift);
    setRecordedAlt(!!sc.alt);
    setConflictWarning(null);
  };

  // Capture keypress
  const handleKeyDownRecorder = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

    const newKey = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const alt = e.altKey;

    setRecordedKey(newKey);
    setRecordedCtrl(ctrl);
    setRecordedShift(shift);
    setRecordedAlt(alt);

    // Check for conflicts
    const conflict = shortcuts.find(
      s => s.id !== editingId &&
           s.key.toLowerCase() === newKey &&
           !!s.ctrl === ctrl &&
           !!s.shift === shift &&
           !!s.alt === alt
    );

    if (conflict) {
      setConflictWarning(`Conflict detected: Already assigned to "${conflict.name}"`);
    } else {
      setConflictWarning(null);
    }
  };

  // Save key assignment
  const handleSaveEdit = (id: string) => {
    setShortcuts(
      shortcuts.map(s => {
        if (s.id === id) {
          return {
            ...s,
            key: recordedKey,
            ctrl: recordedCtrl,
            shift: recordedShift,
            alt: recordedAlt,
          };
        }
        return s;
      })
    );
    setEditingId(null);
    setConflictWarning(null);
  };

  // Reset to default
  const handleResetDefaults = () => {
    setShortcuts(DEFAULT_SHORTCUTS);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div
        className="w-full max-w-2xl rounded-lg border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{ backgroundColor: theme.bgPanel, borderColor: theme.border }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-[#0d99ff]" />
            <div>
              <h2 className="text-sm font-semibold text-white">Keyboard Shortcuts & Hotkey Remapping</h2>
              <p className="text-xs text-neutral-400">Customize single-key and multi-key triggers with instant collision detection</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-white/10 space-y-3 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search command or key (e.g. Brush, Ctrl+Z, V)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded pl-9 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-[#0d99ff]"
              />
            </div>
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 rounded border border-white/10 hover:bg-white/10 text-xs text-neutral-300 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#0d99ff] text-white font-medium shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
          {filteredShortcuts.map(sc => {
            const isEditing = editingId === sc.id;

            return (
              <div
                key={sc.id}
                className="px-3 py-2.5 flex items-center justify-between hover:bg-white/5 rounded text-xs transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-neutral-200 flex items-center gap-2">
                    <span>{sc.name}</span>
                    <span className="text-[10px] text-neutral-500 px-1.5 py-0.2 rounded bg-black/30 border border-white/5">
                      {sc.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400">{sc.description}</div>
                </div>

                {/* Key Binding Button / Input */}
                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Press key..."
                        value={`${recordedCtrl ? 'Ctrl+' : ''}${recordedShift ? 'Shift+' : ''}${recordedAlt ? 'Alt+' : ''}${recordedKey.toUpperCase()}`}
                        onKeyDown={handleKeyDownRecorder}
                        readOnly
                        className="w-32 px-2 py-1 text-center font-mono text-xs rounded bg-sky-950 border border-[#0d99ff] text-white shadow-inner focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(sc.id)}
                        className="p-1 rounded bg-[#0d99ff] text-white hover:bg-sky-400"
                        title="Confirm Remap"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setConflictWarning(null); }}
                        className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(sc)}
                      title="Click to remap shortcut"
                      className="px-2.5 py-1 rounded bg-black/40 border border-white/10 hover:border-[#0d99ff] text-neutral-200 font-mono text-xs flex items-center gap-1 group transition-colors"
                    >
                      <span>
                        {sc.ctrl ? 'Ctrl+' : ''}
                        {sc.shift ? 'Shift+' : ''}
                        {sc.alt ? 'Alt+' : ''}
                        {sc.key.toUpperCase()}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Conflict Warning Notice */}
        {conflictWarning && (
          <div className="px-4 py-2 bg-amber-950/50 border-t border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{conflictWarning}</span>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/20 flex justify-between items-center text-xs">
          <span className="text-neutral-400">Changes persist to local profile automatically</span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 rounded bg-[#0d99ff] hover:bg-sky-400 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
