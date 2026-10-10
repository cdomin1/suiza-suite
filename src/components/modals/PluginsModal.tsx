import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { PluginExtension } from '../../types';
import { X, Blocks, ShieldCheck, Plus, Check, Search, Code, RefreshCw } from 'lucide-react';

export const PluginsModal: React.FC = () => {
  const { plugins, togglePlugin, setActiveModal, theme } = useStudio();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const categories = ['All', 'Retouch', 'Color', 'Typography', 'Export', 'Automation'];

  const filtered = plugins.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSimulateImport = () => {
    setImportNotice('Third-party Rust WebAssembly / GEGL extension verified and sandboxed into runtime memory.');
    setTimeout(() => setImportNotice(null), 3500);
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
            <Blocks className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Plugin & Extension Architecture</h2>
              <p className="text-xs text-neutral-400">Backward-compatible bridge for GEGL, GIMP Python, and Rust WebAssembly modules</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Import Bar */}
        <div className="p-4 border-b border-white/10 bg-black/20 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search extensions (GEGL, Denoise, Resynthesizer, PDF/X-4)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded pl-9 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-[#0d99ff]"
              />
            </div>
            <button
              onClick={handleSimulateImport}
              className="px-3 py-1.5 rounded bg-[#0d99ff] hover:bg-sky-400 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Plugin</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {importNotice && (
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{importNotice}</span>
            </div>
          )}
        </div>

        {/* Plugins List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-3 space-y-2">
          {filtered.map(plugin => (
            <div
              key={plugin.id}
              className="p-3 rounded bg-black/30 border border-white/5 flex items-start justify-between gap-4 hover:border-white/15 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-200 text-xs">{plugin.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] text-neutral-300 font-mono">
                    v{plugin.version}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase ${
                      plugin.type === 'rust-wasm'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : plugin.type === 'gegl-op'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {plugin.type}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">{plugin.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-neutral-500 pt-1">
                  <span>Author: {plugin.author}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> Memory Safety Verified
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => togglePlugin(plugin.id)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  plugin.enabled ? 'bg-emerald-600' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    plugin.enabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/20 flex justify-between items-center text-xs">
          <span className="text-neutral-400">Sandbox memory: Isolated wasm32-wasi runtime</span>
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
