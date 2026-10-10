import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { ToolId } from '../../types';
import {
  MousePointer2,
  Crop,
  Pipette,
  Bandage,
  Paintbrush,
  Eraser,
  PaintBucket,
  SunMedium,
  PenTool,
  Type,
  Hand,
  ZoomIn,
  Move,
  Square,
  Circle,
  Shapes,
  LayoutGrid,
  Image as ImageIcon,
  Columns,
  RefreshCw,
  Minus,
  Scissors,
} from 'lucide-react';

export const Toolbox: React.FC = () => {
  const {
    persona,
    activeTool,
    setActiveTool,
    theme,
    foregroundColor,
    setForegroundColor,
    backgroundColor,
    setBackgroundColor,
    swapColors,
    resetDefaultColors,
    cmykColor,
    showShortcutFeedback,
  } = useStudio();

  // 1. Photo Tools (Photoshop CC / GIMP)
  const photoTools: { id: ToolId; name: string; key: string; icon: React.ReactNode }[] = [
    { id: 'move', name: 'Move / Selection', key: 'V', icon: <Move className="w-4 h-4" /> },
    { id: 'marquee', name: 'Rectangular Marquee', key: 'M', icon: <Square className="w-4 h-4 stroke-dashed" /> },
    { id: 'crop', name: 'Crop Canvas', key: 'C', icon: <Crop className="w-4 h-4" /> },
    { id: 'eyedropper', name: 'Eyedropper Sampler', key: 'I', icon: <Pipette className="w-4 h-4" /> },
    { id: 'healing', name: 'Spot Healing Brush', key: 'J', icon: <Bandage className="w-4 h-4" /> },
    { id: 'brush', name: 'Paint Brush Tool', key: 'B', icon: <Paintbrush className="w-4 h-4" /> },
    { id: 'eraser', name: 'Eraser Tool', key: 'E', icon: <Eraser className="w-4 h-4" /> },
    { id: 'bucket', name: 'Paint Bucket Tool', key: 'G', icon: <PaintBucket className="w-4 h-4" /> },
    { id: 'dodge', name: 'Dodge / Burn Exposure', key: 'O', icon: <SunMedium className="w-4 h-4" /> },
    { id: 'pen', name: 'Pen Tool (Bézier Paths)', key: 'P', icon: <PenTool className="w-4 h-4" /> },
    { id: 'text', name: 'Horizontal Type Tool', key: 'T', icon: <Type className="w-4 h-4" /> },
    { id: 'hand', name: 'Hand Pan Tool', key: 'H', icon: <Hand className="w-4 h-4" /> },
    { id: 'zoom', name: 'Zoom Tool', key: 'Z', icon: <ZoomIn className="w-4 h-4" /> },
  ];

  // 2. Vector Tools (Illustrator CC / Inkscape)
  const vectorTools: { id: ToolId; name: string; key: string; icon: React.ReactNode }[] = [
    { id: 'move', name: 'Selection Tool', key: 'V', icon: <MousePointer2 className="w-4 h-4" /> },
    { id: 'direct-select', name: 'Direct Selection (Nodes)', key: 'A', icon: <Move className="w-4 h-4" /> },
    { id: 'pen', name: 'Bézier Pen Spline', key: 'P', icon: <PenTool className="w-4 h-4" /> },
    { id: 'shape-rect', name: 'Rectangle Tool', key: 'M', icon: <Square className="w-4 h-4" /> },
    { id: 'shape-ellipse', name: 'Ellipse Tool', key: 'L', icon: <Circle className="w-4 h-4" /> },
    { id: 'shape-polygon', name: 'Polygon / Star Tool', key: 'Y', icon: <Shapes className="w-4 h-4" /> },
    { id: 'shape-builder', name: 'Shape Builder (Pathfinder)', key: 'Shift+M', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'knife', name: 'Knife / Cut Paths', key: 'C', icon: <Scissors className="w-4 h-4" /> },
    { id: 'text', name: 'Vector Type Tool', key: 'T', icon: <Type className="w-4 h-4" /> },
    { id: 'eyedropper', name: 'Eyedropper Sampler', key: 'I', icon: <Pipette className="w-4 h-4" /> },
    { id: 'hand', name: 'Hand Pan Tool', key: 'H', icon: <Hand className="w-4 h-4" /> },
    { id: 'zoom', name: 'Zoom Tool', key: 'Z', icon: <ZoomIn className="w-4 h-4" /> },
  ];

  // 3. Publish Tools (InDesign CC / Scribus)
  const publishTools: { id: ToolId; name: string; key: string; icon: React.ReactNode }[] = [
    { id: 'move', name: 'Selection Tool', key: 'V', icon: <MousePointer2 className="w-4 h-4" /> },
    { id: 'direct-select', name: 'Direct Selection', key: 'A', icon: <Move className="w-4 h-4" /> },
    { id: 'frame-text', name: 'Type Text Frame Tool', key: 'T', icon: <Type className="w-4 h-4 text-pink-500" /> },
    { id: 'frame-picture', name: 'Graphic Picture Frame', key: 'F', icon: <ImageIcon className="w-4 h-4 text-sky-500" /> },
    { id: 'frame-shape', name: 'Rectangle Frame', key: 'M', icon: <Square className="w-4 h-4" /> },
    { id: 'line-tool', name: 'Editorial Rule / Line Tool', key: '\\', icon: <Minus className="w-4 h-4" /> },
    { id: 'page-tool', name: 'Page Layout Tool', key: 'Shift+P', icon: <Columns className="w-4 h-4" /> },
    { id: 'eyedropper', name: 'Eyedropper Sampler', key: 'I', icon: <Pipette className="w-4 h-4" /> },
    { id: 'hand', name: 'Hand Pan Tool', key: 'H', icon: <Hand className="w-4 h-4" /> },
    { id: 'zoom', name: 'Zoom Tool', key: 'Z', icon: <ZoomIn className="w-4 h-4" /> },
  ];

  const tools = persona === 'photo' ? photoTools : persona === 'vector' ? vectorTools : publishTools;

  return (
    <aside
      className="w-12 flex flex-col items-center justify-between py-2 border-r select-none z-20 shrink-0 transition-colors"
      style={{
        backgroundColor: theme.bgPanel,
        borderColor: theme.border,
      }}
    >
      {/* Top: Persona-Specific Tools */}
      <div className="flex flex-col items-center gap-1 w-full px-1">
        {tools.map(tool => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id);
                showShortcutFeedback(`${tool.name} (${tool.key})`);
              }}
              title={`${tool.name} (${tool.key})`}
              className={`w-9 h-9 rounded flex items-center justify-center transition-all group relative ${
                isActive
                  ? 'bg-[#0d99ff] text-white shadow-md'
                  : theme.isLight
                  ? 'text-slate-800 hover:text-slate-950 hover:bg-slate-200'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tool.icon}
              {/* Corner notch in Adobe CC style */}
              <span className="absolute bottom-1 right-1 w-1 h-1 border-b border-r border-current opacity-40" />
            </button>
          );
        })}
      </div>

      {/* Bottom: Color Chips (Adobe CC / GIMP standard) */}
      <div
        className="flex flex-col items-center gap-2 pt-2 border-t w-full"
        style={{ borderColor: theme.border }}
      >
        {/* Quick buttons: Reset (D) and Swap (X) */}
        <div className="flex items-center justify-between w-8 px-0.5">
          <button
            onClick={() => {
              resetDefaultColors();
              showShortcutFeedback('Reset Black & White (D)');
            }}
            title="Default Colors: Black & White (D)"
            className="w-3.5 h-3.5 border bg-black flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
            style={{ borderColor: theme.borderStrong }}
          >
            <span className="w-1.5 h-1.5 bg-white" />
          </button>
          <button
            onClick={() => {
              swapColors();
              showShortcutFeedback('Swapped Colors (X)');
            }}
            title="Switch Foreground and Background Colors (X)"
            className="hover:scale-110 transition-transform"
            style={{ color: theme.textSecondary }}
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Foreground / Background Overlapping Color Chips */}
        <div className="relative w-8 h-8">
          {/* Background color chip */}
          <div
            className="absolute bottom-0 right-0 w-5 h-5 rounded-xs border shadow-sm cursor-pointer overflow-hidden"
            style={{ backgroundColor, borderColor: theme.borderStrong }}
            title={`Background Color: ${backgroundColor}`}
          >
            <input
              type="color"
              value={backgroundColor}
              onChange={e => setBackgroundColor(e.target.value)}
              className="opacity-0 w-full h-full cursor-pointer"
            />
          </div>
          {/* Foreground color chip */}
          <div
            className="absolute top-0 left-0 w-5 h-5 rounded-xs border-2 shadow-md cursor-pointer z-10 overflow-hidden"
            style={{ backgroundColor: foregroundColor, borderColor: theme.isLight ? '#0f172a' : '#ffffff' }}
            title={`Foreground Color: ${foregroundColor} (C:${cmykColor.c} M:${cmykColor.m} Y:${cmykColor.y} K:${cmykColor.k})`}
          >
            <input
              type="color"
              value={foregroundColor}
              onChange={e => setForegroundColor(e.target.value)}
              className="opacity-0 w-full h-full cursor-pointer"
            />
          </div>
        </div>

        {/* CMYK Gamut Indicator */}
        <div
          title={`Active CMYK Ink: C:${cmykColor.c}% M:${cmykColor.m}% Y:${cmykColor.y}% K:${cmykColor.k}%`}
          className="text-[9px] font-mono text-center leading-none tracking-tighter font-bold"
          style={{ color: theme.textSecondary }}
        >
          {cmykColor.k}% K
        </div>
      </div>
    </aside>
  );
};
