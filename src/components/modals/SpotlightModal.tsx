import React, { useState, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Search,
  Camera,
  PenTool,
  BookOpen,
  Sparkles,
  Download,
  Settings,
  Cpu,
  Layers,
  ArrowRight,
  X,
} from 'lucide-react';

export const SpotlightModal: React.FC = () => {
  const {
    isSpotlightOpen,
    setIsSpotlightOpen,
    setPersona,
    setActiveModal,
    setActiveTool,
    addLayer,
    addAdjustmentLayer,
    fitToScreen,
    theme,
    showShortcutFeedback,
  } = useStudio();

  const [query, setQuery] = useState('');

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSpotlightOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSpotlightOpen]);

  if (!isSpotlightOpen) return null;

  const quickActions = [
    {
      title: 'Switch to Suiza-Photo (Raster & Retouching)',
      category: 'Studio Persona',
      icon: <Camera className="w-4 h-4 text-sky-500" />,
      action: () => { setPersona('photo'); setIsSpotlightOpen(false); },
    },
    {
      title: 'Switch to Suiza-Vector (Bézier Illustration)',
      category: 'Studio Persona',
      icon: <PenTool className="w-4 h-4 text-amber-500" />,
      action: () => { setPersona('vector'); setIsSpotlightOpen(false); },
    },
    {
      title: 'Switch to Suiza-Publish (Desktop Publishing Spreads)',
      category: 'Studio Persona',
      icon: <BookOpen className="w-4 h-4 text-pink-500" />,
      action: () => { setPersona('publish'); setIsSpotlightOpen(false); },
    },
    {
      title: 'Export Studio (High-Resolution Hardware Accelerated)',
      category: 'Export',
      icon: <Download className="w-4 h-4 text-emerald-500" />,
      action: () => { setActiveModal('export'); setIsSpotlightOpen(false); },
    },
    {
      title: 'New Adjustment Layer: Tone Curves',
      category: 'Photo / Color',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      action: () => { addAdjustmentLayer('curves'); setIsSpotlightOpen(false); showShortcutFeedback('Curves Added'); },
    },
    {
      title: 'Rust Architecture & Vulkan/Metal Telemetry',
      category: 'System',
      icon: <Cpu className="w-4 h-4 text-emerald-500" />,
      action: () => { setActiveModal('rust-arch'); setIsSpotlightOpen(false); },
    },
    {
      title: 'Fit Artboard on Screen (⌘0)',
      category: 'Viewport',
      icon: <Layers className="w-4 h-4 text-sky-500" />,
      action: () => { fitToScreen(); setIsSpotlightOpen(false); },
    },
  ];

  const filtered = quickActions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 z-50 animate-in fade-in duration-150"
      onClick={() => setIsSpotlightOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-xl shadow-2xl border overflow-hidden"
        style={{
          backgroundColor: theme.isLight ? '#ffffff' : '#1e1e24',
          borderColor: theme.borderStrong,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Spotlight Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: theme.border }}>
          <Search className="w-5 h-5 text-[#0d99ff] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Spotlight Search Suiza-Suite..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-sm font-medium"
            style={{ color: theme.textPrimary }}
          />
          <button
            onClick={() => setIsSpotlightOpen(false)}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
            style={{ color: theme.textSecondary }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1 divide-y" style={{ borderColor: theme.border }}>
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs opacity-60">No actions matching "{query}"</div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className="w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors hover:bg-[#0d99ff] hover:text-white group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-black/5 dark:bg-white/10">
                    {item.icon}
                  </div>
                  <div>
                    <span className="font-semibold text-xs block group-hover:text-white" style={{ color: theme.textPrimary }}>
                      {item.title}
                    </span>
                    <span className="text-[10px] opacity-70 group-hover:text-white/80" style={{ color: theme.textSecondary }}>
                      {item.category}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
