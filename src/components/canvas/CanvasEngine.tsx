import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Rulers } from './Rulers';
import { mapBlendMode, drawPhotoshopCheckerboard } from '../../utils/canvasRenderer';
import { VectorPoint, VectorShape, PublishFrame, Guide } from '../../types';
import { Check, X, Crop, Plus, Sparkles, Upload, Image as ImageIcon, Magnet, Trash2 } from 'lucide-react';

export const CanvasEngine: React.FC = () => {
  const {
    persona,
    project,
    setProject,
    activeTool,
    setActiveTool,
    toolOptions,
    foregroundColor,
    setForegroundColor,
    zoom,
    setZoom,
    panX,
    panY,
    setPan,
    showRulers,
    showGrid,
    showGuides,
    setShowGuides,
    guides,
    setGuides,
    addGuide,
    updateGuide,
    removeGuide,
    clearGuides,
    snapToGuides,
    setSnapToGuides,
    lockGuides,
    setLockGuides,
    pushHistoryStep,
    theme,
    vectorShapes,
    setVectorShapes,
    selectedShapeIds,
    setSelectedShapeIds,
    vectorFill,
    vectorStroke,
    vectorStrokeWidth,
    vectorCornerRadius,
    publishFrames,
    setPublishFrames,
    selectedFrameIds,
    setSelectedFrameIds,
    publishSpreadIndex,
    setPublishSpreadIndex,
    publishMasterPage,
    publishColumnCount,
    publishColumnGutter,
    showShortcutFeedback,
    selectedLayerIds,
    setSelectedLayerIds,
  } = useStudio();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mouse & interaction states
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Selection Box (Marquee or Drag Creation)
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; width: number; height: number } | null>(null);
  const [marchingAntsOffset, setMarchingAntsOffset] = useState(0);

  // Interactive Crop State
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Pen Tool Draft Points
  const [draftPoints, setDraftPoints] = useState<VectorPoint[]>([]);

  // Hidden file input for placing images into picture frames
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document dimensions by persona
  const docWidth = persona === 'publish' ? 1400 : persona === 'vector' ? 1200 : project.width;
  const docHeight = persona === 'publish' ? 780 : persona === 'vector' ? 800 : project.height;

  // Global Guides & Magnetic Snapping Interactivity State
  const [activeSnapGuide, setActiveSnapGuide] = useState<{ x?: number; y?: number; label?: string } | null>(null);
  const [activeHoverGuideId, setActiveHoverGuideId] = useState<string | null>(null);
  const [draggingCanvasGuide, setDraggingCanvasGuide] = useState<{ id: string; type: 'horizontal' | 'vertical'; initialPos: number } | null>(null);

  // Memoized Magnetic Snapping targets from canvas elements
  const magneticTargets = useMemo(() => {
    const xs: number[] = [0, Math.round(docWidth / 2), docWidth];
    const ys: number[] = [0, Math.round(docHeight / 2), docHeight];

    // Collect boundaries from vector shapes
    for (const s of vectorShapes) {
      xs.push(s.x, Math.round(s.x + s.width / 2), s.x + s.width);
      ys.push(s.y, Math.round(s.y + s.height / 2), s.y + s.height);
    }

    // Collect boundaries from publish frames
    for (const f of publishFrames) {
      xs.push(f.x, Math.round(f.x + f.width / 2), f.x + f.width);
      ys.push(f.y, Math.round(f.y + f.height / 2), f.y + f.height);
    }

    // Collect boundaries from photo layers
    for (const l of project.layers) {
      if (l.x !== undefined && l.width !== undefined) {
        xs.push(l.x, Math.round(l.x + l.width / 2), l.x + l.width);
      }
      if (l.y !== undefined && l.height !== undefined) {
        ys.push(l.y, Math.round(l.y + l.height / 2), l.y + l.height);
      }
    }

    return { x: xs, y: ys };
  }, [docWidth, docHeight, vectorShapes, publishFrames, project.layers]);

  // Spacebar pan listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          setIsSpacePressed(true);
        }
      }

      // Clear pixels inside marquee on active layer in Photo persona
      if ((e.key === 'Delete' || e.key === 'Backspace') && persona === 'photo' && selectionBox) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(selectionBox.startX, selectionBox.startY, selectionBox.width, selectionBox.height);
            const newUrl = canvas.toDataURL('image/png');
            setProject(prev => ({
              ...prev,
              layers: prev.layers.map(l => l.id === prev.selectedLayerId ? { ...l, canvasDataUrl: newUrl } : l)
            }));
            setSelectionBox(null);
            pushHistoryStep('Clear Selection');
            showShortcutFeedback('Cleared Selected Pixels');
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [persona, selectionBox, pushHistoryStep, showShortcutFeedback, setProject]);

  // Marching ants animation loop for active selection marquee
  useEffect(() => {
    if (!selectionBox) return;
    const interval = setInterval(() => {
      setMarchingAntsOffset(prev => (prev + 1) % 16);
    }, 60);
    return () => clearInterval(interval);
  }, [selectionBox]);

  // Touch gesture pinch-to-zoom & two-finger pan tracking
  const touchStartRef = useRef<{
    dist: number;
    initialZoom: number;
    midX: number;
    midY: number;
    initialPanX: number;
    initialPanY: number;
  } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      touchStartRef.current = {
        dist: Math.max(10, dist),
        initialZoom: zoom,
        midX,
        midY,
        initialPanX: panX,
        initialPanY: panY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.max(10, Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY));
      const scaleMultiplier = dist / touchStartRef.current.dist;
      const newZoom = Math.max(0.05, Math.min(16, touchStartRef.current.initialZoom * scaleMultiplier));

      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      const deltaX = midX - touchStartRef.current.midX;
      const deltaY = midY - touchStartRef.current.midY;

      setPan(touchStartRef.current.initialPanX + deltaX, touchStartRef.current.initialPanY + deltaY);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  // Convert client viewport coordinates to canvas document coordinates
  const clientToDocCoords = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    const x = ((clientX - rect.left) / rect.width) * docWidth;
    const y = ((clientY - rect.top) / rect.height) * docHeight;
    return {
      x: Math.round(x),
      y: Math.round(y),
    };
  }, [docWidth, docHeight]);

  // =========================================================================
  // MAIN RENDER PIPELINE
  // =========================================================================
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = docWidth;
    canvas.height = docHeight;
    ctx.clearRect(0, 0, docWidth, docHeight);

    // =======================================================================
    // 1. SUIZA-PHOTO CANVAS RENDER
    // =======================================================================
    if (persona === 'photo') {
      // Photo artboard backdrop: Photoshop authentic checkerboard pattern for transparency
      drawPhotoshopCheckerboard(ctx, docWidth, docHeight, 16, !theme.isLight);

      // Iterate through layers bottom-to-top
      for (const layer of project.layers) {
        if (!layer.visible) continue;

        ctx.save();
        ctx.globalAlpha = layer.opacity / 100;
        ctx.globalCompositeOperation = mapBlendMode(layer.blendMode);

        if (layer.type === 'raster' && layer.canvasDataUrl) {
          const adj = layer.adjustmentValues || {};
          const filters: string[] = [];
          if (adj.brightness !== undefined && adj.brightness !== 0) filters.push(`brightness(${100 + adj.brightness}%)`);
          if (adj.contrast !== undefined && adj.contrast !== 0) filters.push(`contrast(${100 + adj.contrast}%)`);
          if (adj.saturation !== undefined && adj.saturation !== 0) filters.push(`saturate(${100 + adj.saturation}%)`);
          if (adj.hue !== undefined && adj.hue !== 0) filters.push(`hue-rotate(${adj.hue}deg)`);
          if (filters.length > 0) ctx.filter = filters.join(' ');

          const img = new Image();
          img.src = layer.canvasDataUrl;
          if (img.complete) {
            ctx.drawImage(img, 0, 0, docWidth, docHeight);
          } else {
            img.onload = () => renderCanvas();
          }
          ctx.filter = 'none';
        } else if (layer.type === 'adjustment') {
          // Curves / Tone shimmer simulation
          const adj = layer.adjustmentValues || {};
          const intensity = (adj.midtones || 10) / 100;
          ctx.fillStyle = `rgba(217, 119, 6, ${Math.max(0, intensity * 0.15)})`;
          ctx.fillRect(0, 0, docWidth, docHeight);
        } else if (layer.type === 'text') {
          const weight = layer.textFontWeight || 'normal';
          const size = layer.textFontSize || 36;
          const family = layer.textFontFamily ? `"${layer.textFontFamily}", sans-serif` : 'Plus Jakarta Sans, sans-serif';
          ctx.font = `${weight} ${size}px ${family}`;
          ctx.fillStyle = layer.textColor || (theme.isLight ? '#0f172a' : '#ffffff');
          ctx.textAlign = (layer.textAlign as CanvasTextAlign) || 'left';
          ctx.textBaseline = 'top';

          let textToRender = layer.textContent || 'Typography Layer';
          if (layer.textTransform === 'uppercase') textToRender = textToRender.toUpperCase();
          else if (layer.textTransform === 'lowercase') textToRender = textToRender.toLowerCase();

          const lines = textToRender.split('\n');
          const lineH = size * (layer.textLineHeight || 1.25);
          const px = layer.x ?? 100;
          const py = layer.y ?? 150;

          lines.forEach((line, i) => {
            ctx.fillText(line, px, py + i * lineH);
          });
        }

        ctx.restore();
      }

      // Selection Marquee (Marching Ants)
      if (selectionBox) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(selectionBox.startX, selectionBox.startY, selectionBox.width, selectionBox.height);
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = marchingAntsOffset;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(selectionBox.startX, selectionBox.startY, selectionBox.width, selectionBox.height);
        ctx.restore();
      }

      // Crop Box Overlay
      if (activeTool === 'crop' && cropBox) {
        ctx.save();
        // Dim outside
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, docWidth, cropBox.y);
        ctx.fillRect(0, cropBox.y, cropBox.x, cropBox.height);
        ctx.fillRect(cropBox.x + cropBox.width, cropBox.y, docWidth - (cropBox.x + cropBox.width), cropBox.height);
        ctx.fillRect(0, cropBox.y + cropBox.height, docWidth, docHeight - (cropBox.y + cropBox.height));

        // Rule of thirds lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
        ctx.beginPath();
        ctx.moveTo(cropBox.x + cropBox.width / 3, cropBox.y);
        ctx.lineTo(cropBox.x + cropBox.width / 3, cropBox.y + cropBox.height);
        ctx.moveTo(cropBox.x + (cropBox.width * 2) / 3, cropBox.y);
        ctx.lineTo(cropBox.x + (cropBox.width * 2) / 3, cropBox.y + cropBox.height);
        ctx.moveTo(cropBox.x, cropBox.y + cropBox.height / 3);
        ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + cropBox.height / 3);
        ctx.moveTo(cropBox.x, cropBox.y + (cropBox.height * 2) / 3);
        ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + (cropBox.height * 2) / 3);
        ctx.stroke();

        // 8 corner/side handles
        ctx.fillStyle = '#ffffff';
        const handles = [
          { x: cropBox.x, y: cropBox.y },
          { x: cropBox.x + cropBox.width, y: cropBox.y },
          { x: cropBox.x, y: cropBox.y + cropBox.height },
          { x: cropBox.x + cropBox.width, y: cropBox.y + cropBox.height },
          { x: cropBox.x + cropBox.width / 2, y: cropBox.y },
          { x: cropBox.x + cropBox.width / 2, y: cropBox.y + cropBox.height },
          { x: cropBox.x, y: cropBox.y + cropBox.height / 2 },
          { x: cropBox.x + cropBox.width, y: cropBox.y + cropBox.height / 2 },
        ];
        for (const h of handles) {
          ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
        }
        ctx.restore();
      }
    }

    // =======================================================================
    // 2. SUIZA-VECTOR ARTBOARD RENDER (Adobe Illustrator / Affinity Designer)
    // =======================================================================
    else if (persona === 'vector') {
      // Clean white vector artboard
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, docWidth, docHeight);

      // Optional subtle grid
      if (showGrid) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < docWidth; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, docHeight);
          ctx.stroke();
        }
        for (let y = 0; y < docHeight; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(docWidth, y);
          ctx.stroke();
        }
      }

      // Clean artboard ready for drawing

      // Render vector shapes created by user
      for (const shape of vectorShapes) {
        if (shape.visible === false) continue;
        ctx.save();
        ctx.fillStyle = shape.fill;
        ctx.strokeStyle = shape.stroke;
        ctx.lineWidth = shape.strokeWidth;

        if (shape.type === 'rect') {
          const r = shape.cornerRadius || 0;
          if (r > 0) {
            ctx.beginPath();
            ctx.roundRect(shape.x, shape.y, shape.width, shape.height, r);
            ctx.fill();
            if (shape.strokeWidth > 0) ctx.stroke();
          } else {
            ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            if (shape.strokeWidth > 0) ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          }
        } else if (shape.type === 'ellipse') {
          ctx.beginPath();
          ctx.ellipse(
            shape.x + shape.width / 2,
            shape.y + shape.height / 2,
            Math.max(1, shape.width / 2),
            Math.max(1, shape.height / 2),
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          if (shape.strokeWidth > 0) ctx.stroke();
        } else if (shape.type === 'polygon') {
          const cx = shape.x + shape.width / 2;
          const cy = shape.y + shape.height / 2;
          const r = shape.width / 2;
          const sides = 6;
          ctx.beginPath();
          for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          if (shape.strokeWidth > 0) ctx.stroke();
        } else if (shape.type === 'text') {
          const weight = shape.fontWeight || 'bold';
          const size = shape.fontSize || 36;
          const family = shape.fontFamily ? `"${shape.fontFamily}", sans-serif` : 'Plus Jakarta Sans, sans-serif';
          ctx.font = `${weight} ${size}px ${family}`;
          ctx.fillStyle = shape.fill || '#0f172a';
          ctx.textAlign = (shape.textAlign as CanvasTextAlign) || 'left';
          ctx.textBaseline = 'top';

          let textToRender = shape.text || 'Vector Typography';
          if (shape.textTransform === 'uppercase') textToRender = textToRender.toUpperCase();
          else if (shape.textTransform === 'lowercase') textToRender = textToRender.toLowerCase();

          const lines = textToRender.split('\n');
          const lineH = size * (shape.lineHeight || 1.25);

          lines.forEach((line, i) => {
            let px = shape.x;
            if (shape.textAlign === 'center') px = shape.x + shape.width / 2;
            else if (shape.textAlign === 'right') px = shape.x + shape.width;
            ctx.fillText(line, px, shape.y + i * lineH);
            if (shape.strokeWidth && shape.strokeWidth > 0 && shape.stroke && shape.stroke !== 'none') {
              ctx.strokeStyle = shape.stroke;
              ctx.lineWidth = shape.strokeWidth;
              ctx.strokeText(line, px, shape.y + i * lineH);
            }
          });
        }

        // Bounding Box & 8 Anchor Points if Selected
        if (selectedShapeIds.includes(shape.id)) {
          ctx.strokeStyle = '#0d99ff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(shape.x - 3, shape.y - 3, shape.width + 6, shape.height + 6);

          const handles = [
            { x: shape.x - 3, y: shape.y - 3 },
            { x: shape.x + shape.width + 3, y: shape.y - 3 },
            { x: shape.x + shape.width + 3, y: shape.y + shape.height + 3 },
            { x: shape.x - 3, y: shape.y + shape.height + 3 },
            { x: shape.x + shape.width / 2, y: shape.y - 3 },
            { x: shape.x + shape.width / 2, y: shape.y + shape.height + 3 },
            { x: shape.x - 3, y: shape.y + shape.height / 2 },
            { x: shape.x + shape.width + 3, y: shape.y + shape.height / 2 },
          ];
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#0d99ff';
          for (const h of handles) {
            ctx.fillRect(h.x - 3, h.y - 3, 6, 6);
            ctx.strokeRect(h.x - 3, h.y - 3, 6, 6);
          }
        }

        ctx.restore();
      }

      // Outer Master Bounding Box if multiple shapes selected (Group Selection)
      if (selectedShapeIds.length > 1) {
        const selectedShapes = vectorShapes.filter(s => selectedShapeIds.includes(s.id));
        if (selectedShapes.length > 1) {
          const minX = Math.min(...selectedShapes.map(s => s.x));
          const minY = Math.min(...selectedShapes.map(s => s.y));
          const maxX = Math.max(...selectedShapes.map(s => s.x + s.width));
          const maxY = Math.max(...selectedShapes.map(s => s.y + s.height));
          const gW = maxX - minX;
          const gH = maxY - minY;

          ctx.save();
          ctx.strokeStyle = '#0d99ff';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(minX - 6, minY - 6, gW + 12, gH + 12);
          ctx.setLineDash([]);

          // 8 Group transform handles
          const gHandles = [
            { x: minX - 6, y: minY - 6 },
            { x: maxX + 6, y: minY - 6 },
            { x: maxX + 6, y: maxY + 6 },
            { x: minX - 6, y: maxY + 6 },
            { x: minX + gW / 2, y: minY - 6 },
            { x: minX + gW / 2, y: maxY + 6 },
            { x: minX - 6, y: minY + gH / 2 },
            { x: maxX + 6, y: minY + gH / 2 },
          ];
          ctx.fillStyle = '#0d99ff';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          for (const h of gHandles) {
            ctx.fillRect(h.x - 3.5, h.y - 3.5, 7, 7);
            ctx.strokeRect(h.x - 3.5, h.y - 3.5, 7, 7);
          }

          // Group badge header
          ctx.fillStyle = '#0d99ff';
          ctx.fillRect(minX - 6, Math.max(0, minY - 24), 165, 18);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText(`Group: ${selectedShapeIds.length} objects (Ctrl+G)`, minX - 2, Math.max(12, minY - 11));
          ctx.restore();
        }
      }

      // Pen draft path
      if (draftPoints.length > 0) {
        ctx.save();
        ctx.strokeStyle = '#0d99ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        draftPoints.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Rubberband line to current mouse position
        if (mousePos.x > 0 && mousePos.y > 0) {
          const last = draftPoints[draftPoints.length - 1];
          ctx.strokeStyle = 'rgba(13, 153, 255, 0.5)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw anchor nodes
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0d99ff';
        draftPoints.forEach(p => {
          ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
          ctx.strokeRect(p.x - 3, p.y - 3, 6, 6);
        });
        ctx.restore();
      }

      // Drag creation preview for shapes
      if (selectionBox && (activeTool === 'shape-rect' || activeTool === 'shape-ellipse' || activeTool === 'shape-polygon')) {
        ctx.save();
        ctx.strokeStyle = vectorStroke;
        ctx.fillStyle = vectorFill;
        ctx.lineWidth = vectorStrokeWidth;
        if (activeTool === 'shape-ellipse') {
          ctx.beginPath();
          ctx.ellipse(
            selectionBox.startX + selectionBox.width / 2,
            selectionBox.startY + selectionBox.height / 2,
            Math.max(1, selectionBox.width / 2),
            Math.max(1, selectionBox.height / 2),
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(selectionBox.startX, selectionBox.startY, selectionBox.width, selectionBox.height);
          ctx.strokeRect(selectionBox.startX, selectionBox.startY, selectionBox.width, selectionBox.height);
        }
        ctx.restore();
      }
    }

    // =======================================================================
    // 3. SUIZA-PUBLISH SPREAD RENDER (Adobe InDesign / Affinity Publisher)
    // =======================================================================
    else if (persona === 'publish') {
      const halfW = docWidth / 2;

      // Outer editorial pasteboard
      ctx.fillStyle = theme.isLight ? '#e2e8f0' : '#1e1e24';
      ctx.fillRect(0, 0, docWidth, docHeight);

      // Facing Pages: Page 2 (Left) & Page 3 (Right)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 20, docWidth - 40, docHeight - 40);

      // Spine Fold Line (Center gutter)
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(halfW, 20);
      ctx.lineTo(halfW, docHeight - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bleed & Margin Guides (Red & Magenta)
      if (showGuides) {
        // Red 3mm Bleed
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
        ctx.lineWidth = 1;
        ctx.strokeRect(8, 8, docWidth - 16, docHeight - 16);

        // Magenta Margin Boundary
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
        ctx.strokeRect(60, 60, halfW - 90, docHeight - 120);
        ctx.strokeRect(halfW + 30, 60, halfW - 90, docHeight - 120);

        // Column Guides (Cyan Lines based on publishColumnCount)
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.35)';
        const colW = (halfW - 90 - (publishColumnCount - 1) * publishColumnGutter) / publishColumnCount;
        for (let c = 1; c < publishColumnCount; c++) {
          const xL = 60 + c * (colW + publishColumnGutter);
          const xR = halfW + 30 + c * (colW + publishColumnGutter);
          ctx.beginPath();
          ctx.moveTo(xL, 60);
          ctx.lineTo(xL, docHeight - 60);
          ctx.moveTo(xR, 60);
          ctx.lineTo(xR, docHeight - 60);
          ctx.stroke();
        }
      }

      // Running Folio Headers & Footers
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('02 | SUIZA ARCHITECTURAL REVIEW · SPREAD II', 60, 48);
      ctx.fillText(`MASTER: ${publishMasterPage.toUpperCase()} · AUTUMN 2026 | 03`, docWidth - 340, 48);

      // Render Publication Frames
      for (const frame of publishFrames) {
        if (frame.visible === false) continue;
        ctx.save();

        if (frame.type === 'text') {
          if (frame.title) {
            ctx.font = 'bold 28px "Playfair Display", Georgia, serif';
            ctx.fillStyle = '#0f172a';
            ctx.fillText(frame.title, frame.x, frame.y + 32);

            ctx.font = 'italic 13px "Merriweather", Georgia, serif';
            ctx.fillStyle = '#475569';
            ctx.fillText(frame.content || '', frame.x, frame.y + 64);
          } else {
            // Body text block
            ctx.font = '11px "Merriweather", Georgia, serif';
            ctx.fillStyle = '#1e293b';
            const lines = (frame.content || '').split('\n');
            let currY = frame.y + 14;

            // Draw Drop Cap "W" on opening body block
            if (frame.id === 'pub-col-1') {
              ctx.font = 'bold 42px "Playfair Display", Georgia, serif';
              ctx.fillStyle = '#ec4899';
              ctx.fillText('W', frame.x, frame.y + 36);
              ctx.font = '11px "Merriweather", Georgia, serif';
              ctx.fillStyle = '#1e293b';
            }

            for (const line of lines) {
              const words = line.split(' ');
              let currentLine = '';
              for (const word of words) {
                const testLine = currentLine + word + ' ';
                if (ctx.measureText(testLine).width > frame.width) {
                  ctx.fillText(currentLine, frame.x, currY);
                  currentLine = word + ' ';
                  currY += 17;
                } else {
                  currentLine = testLine;
                }
              }
              ctx.fillText(currentLine, frame.x, currY);
              currY += 24;
            }
          }
        } else if (frame.type === 'picture') {
          // InDesign Picture Frame (Graphic box with diagonal cross X)
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(frame.x, frame.y, frame.width, frame.height);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1;
          ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);

          // Diagonal X guide lines
          ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
          ctx.beginPath();
          ctx.moveTo(frame.x, frame.y);
          ctx.lineTo(frame.x + frame.width, frame.y + frame.height);
          ctx.moveTo(frame.x + frame.width, frame.y);
          ctx.lineTo(frame.x, frame.y + frame.height);
          ctx.stroke();

          // Title badge in center
          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(frame.title || 'GRAPHIC PICTURE FRAME (300 DPI)', frame.x + frame.width / 2, frame.y + frame.height / 2);
          ctx.textAlign = 'left';
        } else if (frame.type === 'rule') {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = frame.strokeWidth || 1;
          ctx.beginPath();
          ctx.moveTo(frame.x, frame.y);
          ctx.lineTo(frame.x + frame.width, frame.y);
          ctx.stroke();
        }

        // Selection highlight if active frame
        if (selectedFrameIds.includes(frame.id)) {
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(frame.x - 2, frame.y - 2, frame.width + 4, frame.height + 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(frame.x - 4, frame.y - 4, 6, 6);
          ctx.strokeRect(frame.x - 4, frame.y - 4, 6, 6);
          ctx.fillRect(frame.x + frame.width - 2, frame.y - 4, 6, 6);
          ctx.strokeRect(frame.x + frame.width - 2, frame.y - 4, 6, 6);
          ctx.fillRect(frame.x - 4, frame.y + frame.height - 2, 6, 6);
          ctx.strokeRect(frame.x - 4, frame.y + frame.height - 2, 6, 6);
          ctx.fillRect(frame.x + frame.width - 2, frame.y + frame.height - 2, 6, 6);
          ctx.strokeRect(frame.x + frame.width - 2, frame.y + frame.height - 2, 6, 6);
        }

        ctx.restore();
      }

      // Outer Master Bounding Box if multiple frames selected (Group Selection)
      if (selectedFrameIds.length > 1) {
        const selectedF = publishFrames.filter(f => selectedFrameIds.includes(f.id));
        if (selectedF.length > 1) {
          const minX = Math.min(...selectedF.map(f => f.x));
          const minY = Math.min(...selectedF.map(f => f.y));
          const maxX = Math.max(...selectedF.map(f => f.x + f.width));
          const maxY = Math.max(...selectedF.map(f => f.y + f.height));
          const gW = maxX - minX;
          const gH = maxY - minY;

          ctx.save();
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(minX - 5, minY - 5, gW + 10, gH + 10);
          ctx.setLineDash([]);

          ctx.fillStyle = '#ec4899';
          ctx.fillRect(minX - 5, Math.max(0, minY - 24), 165, 18);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText(`Group: ${selectedFrameIds.length} frames (Ctrl+G)`, minX - 1, Math.max(12, minY - 11));
          ctx.restore();
        }
      }

      // Drag preview for publish frames
      if (selectionBox && (activeTool === 'frame-text' || activeTool === 'frame-picture' || activeTool === 'line-tool')) {
        ctx.save();
        ctx.strokeStyle = activeTool === 'frame-picture' ? '#0284c7' : '#ec4899';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(selectionBox.startX, selectionBox.startY, selectionBox.width, selectionBox.height);
        ctx.restore();
      }
    }
  }, [
    persona,
    docWidth,
    docHeight,
    project.layers,
    vectorShapes,
    selectedShapeIds,
    draftPoints,
    publishFrames,
    selectedFrameIds,
    selectionBox,
    marchingAntsOffset,
    showGrid,
    showGuides,
    activeTool,
    vectorFill,
    vectorStroke,
    vectorStrokeWidth,
    publishMasterPage,
    publishColumnCount,
    publishColumnGutter,
    theme.isLight,
    cropBox,
    mousePos,
  ]);

  // Trigger render on dependency changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // =========================================================================
  // MOUSE EVENT HANDLERS: INTERACTIVE TOOLS
  // =========================================================================
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || isSpacePressed || activeTool === 'hand') {
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      setIsMouseDown(true);
      return;
    }

    const { x, y } = clientToDocCoords(e.clientX, e.clientY);
    setIsMouseDown(true);
    setDragStart({ x, y });
    setLastPoint({ x, y });

    // =======================================================================
    // 1. PHOTO TOOLS
    // =======================================================================
    if (persona === 'photo') {
      if (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'healing' || activeTool === 'dodge' || activeTool === 'burn') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.save();
        ctx.strokeStyle = activeTool === 'eraser' ? (theme.isLight ? '#ffffff' : '#1e1e24') : activeTool === 'healing' ? 'rgba(255,255,255,0.7)' : foregroundColor;
        ctx.lineWidth = toolOptions.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
      } else if (activeTool === 'bucket') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (selectionBox) {
          // Fill inside marquee only
          ctx.fillStyle = foregroundColor;
          ctx.fillRect(selectionBox.startX, selectionBox.startY, selectionBox.width, selectionBox.height);
        } else {
          // Flood fill entire layer
          ctx.fillStyle = foregroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        const newUrl = canvas.toDataURL('image/png');
        setProject(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === prev.selectedLayerId ? { ...l, canvasDataUrl: newUrl } : l)
        }));
        pushHistoryStep('Paint Bucket Fill');
        showShortcutFeedback('Filled Layer with Paint Bucket');
      } else if (activeTool === 'eyedropper') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
        setForegroundColor(hex);
        showShortcutFeedback(`Sampled Color: ${hex}`);
      } else if (activeTool === 'marquee') {
        setSelectionBox({ startX: x, startY: y, width: 0, height: 0 });
      } else if (activeTool === 'crop') {
        setCropBox({ x, y, width: 0, height: 0 });
      } else if (activeTool === 'text') {
        // Place text layer at clicked position
        const newLayerId = `layer-text-${Date.now()}`;
        const defaultFont = toolOptions.fontFamily || 'Plus Jakarta Sans';
        const defaultSize = toolOptions.fontSize || 44;
        const defaultColor = toolOptions.textColor || foregroundColor;
        setProject(prev => ({
          ...prev,
          layers: [
            ...prev.layers,
            {
              id: newLayerId,
              name: `Type (${defaultFont})`,
              type: 'text',
              visible: true,
              locked: false,
              opacity: 100,
              blendMode: 'normal',
              textContent: 'Helvetica Swiss Typo',
              textFontSize: defaultSize,
              textFontFamily: defaultFont,
              textFontWeight: toolOptions.fontWeight || 'bold',
              textColor: defaultColor,
              x,
              y,
            }
          ],
          selectedLayerId: newLayerId,
        }));
        pushHistoryStep('Create Text Layer');
        showShortcutFeedback(`Placed Text Layer (${defaultFont})`);
      }
    }

    // =======================================================================
    // 2. VECTOR TOOLS
    // =======================================================================
    else if (persona === 'vector') {
      if (activeTool === 'shape-rect' || activeTool === 'shape-ellipse' || activeTool === 'shape-polygon') {
        setSelectionBox({ startX: x, startY: y, width: 0, height: 0 });
      } else if (activeTool === 'pen') {
        // If clicking near first point, close path into shape!
        if (draftPoints.length >= 2) {
          const first = draftPoints[0];
          const dist = Math.hypot(x - first.x, y - first.y);
          if (dist < 15) {
            const minX = Math.min(...draftPoints.map(p => p.x));
            const minY = Math.min(...draftPoints.map(p => p.y));
            const maxX = Math.max(...draftPoints.map(p => p.x));
            const maxY = Math.max(...draftPoints.map(p => p.y));
            const newShape: VectorShape = {
              id: `v-path-${Date.now()}`,
              type: 'polygon',
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY,
              fill: vectorFill,
              stroke: vectorStroke,
              strokeWidth: vectorStrokeWidth,
              points: draftPoints,
            };
            setVectorShapes(prev => [...prev, newShape]);
            setSelectedShapeIds([newShape.id]);
            setDraftPoints([]);
            pushHistoryStep('Closed Bézier Path');
            showShortcutFeedback('Completed Bézier Shape');
            return;
          }
        }
        setDraftPoints(prev => [...prev, { x, y }]);
        showShortcutFeedback(`Added Bézier Anchor (${draftPoints.length + 1})`);
      } else if (activeTool === 'text') {
        const defaultFont = toolOptions.fontFamily || 'Plus Jakarta Sans';
        const defaultSize = toolOptions.fontSize || 36;
        const defaultFill = toolOptions.textColor || vectorFill || '#0f172a';
        const newTextShape: VectorShape = {
          id: `v-text-${Date.now()}`,
          name: `Type (${defaultFont})`,
          type: 'text',
          x,
          y,
          width: 260,
          height: defaultSize * 1.5,
          fill: defaultFill,
          stroke: 'none',
          strokeWidth: 0,
          text: 'Vector Typography',
          fontSize: defaultSize,
          fontFamily: defaultFont,
          fontWeight: toolOptions.fontWeight || 'bold',
        };
        setVectorShapes(prev => [...prev, newTextShape]);
        setSelectedShapeIds([newTextShape.id]);
        pushHistoryStep('Create Vector Text');
        showShortcutFeedback(`Placed Vector Typography (${defaultFont})`);
      } else if (activeTool === 'move' || activeTool === 'direct-select') {
        const hit = [...vectorShapes].reverse().find(s =>
          x >= s.x - 5 && x <= s.x + s.width + 5 && y >= s.y - 5 && y <= s.y + s.height + 5
        );
        if (hit) {
          if (e.shiftKey) {
            // Shift-click toggles item in multi-selection
            setSelectedShapeIds(prev =>
              prev.includes(hit.id) ? prev.filter(id => id !== hit.id) : [...prev, hit.id]
            );
          } else {
            // If already part of selection, keep group selection so user can drag all together
            if (!selectedShapeIds.includes(hit.id)) {
              setSelectedShapeIds([hit.id]);
            }
          }
          showShortcutFeedback(`Selected: ${hit.type} (${hit.id})`);
        } else {
          // Clicked empty canvas: clear selection unless Shift is held, and start marquee box
          if (!e.shiftKey) {
            setSelectedShapeIds([]);
          }
          setSelectionBox({ startX: x, startY: y, width: 0, height: 0 });
        }
      } else if (activeTool === 'eyedropper') {
        const hit = [...vectorShapes].reverse().find(s =>
          x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height
        );
        if (hit) {
          setForegroundColor(hit.fill);
          showShortcutFeedback(`Sampled Fill: ${hit.fill}`);
        }
      }
    }

    // =======================================================================
    // 3. PUBLISH TOOLS
    // =======================================================================
    else if (persona === 'publish') {
      if (activeTool === 'frame-text' || activeTool === 'frame-picture' || activeTool === 'line-tool' || activeTool === 'frame-shape') {
        setSelectionBox({ startX: x, startY: y, width: 0, height: 0 });
      } else if (activeTool === 'move' || activeTool === 'page-tool') {
        const hit = [...publishFrames].reverse().find(f =>
          x >= f.x - 4 && x <= f.x + f.width + 4 && y >= f.y - 4 && y <= f.y + f.height + 4
        );
        if (hit) {
          if (e.shiftKey) {
            setSelectedFrameIds(prev =>
              prev.includes(hit.id) ? prev.filter(id => id !== hit.id) : [...prev, hit.id]
            );
          } else {
            if (!selectedFrameIds.includes(hit.id)) {
              setSelectedFrameIds([hit.id]);
            }
          }
          showShortcutFeedback(`Selected: ${hit.type} Frame (${hit.id})`);
        } else {
          if (!e.shiftKey) {
            setSelectedFrameIds([]);
          }
          setSelectionBox({ startX: x, startY: y, width: 0, height: 0 });
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = clientToDocCoords(e.clientX, e.clientY);
    setMousePos({ x, y });

    // Spacebar or middle click pan
    if (isMouseDown && (isSpacePressed || activeTool === 'hand')) {
      setPan(e.clientX - panStart.x, e.clientY - panStart.y);
      return;
    }

    if (!isMouseDown || !dragStart) return;

    // Photo brush stroke (continuous smooth line)
    if (persona === 'photo' && (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'healing')) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.strokeStyle = activeTool === 'eraser' ? (theme.isLight ? '#ffffff' : '#1e1e24') : activeTool === 'healing' ? 'rgba(255,255,255,0.7)' : foregroundColor;
      ctx.lineWidth = toolOptions.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      if (lastPoint) {
        ctx.moveTo(lastPoint.x, lastPoint.y);
      } else {
        ctx.moveTo(x, y);
      }
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
      setLastPoint({ x, y });
    }

    // Drag-creation resizing (Marquee or Shapes or Frames)
    if (selectionBox) {
      setSelectionBox({
        startX: Math.min(dragStart.x, x),
        startY: Math.min(dragStart.y, y),
        width: Math.abs(x - dragStart.x),
        height: Math.abs(y - dragStart.y),
      });
    }

    // Interactive Crop Box dragging
    if (activeTool === 'crop' && cropBox) {
      setCropBox({
        x: Math.min(dragStart.x, x),
        y: Math.min(dragStart.y, y),
        width: Math.abs(x - dragStart.x),
        height: Math.abs(y - dragStart.y),
      });
    }

    // Dragging an existing Guide directly on the canvas surface
    if (draggingCanvasGuide) {
      const guideId = draggingCanvasGuide.id;
      const type = draggingCanvasGuide.type;
      const rawPos = type === 'horizontal' ? y : x;

      let snappedPos = Math.round(rawPos);
      let snapLabel: string | undefined;

      if (snapToGuides) {
        const snapThreshold = Math.max(5, Math.min(20, 8 / zoom));
        const maxBound = type === 'vertical' ? docWidth : docHeight;
        const targets: { pos: number; label: string }[] = [
          { pos: 0, label: type === 'vertical' ? 'Left Edge (0)' : 'Top Edge (0)' },
          { pos: Math.round(maxBound / 2), label: 'Center (50%)' },
          { pos: maxBound, label: type === 'vertical' ? `Right Edge (${maxBound}px)` : `Bottom Edge (${maxBound}px)` },
        ];

        for (const g of guides) {
          if (g.id !== guideId && g.type === type) {
            targets.push({ pos: g.position, label: `Guide ${g.position}px` });
          }
        }

        const objTargets = type === 'vertical' ? magneticTargets.x : magneticTargets.y;
        for (const t of objTargets) {
          targets.push({ pos: t, label: `Object Boundary ${t}px` });
        }

        let minDiff = snapThreshold + 1;
        for (const t of targets) {
          const diff = Math.abs(rawPos - t.pos);
          if (diff <= snapThreshold && diff < minDiff) {
            minDiff = diff;
            snappedPos = t.pos;
            snapLabel = t.label;
          }
        }
      }

      updateGuide(guideId, snappedPos);
      setActiveSnapGuide({
        x: type === 'vertical' ? snappedPos : undefined,
        y: type === 'horizontal' ? snappedPos : undefined,
        label: snapLabel || `${type === 'vertical' ? 'X' : 'Y'}: ${snappedPos}px`,
      });
      return;
    }

    // Drag-moving selected vector shape(s) together as group with magnetic snapping
    if (persona === 'vector' && (activeTool === 'move' || activeTool === 'direct-select') && selectedShapeIds.length > 0 && !selectionBox) {
      let dx = x - dragStart.x;
      let dy = y - dragStart.y;

      if (snapToGuides && showGuides) {
        const selectedShapes = vectorShapes.filter(s => selectedShapeIds.includes(s.id));
        if (selectedShapes.length > 0) {
          const minX = Math.min(...selectedShapes.map(s => s.x));
          const maxX = Math.max(...selectedShapes.map(s => s.x + s.width));
          const minY = Math.min(...selectedShapes.map(s => s.y));
          const maxY = Math.max(...selectedShapes.map(s => s.y + s.height));
          const midX = (minX + maxX) / 2;
          const midY = (minY + maxY) / 2;

          const threshold = Math.max(5, Math.min(20, 8 / zoom));

          // Snap X
          const vTargets = [
            0, Math.round(docWidth / 2), docWidth,
            ...guides.filter(g => g.type === 'vertical').map(g => g.position),
          ];
          let bestDiffX: number | null = null;
          let snapTargetX: number | undefined;
          let snapLabelX: string | undefined;

          for (const target of vTargets) {
            for (const [diff, label] of [
              [target - (minX + dx), 'Left Edge'],
              [target - (midX + dx), 'Center'],
              [target - (maxX + dx), 'Right Edge'],
            ] as const) {
              if (Math.abs(diff) <= threshold && (bestDiffX === null || Math.abs(diff) < Math.abs(bestDiffX))) {
                bestDiffX = diff;
                snapTargetX = target;
                snapLabelX = `${label} snapped to ${target}px`;
              }
            }
          }

          if (bestDiffX !== null) {
            dx += bestDiffX;
          }

          // Snap Y
          const hTargets = [
            0, Math.round(docHeight / 2), docHeight,
            ...guides.filter(g => g.type === 'horizontal').map(g => g.position),
          ];
          let bestDiffY: number | null = null;
          let snapTargetY: number | undefined;
          let snapLabelY: string | undefined;

          for (const target of hTargets) {
            for (const [diff, label] of [
              [target - (minY + dy), 'Top Edge'],
              [target - (midY + dy), 'Middle'],
              [target - (maxY + dy), 'Bottom Edge'],
            ] as const) {
              if (Math.abs(diff) <= threshold && (bestDiffY === null || Math.abs(diff) < Math.abs(bestDiffY))) {
                bestDiffY = diff;
                snapTargetY = target;
                snapLabelY = `${label} snapped to ${target}px`;
              }
            }
          }

          if (bestDiffY !== null) {
            dy += bestDiffY;
          }

          if (snapTargetX !== undefined || snapTargetY !== undefined) {
            setActiveSnapGuide({
              x: snapTargetX,
              y: snapTargetY,
              label: [snapLabelX, snapLabelY].filter(Boolean).join(' · '),
            });
          } else {
            setActiveSnapGuide(null);
          }
        }
      }

      setVectorShapes(prev => prev.map(s => selectedShapeIds.includes(s.id) ? { ...s, x: s.x + dx, y: s.y + dy } : s));
      setDragStart({ x, y });
    }

    // Drag-moving selected publish frame(s) together as group with magnetic snapping
    if (persona === 'publish' && activeTool === 'move' && selectedFrameIds.length > 0 && !selectionBox) {
      let dx = x - dragStart.x;
      let dy = y - dragStart.y;

      if (snapToGuides && showGuides) {
        const selectedF = publishFrames.filter(f => selectedFrameIds.includes(f.id));
        if (selectedF.length > 0) {
          const minX = Math.min(...selectedF.map(f => f.x));
          const maxX = Math.max(...selectedF.map(f => f.x + f.width));
          const minY = Math.min(...selectedF.map(f => f.y));
          const maxY = Math.max(...selectedF.map(f => f.y + f.height));
          const midX = (minX + maxX) / 2;
          const midY = (minY + maxY) / 2;

          const threshold = Math.max(5, Math.min(20, 8 / zoom));

          const vTargets = [
            0, Math.round(docWidth / 2), docWidth,
            ...guides.filter(g => g.type === 'vertical').map(g => g.position),
          ];
          let bestDiffX: number | null = null;
          let snapTargetX: number | undefined;
          let snapLabelX: string | undefined;

          for (const target of vTargets) {
            for (const [diff, label] of [
              [target - (minX + dx), 'Left Edge'],
              [target - (midX + dx), 'Center'],
              [target - (maxX + dx), 'Right Edge'],
            ] as const) {
              if (Math.abs(diff) <= threshold && (bestDiffX === null || Math.abs(diff) < Math.abs(bestDiffX))) {
                bestDiffX = diff;
                snapTargetX = target;
                snapLabelX = `${label} snapped to ${target}px`;
              }
            }
          }

          if (bestDiffX !== null) {
            dx += bestDiffX;
          }

          const hTargets = [
            0, Math.round(docHeight / 2), docHeight,
            ...guides.filter(g => g.type === 'horizontal').map(g => g.position),
          ];
          let bestDiffY: number | null = null;
          let snapTargetY: number | undefined;
          let snapLabelY: string | undefined;

          for (const target of hTargets) {
            for (const [diff, label] of [
              [target - (minY + dy), 'Top Edge'],
              [target - (midY + dy), 'Middle'],
              [target - (maxY + dy), 'Bottom Edge'],
            ] as const) {
              if (Math.abs(diff) <= threshold && (bestDiffY === null || Math.abs(diff) < Math.abs(bestDiffY))) {
                bestDiffY = diff;
                snapTargetY = target;
                snapLabelY = `${label} snapped to ${target}px`;
              }
            }
          }

          if (bestDiffY !== null) {
            dy += bestDiffY;
          }

          if (snapTargetX !== undefined || snapTargetY !== undefined) {
            setActiveSnapGuide({
              x: snapTargetX,
              y: snapTargetY,
              label: [snapLabelX, snapLabelY].filter(Boolean).join(' · '),
            });
          } else {
            setActiveSnapGuide(null);
          }
        }
      }

      setPublishFrames(prev => prev.map(f => selectedFrameIds.includes(f.id) ? { ...f, x: f.x + dx, y: f.y + dy } : f));
      setDragStart({ x, y });
    }

    // Drag-moving selected photo layer with magnetic snapping
    if (persona === 'photo' && activeTool === 'move' && !selectionBox && project.selectedLayerId) {
      const activeLayer = project.layers.find(l => l.id === project.selectedLayerId);
      if (activeLayer && (activeLayer.x !== undefined || activeLayer.type === 'text')) {
        let dx = x - dragStart.x;
        let dy = y - dragStart.y;
        const curX = activeLayer.x || 0;
        const curY = activeLayer.y || 0;
        const curW = activeLayer.width || 200;
        const curH = activeLayer.height || 50;

        if (snapToGuides && showGuides) {
          const threshold = Math.max(5, Math.min(20, 8 / zoom));
          const vTargets = [0, Math.round(docWidth / 2), docWidth, ...guides.filter(g => g.type === 'vertical').map(g => g.position)];
          const hTargets = [0, Math.round(docHeight / 2), docHeight, ...guides.filter(g => g.type === 'horizontal').map(g => g.position)];

          for (const target of vTargets) {
            for (const diff of [target - (curX + dx), target - (curX + curW / 2 + dx), target - (curX + curW + dx)]) {
              if (Math.abs(diff) <= threshold) {
                dx += diff;
                break;
              }
            }
          }
          for (const target of hTargets) {
            for (const diff of [target - (curY + dy), target - (curY + curH / 2 + dy), target - (curY + curH + dy)]) {
              if (Math.abs(diff) <= threshold) {
                dy += diff;
                break;
              }
            }
          }
        }

        setProject(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === activeLayer.id ? { ...l, x: (l.x || 0) + dx, y: (l.y || 0) + dy } : l),
        }));
        setDragStart({ x, y });
      }
    }
  };

  const handleMouseUp = () => {
    if (!isMouseDown) return;
    setIsMouseDown(false);
    setLastPoint(null);
    setActiveSnapGuide(null);

    // Finalize dragging existing guide directly on canvas
    if (draggingCanvasGuide) {
      const guide = guides.find(g => g.id === draggingCanvasGuide.id);
      if (guide) {
        // If dragged completely outside canvas area (e.g. into negative pasteboard or past margins), delete
        const isOffCanvas = guide.type === 'horizontal'
          ? (guide.position < -50 || guide.position > docHeight + 50)
          : (guide.position < -50 || guide.position > docWidth + 50);

        if (isOffCanvas) {
          removeGuide(guide.id);
          showShortcutFeedback('Guide Deleted (Dragged off canvas)');
        } else {
          showShortcutFeedback(`Guide Set: ${guide.type === 'horizontal' ? 'Y' : 'X'} ${guide.position}px`);
        }
      }
      setDraggingCanvasGuide(null);
      return;
    }

    // Finalize Photo drawing stroke to active layer
    if (persona === 'photo' && (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'healing')) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const newUrl = canvas.toDataURL('image/png');
      setProject(prev => ({
        ...prev,
        layers: prev.layers.map(l => l.id === prev.selectedLayerId ? { ...l, canvasDataUrl: newUrl } : l),
      }));
      pushHistoryStep(activeTool === 'brush' ? 'Brush Paint Stroke' : 'Pixel Erase');
    }

    // Finalize Vector Marquee Selection or Shape Creation
    if (persona === 'vector' && selectionBox) {
      if (activeTool === 'move' || activeTool === 'direct-select') {
        // Multi-select shapes intersecting marquee box
        if (selectionBox.width > 3 && selectionBox.height > 3) {
          const bx1 = selectionBox.startX;
          const by1 = selectionBox.startY;
          const bx2 = selectionBox.startX + selectionBox.width;
          const by2 = selectionBox.startY + selectionBox.height;

          const intersected = vectorShapes.filter(s => {
            const sx1 = s.x;
            const sy1 = s.y;
            const sx2 = s.x + s.width;
            const sy2 = s.y + s.height;
            return !(sx2 < bx1 || sx1 > bx2 || sy2 < by1 || sy1 > by2);
          });

          if (intersected.length > 0) {
            setSelectedShapeIds(intersected.map(s => s.id));
            showShortcutFeedback(`Selected ${intersected.length} Shapes (Ctrl+G to group)`);
          }
        }
        setSelectionBox(null);
      } else if (selectionBox.width > 5 && selectionBox.height > 5) {
        const newShape: VectorShape = {
          id: `shape-${Date.now()}`,
          type: activeTool === 'shape-ellipse' ? 'ellipse' : activeTool === 'shape-polygon' ? 'polygon' : 'rect',
          x: selectionBox.startX,
          y: selectionBox.startY,
          width: selectionBox.width,
          height: selectionBox.height,
          fill: vectorFill,
          stroke: vectorStroke,
          strokeWidth: vectorStrokeWidth,
          cornerRadius: vectorCornerRadius,
        };
        setVectorShapes(prev => [...prev, newShape]);
        setSelectedShapeIds([newShape.id]);
        setSelectionBox(null);
        pushHistoryStep(`Create Vector ${newShape.type.toUpperCase()}`);
        showShortcutFeedback(`Created Vector ${newShape.type}`);
      }
    }

    // Finalize Publish Marquee Selection or Frame Creation
    if (persona === 'publish' && selectionBox) {
      if (activeTool === 'move' || activeTool === 'page-tool') {
        if (selectionBox.width > 3 && selectionBox.height > 3) {
          const bx1 = selectionBox.startX;
          const by1 = selectionBox.startY;
          const bx2 = selectionBox.startX + selectionBox.width;
          const by2 = selectionBox.startY + selectionBox.height;

          const intersected = publishFrames.filter(f => {
            const fx1 = f.x;
            const fy1 = f.y;
            const fx2 = f.x + f.width;
            const fy2 = f.y + f.height;
            return !(fx2 < bx1 || fx1 > bx2 || fy2 < by1 || fy1 > by2);
          });

          if (intersected.length > 0) {
            setSelectedFrameIds(intersected.map(f => f.id));
            showShortcutFeedback(`Selected ${intersected.length} Frames (Ctrl+G to group)`);
          }
        }
        setSelectionBox(null);
      } else if (selectionBox.width > 10 && selectionBox.height > 10) {
        const newFrame: PublishFrame = {
          id: `pub-frame-${Date.now()}`,
          type: activeTool === 'frame-picture' ? 'picture' : activeTool === 'line-tool' ? 'rule' : 'text',
          x: selectionBox.startX,
          y: selectionBox.startY,
          width: selectionBox.width,
          height: activeTool === 'line-tool' ? 2 : selectionBox.height,
          title: activeTool === 'frame-picture' ? 'GRAPHIC PICTURE FRAME (300 DPI)' : undefined,
          content: activeTool === 'frame-text' ? 'New Editorial Column · Typography flows here.' : undefined,
        };
        setPublishFrames(prev => [...prev, newFrame]);
        setSelectedFrameIds([newFrame.id]);
        setSelectionBox(null);
        pushHistoryStep(`Create ${newFrame.type.toUpperCase()} Frame`);
        showShortcutFeedback(`Created Publication ${newFrame.type} Frame`);
      }
    }

    setDragStart(null);
  };

  // Wheel zoom & pan (smooth trackpad pinch-to-zoom without discrete warping)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Proportional pinch zoom without abrupt stepped jumps
      const zoomDelta = -e.deltaY * 0.005;
      const factor = Math.min(1.25, Math.max(0.8, 1 + zoomDelta));
      const nextZoom = Math.max(0.05, Math.min(16, zoom * factor));

      // Zoom toward mouse position
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cursorX = e.clientX - (rect.left + rect.width / 2);
        const cursorY = e.clientY - (rect.top + rect.height / 2);
        const actualFactor = nextZoom / zoom;
        setPan(panX - (cursorX - panX) * (actualFactor - 1), panY - (cursorY - panY) * (actualFactor - 1));
      }
      setZoom(nextZoom);
    } else {
      setPan(panX - e.deltaX, panY - e.deltaY);
    }
  };

  // Apply Crop Action
  const applyCrop = () => {
    if (!cropBox || cropBox.width < 50 || cropBox.height < 50) return;
    setProject(prev => ({
      ...prev,
      width: Math.round(cropBox.width),
      height: Math.round(cropBox.height),
    }));
    setCropBox(null);
    setActiveTool('move');
    pushHistoryStep('Crop Canvas');
    showShortcutFeedback(`Cropped Canvas to ${Math.round(cropBox.width)}×${Math.round(cropBox.height)}`);
  };

  return (
    <main
      ref={containerRef}
      className="flex-1 relative overflow-hidden flex items-center justify-center select-none transition-colors"
      style={{
        touchAction: 'none',
        backgroundColor: persona === 'publish' ? (theme.isLight ? '#cbd5e1' : '#141416') : persona === 'vector' ? (theme.isLight ? '#e2e8f0' : '#18181b') : theme.bgCanvas,
      }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Precision Interactive Rulers */}
      {showRulers && (
        <Rulers
          zoom={zoom}
          panX={panX}
          panY={panY}
          docWidth={docWidth}
          docHeight={docHeight}
          cursorX={mousePos.x}
          cursorY={mousePos.y}
          containerRef={containerRef}
          canvasRef={canvasRef}
          guides={guides}
          onAddGuide={addGuide}
          onUpdateGuide={updateGuide}
          onRemoveGuide={removeGuide}
          onClearGuides={clearGuides}
          snapToGuides={snapToGuides}
          setSnapToGuides={setSnapToGuides}
          lockGuides={lockGuides}
          setLockGuides={setLockGuides}
          showGuides={showGuides}
          setShowGuides={setShowGuides}
          clientToDocCoords={clientToDocCoords}
          magneticTargets={magneticTargets}
        />
      )}

      {/* Main Artboard Canvas Container (Hardware Scaled with zero aspect warping) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        <div
          className="relative pointer-events-auto border rounded-xs"
          style={{
            width: `${docWidth}px`,
            height: `${docHeight}px`,
            borderColor: theme.isLight ? '#64748b' : 'rgba(255, 255, 255, 0.2)',
            boxShadow: theme.isLight
              ? '0 20px 50px rgba(0, 0, 0, 0.22), 0 4px 14px rgba(0, 0, 0, 0.12)'
              : '0 25px 60px rgba(0, 0, 0, 0.75), 0 4px 16px rgba(0, 0, 0, 0.5)',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Header Tag above Workspace Canvas */}
          <div className="absolute -top-6 left-0 text-[11px] font-medium select-none flex items-center gap-2" style={{ color: theme.textSecondary }}>
            <span className="font-bold" style={{ color: theme.textPrimary }}>
              {persona === 'vector' ? 'Artboard 1' : persona === 'publish' ? 'Spread 2–3 (Facing Pages)' : project.name}
            </span>
            <span>·</span>
            <span>{docWidth} × {docHeight} px</span>
            <span>·</span>
            <span className="uppercase text-[10px] font-semibold">{project.colorMode}</span>
          </div>

          {/* Transparency Grid (Checkerboard) for Photo, Plain White for Vector & Publish */}
          {persona === 'photo' && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: theme.isLight
                  ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
                  : 'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                backgroundColor: theme.isLight ? '#ffffff' : '#1a1a1a',
              }}
            />
          )}

          {/* HTML5 Canvas Surface */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
              imageRendering: zoom > 2 ? 'pixelated' : 'auto',
            }}
          />

          {/* Global Interactive Guides Overlay */}
          {showGuides && guides.map(g => (
            <div
              key={g.id}
              className={`absolute group pointer-events-auto select-none transition-colors ${
                g.type === 'horizontal' ? 'left-0 right-0 h-px cursor-row-resize' : 'top-0 bottom-0 w-px cursor-col-resize'
              }`}
              style={{
                top: g.type === 'horizontal' ? `${g.position}px` : 0,
                left: g.type === 'vertical' ? `${g.position}px` : 0,
                backgroundColor: activeHoverGuideId === g.id || draggingCanvasGuide?.id === g.id ? '#f43f5e' : '#00e5ff',
                boxShadow: activeHoverGuideId === g.id || draggingCanvasGuide?.id === g.id ? '0 0 6px #f43f5e' : '0 0 4px #00e5ff',
                zIndex: 25,
              }}
              onMouseEnter={() => setActiveHoverGuideId(g.id)}
              onMouseLeave={() => setActiveHoverGuideId(prev => prev === g.id ? null : prev)}
              onMouseDown={e => {
                e.stopPropagation();
                if (lockGuides) {
                  showShortcutFeedback('Guides are Locked');
                  return;
                }
                setIsMouseDown(true);
                setDraggingCanvasGuide({
                  id: g.id,
                  type: g.type,
                  initialPos: g.position,
                });
              }}
              onContextMenu={e => {
                e.preventDefault();
                e.stopPropagation();
                removeGuide(g.id);
                showShortcutFeedback('Removed Guide');
              }}
              title={`${g.type === 'horizontal' ? 'Horizontal' : 'Vertical'} Guide at ${g.position}px (Drag to move, Right-click to delete)`}
            >
              {/* Invisible Expanded Hit Area */}
              <div
                className={`absolute ${
                  g.type === 'horizontal' ? '-top-2 -bottom-2 inset-x-0' : '-left-2 -right-2 inset-y-0'
                }`}
              />
              {/* Hover Position Pill */}
              <div
                className={`absolute px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900/90 text-cyan-300 border border-cyan-400 shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 ${
                  g.type === 'horizontal' ? 'left-2 -top-5' : 'top-2 -left-6'
                }`}
              >
                {g.type === 'horizontal' ? `Y: ${g.position}px` : `X: ${g.position}px`}
              </div>
            </div>
          ))}

          {/* Active Magnetic Snapping Feedback Line & Pill */}
          {activeSnapGuide && (
            <>
              {activeSnapGuide.x !== undefined && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-rose-500 shadow-[0_0_8px_#f43f5e] z-30 pointer-events-none animate-pulse"
                  style={{ left: `${activeSnapGuide.x}px` }}
                />
              )}
              {activeSnapGuide.y !== undefined && (
                <div
                  className="absolute left-0 right-0 h-px bg-rose-500 shadow-[0_0_8px_#f43f5e] z-30 pointer-events-none animate-pulse"
                  style={{ top: `${activeSnapGuide.y}px` }}
                />
              )}
              {activeSnapGuide.label && (
                <div
                  className="absolute bottom-4 right-4 bg-slate-900/95 border border-rose-500 text-white px-2.5 py-1 rounded shadow-2xl flex items-center gap-1.5 text-[11px] font-mono font-bold z-40 pointer-events-none animate-in fade-in"
                >
                  <Magnet className="w-3.5 h-3.5 text-rose-400" />
                  <span>{activeSnapGuide.label}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Crop Action HUD when Crop Tool is active */}
      {activeTool === 'crop' && cropBox && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md text-white border border-[#0d99ff]/60 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 z-30 text-xs font-semibold animate-in fade-in">
          <Crop className="w-4 h-4 text-[#0d99ff]" />
          <span>Crop: {Math.round(cropBox.width)} × {Math.round(cropBox.height)} px</span>
          <button
            onClick={applyCrop}
            className="flex items-center gap-1 px-3 py-1 bg-[#0d99ff] hover:bg-sky-500 rounded-full text-white font-bold transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply (Enter)</span>
          </button>
          <button
            onClick={() => setCropBox(null)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full text-neutral-300 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {/* Workspace Status HUD (Bottom Bar) */}
      <div
        className="absolute bottom-2 left-6 flex items-center gap-2.5 px-3 py-1 rounded border text-[10px] font-mono shadow-md z-10"
        style={{
          backgroundColor: theme.isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.8)',
          borderColor: theme.borderStrong,
          color: theme.textPrimary,
        }}
      >
        <span className="font-semibold text-sky-600 dark:text-sky-400 capitalize">
          {persona === 'photo'
            ? 'Photo Retouching Canvas'
            : persona === 'vector'
            ? 'Vector Illustration Artboard'
            : 'Publication Facing Spread'}
        </span>
        <span>·</span>
        <span>X: {mousePos.x}px</span>
        <span>·</span>
        <span>Y: {mousePos.y}px</span>
        <span>·</span>
        <span className="font-bold" style={{ color: theme.accent }}>
          Zoom: {Math.round(zoom * 100)}%
        </span>
      </div>
    </main>
  );
};
