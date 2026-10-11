import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { DOCUMENT_PRESETS } from '../../constants/presets';
import { StudioPersona, ColorMode } from '../../types';
import { X, Plus, Image, PenTool, BookOpen } from 'lucide-react';
import { generateSamplePhotoCanvas, generateSampleVectorPaths } from '../../utils/canvasRenderer';

export const NewDocumentModal: React.FC = () => {
  const { setProject, setPersona, setActiveModal, theme, pushHistoryStep } = useStudio();

  const [activeTab, setActiveTab] = useState<'Photo & Retouching' | 'Vector Illustration' | 'Editorial & Publishing'>('Photo & Retouching');
  const [docName, setDocName] = useState('Untitled_Document_1');
  const [width, setWidth] = useState(2560);
  const [height, setHeight] = useState(1440);
  const [dpi, setDpi] = useState(300);
  const [colorMode, setColorMode] = useState<ColorMode>('RGB');
  const [persona, setTargetPersona] = useState<StudioPersona>('photo');
  const [canvasBackground, setCanvasBackground] = useState<'white' | 'transparent' | 'black'>('white');

  const currentCategory = DOCUMENT_PRESETS.find(p => p.category === activeTab);

  const handleSelectPreset = (item: any) => {
    setWidth(item.width);
    setHeight(item.height);
    setDpi(item.dpi);
    setColorMode(item.colorMode);
    setTargetPersona(item.persona);
  };

  const handleCreateDocument = () => {
    let sampleDataUrl: string | undefined;
    let vectorPaths: any;

    if (persona === 'photo') {
      sampleDataUrl = generateSamplePhotoCanvas(width, height, canvasBackground);
    } else if (persona === 'vector') {
      vectorPaths = generateSampleVectorPaths(width, height);
    }

    const docExt = '.szt';
    const cleanDocName = docName.replace(/\.(szt|suiza|psd|ai|indd)$/i, '');
    const finalDocName = `${cleanDocName}${docExt}`;

    const newProject = {
      id: `project-${Date.now()}`,
      name: finalDocName,
      width,
      height,
      dpi,
      colorMode,
      cmykProfile: 'FOGRA39 (ISO 12647-2)',
      persona,
      layers: [
        {
          id: 'layer-base',
          name: persona === 'publish'
            ? 'Master Page Background'
            : persona === 'vector'
            ? 'Vector Artboard'
            : canvasBackground === 'transparent'
            ? 'Layer 1'
            : 'Background',
          type: persona === 'vector' ? ('vector' as const) : ('raster' as const),
          visible: true,
          locked: persona === 'photo' && canvasBackground !== 'transparent',
          opacity: 100,
          blendMode: 'normal' as const,
          canvasDataUrl: sampleDataUrl,
          vectorPaths: vectorPaths,
          width,
          height,
        }
      ],
      selectedLayerId: 'layer-base',
      pageCount: persona === 'publish' ? 4 : 1,
      activePageIndex: 0,
      facingPages: persona === 'publish',
      bleed: 3,
      margins: { top: 36, bottom: 36, inside: 48, outside: 36 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setPersona(persona);
    setTimeout(() => {
      setProject(newProject);
    }, 0);
    pushHistoryStep(`Create Document: ${finalDocName}`);
    setActiveModal(null);
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
            <Plus className="w-5 h-5 text-[#0d99ff]" />
            <div>
              <h2 className="text-sm font-semibold text-white">New Document Preset Setup</h2>
              <p className="text-xs text-neutral-400">Choose from photo, vector illustration, or multi-page publication templates</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-white/10 bg-black/20 px-4 pt-2 gap-2">
          {DOCUMENT_PRESETS.map(preset => (
            <button
              key={preset.category}
              onClick={() => {
                setActiveTab(preset.category as any);
                if (preset.category.includes('Photo')) setTargetPersona('photo');
                else if (preset.category.includes('Vector')) setTargetPersona('vector');
                else setTargetPersona('publish');
              }}
              className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === preset.category
                  ? 'border-[#0d99ff] text-white font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {preset.category}
            </button>
          ))}
        </div>

        {/* Content: Preset Grid on left, Custom Dimension inputs on right */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 overflow-y-auto">
          {/* Preset list (2 cols) */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Standard Templates
            </label>
            <div className="grid grid-cols-2 gap-2">
              {currentCategory?.items.map((item: any) => (
                <button
                  key={item.name}
                  onClick={() => handleSelectPreset(item)}
                  className={`p-3 rounded border text-left transition-all ${
                    width === item.width && height === item.height
                      ? 'bg-[#0d99ff]/20 border-[#0d99ff] text-white shadow'
                      : 'bg-black/30 border-white/10 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{item.name}</div>
                  <div className="font-mono text-[11px] text-neutral-400 mt-1">
                    {item.width} × {item.height} px
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    {item.dpi} DPI · {item.colorMode}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Settings (1 col) */}
          <div className="space-y-3 bg-black/20 p-3.5 rounded border border-white/10 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400">Document Name</label>
              <input
                type="text"
                value={docName}
                onChange={e => setDocName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-neutral-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Width (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={e => setWidth(parseInt(e.target.value) || 100)}
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 font-mono text-xs text-neutral-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(parseInt(e.target.value) || 100)}
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 font-mono text-xs text-neutral-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400">Color Mode</label>
              <select
                value={colorMode}
                onChange={e => setColorMode(e.target.value as ColorMode)}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-neutral-200"
              >
                <option value="RGB">RGB (8-bit sRGB)</option>
                <option value="CMYK">CMYK (Print FOGRA39)</option>
                <option value="GRAYSCALE">Grayscale (8-bit)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400">Resolution (DPI)</label>
              <input
                type="number"
                value={dpi}
                onChange={e => setDpi(parseInt(e.target.value) || 72)}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 font-mono text-xs text-neutral-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400">Canvas Background</label>
              <select
                value={canvasBackground}
                onChange={e => setCanvasBackground(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-neutral-200"
              >
                <option value="white">White (Standard)</option>
                <option value="transparent">Transparent (Checkerboard Pattern)</option>
                <option value="black">Black</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/20 flex justify-between items-center text-xs">
          <span className="text-neutral-400 font-mono">
            {width} × {height} px @ {dpi} DPI
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 rounded hover:bg-white/10 text-neutral-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateDocument}
              className="px-4 py-1.5 rounded bg-[#0d99ff] hover:bg-sky-400 text-white font-medium transition-colors shadow-sm"
            >
              Create Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
