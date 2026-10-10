import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  FileText,
  Printer,
  Package,
} from 'lucide-react';

export const PublishPreflightPanel: React.FC = () => {
  const {
    theme,
    showShortcutFeedback,
  } = useStudio();

  const [activeProfile, setActiveProfile] = useState<'basic' | 'pdfx4'>('pdfx4');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    links: true,
    color: true,
    text: false,
    bleed: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const boxBg = theme.isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.25)';

  return (
    <div className="flex flex-col h-full text-xs select-none overflow-y-auto scrollbar-thin p-3 space-y-3.5">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
        <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>
          Preflight
        </span>
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>No errors</span>
        </div>
      </div>

      {/* Preflight Profile Selector */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: theme.textSecondary }}>
          Preflight Profile
        </label>
        <select
          value={activeProfile}
          onChange={e => setActiveProfile(e.target.value as any)}
          className="w-full px-2 py-1.5 rounded border text-xs font-semibold"
          style={{
            backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.4)',
            borderColor: theme.borderStrong,
            color: theme.textPrimary,
          }}
        >
          <option value="pdfx4">PDF/X-4:2010 (Commercial Print Standard)</option>
          <option value="basic">[Basic] (Working InDesign Profile)</option>
        </select>
      </div>

      {/* Audit Checklist Tree (InDesign CC Standard) */}
      <div className="space-y-1 pt-1 border-t" style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
          Audit Checklist
        </div>

        <div className="rounded border divide-y overflow-hidden" style={{ borderColor: theme.border, backgroundColor: boxBg }}>
          {/* Links & Resolution */}
          <div>
            <div
              onClick={() => toggleSection('links')}
              className="px-2.5 py-1.5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {openSections.links ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Links & High-Res Images</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">0 Issues</span>
            </div>
            {openSections.links && (
              <div className="px-6 py-1.5 text-[11px] space-y-1 bg-black/5 dark:bg-white/5 font-mono text-slate-600 dark:text-slate-300">
                <div>• Rhine_Gorge_LargeFormat.tif · 300 PPI (CMYK)</div>
                <div>• Vector_Masthead_Logotype.ai · 1:1 Vector Scale</div>
              </div>
            )}
          </div>

          {/* Color & Ink Coverage */}
          <div>
            <div
              onClick={() => toggleSection('color')}
              className="px-2.5 py-1.5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {openSections.color ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Color Space & Max Density</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">TAC 295%</span>
            </div>
            {openSections.color && (
              <div className="px-6 py-1.5 text-[11px] space-y-1 bg-black/5 dark:bg-white/5 font-mono text-slate-600 dark:text-slate-300">
                <div>• Color Model: ISO Coated v2 (FOGRA39)</div>
                <div>• Total Area Coverage (TAC): Safe ≤ 300%</div>
                <div>• RGB Objects: 0 found in document</div>
              </div>
            )}
          </div>

          {/* Text & Overset */}
          <div>
            <div
              onClick={() => toggleSection('text')}
              className="px-2.5 py-1.5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {openSections.text ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Text Flow & Fonts</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">0 Overset</span>
            </div>
            {openSections.text && (
              <div className="px-6 py-1.5 text-[11px] space-y-1 bg-black/5 dark:bg-white/5 font-mono text-slate-600 dark:text-slate-300">
                <div>• Overset Text: None in any frames</div>
                <div>• Missing Fonts: 0 missing (All embedded)</div>
              </div>
            )}
          </div>

          {/* Bleeds & Margins */}
          <div>
            <div
              onClick={() => toggleSection('bleed')}
              className="px-2.5 py-1.5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {openSections.bleed ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bleed Geometry & Trim</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">3.0 mm</span>
            </div>
            {openSections.bleed && (
              <div className="px-6 py-1.5 text-[11px] space-y-1 bg-black/5 dark:bg-white/5 font-mono text-slate-600 dark:text-slate-300">
                <div>• Bleed: Top 3mm, Bottom 3mm, Out 3mm</div>
                <div>• Slug: 0mm</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preflight Actions Bar */}
      <div className="pt-2 border-t flex items-center gap-2" style={{ borderColor: theme.border }}>
        <button
          onClick={() => showShortcutFeedback('Re-audited Preflight: 0 Errors')}
          className="flex-1 py-1.5 px-2.5 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          style={{ borderColor: theme.borderStrong, color: theme.textPrimary }}
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-500" />
          <span>Re-verify</span>
        </button>

        <button
          onClick={() => showShortcutFeedback('Packaging Publication for Press...')}
          className="py-1.5 px-3 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 bg-[#0d99ff] hover:bg-sky-500 text-white transition-colors"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Package...</span>
        </button>
      </div>
    </div>
  );
};
