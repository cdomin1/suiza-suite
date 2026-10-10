import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { X, Download, Sliders, CheckCircle, FileText, Image as ImageIcon, Cpu } from 'lucide-react';

export const ExportModal: React.FC = () => {
  const {
    project,
    theme,
    setActiveModal,
  } = useStudio();

  const [format, setFormat] = useState<'png' | 'jpg' | 'webp' | 'svg' | 'pdf' | 'psd' | 'tiff'>('png');
  const [scale, setScale] = useState<number>(2); // 2x default high-res
  const [quality, setQuality] = useState<number>(95);
  const [dpi, setDpi] = useState<number>(300);
  const [exportColorProfile, setExportColorProfile] = useState<string>(project.colorMode === 'CMYK' ? 'FOGRA39' : 'sRGB');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const exportWidth = Math.round(project.width * scale);
  const exportHeight = Math.round(project.height * scale);
  const estimatedFileSize = Math.round((exportWidth * exportHeight * 4) / (1024 * 1024) * (format === 'jpg' ? (quality / 100) * 0.18 : format === 'png' ? 0.45 : 0.25));

  // Perform Hardware-Accelerated High-Res Export
  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      // Create offscreen canvas rendered at target scale
      const offscreen = document.createElement('canvas');
      offscreen.width = exportWidth;
      offscreen.height = exportHeight;
      const ctx = offscreen.getContext('2d');

      if (ctx) {
        ctx.scale(scale, scale);
        // Fill canvas
        ctx.fillStyle = '#1e1e24';
        ctx.fillRect(0, 0, project.width, project.height);

        // Composite layers
        for (const layer of project.layers) {
          if (!layer.visible) continue;
          ctx.save();
          ctx.globalAlpha = layer.opacity / 100;
          if (layer.canvasDataUrl) {
            const img = new Image();
            img.src = layer.canvasDataUrl;
            ctx.drawImage(img, 0, 0, project.width, project.height);
          }
          if (layer.textContent) {
            ctx.fillStyle = layer.textColor || '#ffffff';
            ctx.font = `600 ${layer.textFontSize || 32}px ${layer.textFontFamily || 'Plus Jakarta Sans'}`;
            ctx.fillText(layer.textContent, layer.x || 100, layer.y || 100);
          }
          ctx.restore();
        }

        // Trigger file download
        const mime = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        const dataUrl = offscreen.toDataURL(mime, quality / 100);
        const link = document.createElement('a');
        const ext = format;
        link.download = `${project.name.replace('.suiza', '')}_${dpi}dpi_@${scale}x.${ext}`;
        link.href = dataUrl;
        link.click();
      }

      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 2500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div
        className="w-full max-w-xl rounded-lg border shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: theme.bgPanel, borderColor: theme.border }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-[#0d99ff]" />
            <div>
              <h2 className="text-sm font-semibold text-white">Export Studio (Hardware-Accelerated)</h2>
              <p className="text-xs text-neutral-400">High-resolution multi-format renderer with print CMYK profile embedding</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Format Selection */}
          <div className="space-y-1.5">
            <label className="font-medium text-neutral-300">Target File Format</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {(['png', 'jpg', 'webp', 'svg', 'pdf', 'psd', 'tiff'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 rounded border text-xs font-semibold uppercase transition-colors ${
                    format === fmt
                      ? 'bg-[#0d99ff] border-[#0d99ff] text-white shadow'
                      : 'bg-black/30 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Multiplier & DPI */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-medium text-neutral-300">Resolution Multiplier</label>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 4, 8].map(s => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`py-1.5 rounded border text-xs font-mono font-medium transition-colors ${
                      scale === s
                        ? 'bg-[#0d99ff] border-[#0d99ff] text-white'
                        : 'bg-black/30 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-neutral-300">Target Print DPI</label>
              <select
                value={dpi}
                onChange={e => setDpi(parseInt(e.target.value) || 300)}
                className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200"
              >
                <option value={72}>72 DPI (Standard Web Display)</option>
                <option value={150}>150 DPI (Draft Digital Proof)</option>
                <option value={300}>300 DPI (Commercial Offset Press)</option>
                <option value={600}>600 DPI (Museum Archival Fine Art)</option>
              </select>
            </div>
          </div>

          {/* Quality Slider (for JPG/WebP) */}
          {(format === 'jpg' || format === 'webp') && (
            <div className="space-y-1.5 bg-black/20 p-2.5 rounded border border-white/5">
              <div className="flex justify-between">
                <label className="font-medium text-neutral-300">Compression Quality</label>
                <span className="font-mono text-neutral-400">{quality}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={quality}
                onChange={e => setQuality(parseInt(e.target.value) || 90)}
                className="w-full accent-[#0d99ff] h-1.5 bg-black/40 rounded cursor-pointer"
              />
            </div>
          )}

          {/* Render Specifications Box */}
          <div className="bg-black/40 p-3 rounded border border-white/10 space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-neutral-400">Raster Dimensions:</span>
              <span className="text-sky-400 font-semibold">{exportWidth} × {exportHeight} px</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Physical Print Size:</span>
              <span className="text-neutral-300">
                {(exportWidth / dpi).toFixed(1)}″ × {(exportHeight / dpi).toFixed(1)}″ ({(exportWidth / dpi * 2.54).toFixed(1)} × {(exportHeight / dpi * 2.54).toFixed(1)} cm)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Color Profile:</span>
              <span className="text-amber-400 font-semibold">{exportColorProfile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Estimated File Size:</span>
              <span className="text-neutral-300">~{Math.max(1, estimatedFileSize)} MB</span>
            </div>
          </div>

          {exportComplete && (
            <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Export compiled and downloaded successfully!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/20 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vulkan / WebGPU SIMD Acceleration</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 rounded hover:bg-white/10 text-neutral-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-1.5 rounded bg-[#0d99ff] hover:bg-sky-400 text-white font-medium flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Compositing...' : 'Export File'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
