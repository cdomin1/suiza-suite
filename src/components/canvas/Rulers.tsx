import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Guide } from '../../types';
import { Magnet, Lock, Eye, EyeOff, Trash2, Plus, Settings, X, Check } from 'lucide-react';

interface RulersProps {
  zoom: number;
  panX: number;
  panY: number;
  docWidth: number;
  docHeight: number;
  cursorX: number;
  cursorY: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  guides: Guide[];
  onAddGuide: (type: 'horizontal' | 'vertical', position: number) => Guide;
  onUpdateGuide: (id: string, position: number) => void;
  onRemoveGuide: (id: string) => void;
  onClearGuides: () => void;
  snapToGuides: boolean;
  setSnapToGuides: React.Dispatch<React.SetStateAction<boolean>>;
  lockGuides: boolean;
  setLockGuides: React.Dispatch<React.SetStateAction<boolean>>;
  showGuides: boolean;
  setShowGuides: React.Dispatch<React.SetStateAction<boolean>>;
  clientToDocCoords: (clientX: number, clientY: number) => { x: number; y: number };
  magneticTargets?: { x: number[]; y: number[] };
}

export type RulerUnit = 'px' | 'pt' | 'mm' | 'in';

export const Rulers: React.FC<RulersProps> = ({
  zoom,
  panX,
  panY,
  docWidth,
  docHeight,
  cursorX,
  cursorY,
  containerRef,
  canvasRef,
  guides,
  onAddGuide,
  onUpdateGuide,
  onRemoveGuide,
  onClearGuides,
  snapToGuides,
  setSnapToGuides,
  lockGuides,
  setLockGuides,
  showGuides,
  setShowGuides,
  clientToDocCoords,
  magneticTargets,
}) => {
  const { theme, showShortcutFeedback } = useStudio();

  // Unit configuration
  const [unit, setUnit] = useState<RulerUnit>('px');
  const [showCornerMenu, setShowCornerMenu] = useState(false);
  const [showNewGuideModal, setShowNewGuideModal] = useState(false);
  const [newGuideType, setNewGuideType] = useState<'horizontal' | 'vertical'>('horizontal');
  const [newGuidePosInput, setNewGuidePosInput] = useState('100');

  // Interactive Guide Dragging state
  const [activeDrag, setActiveDrag] = useState<{
    type: 'horizontal' | 'vertical';
    isNew: boolean;
    guideId?: string;
    rawDocPos: number;
    snappedDocPos: number;
    snapLabel?: string;
    clientX: number;
    clientY: number;
  } | null>(null);

  // Ruler Canvas references for 60fps hardware-accelerated drawing
  const hCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate origin in screen space
  const getOrigin = useCallback(() => {
    if (canvasRef.current && containerRef.current) {
      const cRect = containerRef.current.getBoundingClientRect();
      const aRect = canvasRef.current.getBoundingClientRect();
      return {
        originX: aRect.left - cRect.left,
        originY: aRect.top - cRect.top,
      };
    }
    // Fallback calculation
    const containerW = containerRef.current?.clientWidth || 1000;
    const containerH = containerRef.current?.clientHeight || 800;
    return {
      originX: containerW / 2 - (docWidth * zoom) / 2 + panX,
      originY: containerH / 2 - (docHeight * zoom) / 2 + panY,
    };
  }, [canvasRef, containerRef, docWidth, docHeight, zoom, panX, panY]);

  // Unit conversion helper
  const unitFactor = useMemo(() => {
    switch (unit) {
      case 'pt': return 0.75; // 72pt / 96px
      case 'mm': return 0.264583;
      case 'in': return 1 / 96;
      default: return 1;
    }
  }, [unit]);

  const formatCoord = (px: number) => {
    const val = px * unitFactor;
    return unit === 'px' ? Math.round(val) : Math.round(val * 10) / 10;
  };

  // Magnetic snap calculator for a given coordinate
  const calculateMagneticSnap = useCallback((
    type: 'horizontal' | 'vertical',
    rawDocPos: number
  ) => {
    if (!snapToGuides) {
      return { snappedPos: Math.round(rawDocPos), snapLabel: undefined };
    }

    const snapThreshold = Math.max(6, Math.min(24, 8 / zoom)); // ~8 screen pixels
    let closestTarget: number | null = null;
    let minDiff = snapThreshold + 1;
    let snapLabel: string | undefined = undefined;

    // Document bounds and center targets
    const maxBound = type === 'vertical' ? docWidth : docHeight;
    const defaultSnapPoints = [
      { pos: 0, label: type === 'vertical' ? 'Left Canvas Edge (0)' : 'Top Canvas Edge (0)' },
      { pos: Math.round(maxBound / 2), label: 'Center (50%)' },
      { pos: maxBound, label: type === 'vertical' ? `Right Edge (${maxBound}px)` : `Bottom Edge (${maxBound}px)` },
    ];

    for (const p of defaultSnapPoints) {
      const diff = Math.abs(rawDocPos - p.pos);
      if (diff <= snapThreshold && diff < minDiff) {
        minDiff = diff;
        closestTarget = p.pos;
        snapLabel = p.label;
      }
    }

    // Existing guides of same type
    for (const g of guides) {
      if (g.type === type) {
        const diff = Math.abs(rawDocPos - g.position);
        if (diff <= snapThreshold && diff < minDiff) {
          minDiff = diff;
          closestTarget = g.position;
          snapLabel = `Guide (${g.position}px)`;
        }
      }
    }

    // Object bounds magnetic targets
    if (magneticTargets) {
      const targets = type === 'vertical' ? magneticTargets.x : magneticTargets.y;
      for (const t of targets) {
        const diff = Math.abs(rawDocPos - t);
        if (diff <= snapThreshold && diff < minDiff) {
          minDiff = diff;
          closestTarget = t;
          snapLabel = `Object Boundary (${t}px)`;
        }
      }
    }

    if (closestTarget !== null) {
      return { snappedPos: closestTarget, snapLabel };
    }

    return { snappedPos: Math.round(rawDocPos), snapLabel: undefined };
  }, [snapToGuides, zoom, docWidth, docHeight, guides, magneticTargets]);

  // Start dragging a NEW guide from Top Ruler (horizontal) or Left Ruler (vertical)
  const handleRulerMouseDown = (
    type: 'horizontal' | 'vertical',
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (lockGuides) {
      showShortcutFeedback('Guides are Locked (Unlock to create)');
      return;
    }

    const { x, y } = clientToDocCoords(e.clientX, e.clientY);
    const rawPos = type === 'horizontal' ? y : x;
    const { snappedPos, snapLabel } = calculateMagneticSnap(type, rawPos);

    setActiveDrag({
      type,
      isNew: true,
      rawDocPos: rawPos,
      snappedDocPos: snappedPos,
      snapLabel,
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  // Window-level mouse listeners for smooth guide drag & drop
  useEffect(() => {
    if (!activeDrag) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = clientToDocCoords(e.clientX, e.clientY);
      const rawPos = activeDrag.type === 'horizontal' ? y : x;
      const { snappedPos, snapLabel } = calculateMagneticSnap(activeDrag.type, rawPos);

      setActiveDrag(prev => prev ? {
        ...prev,
        rawDocPos: rawPos,
        snappedDocPos: snappedPos,
        snapLabel,
        clientX: e.clientX,
        clientY: e.clientY,
      } : null);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!containerRef.current) {
        setActiveDrag(null);
        return;
      }
      const cRect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - cRect.left;
      const relativeY = e.clientY - cRect.top;

      // Discard if dropped back onto the ruler
      const isDroppedOnRuler =
        (activeDrag.type === 'horizontal' && relativeY <= 22) ||
        (activeDrag.type === 'vertical' && relativeX <= 22);

      if (isDroppedOnRuler) {
        if (!activeDrag.isNew && activeDrag.guideId) {
          // Dragged existing guide back to ruler = DELETE guide
          onRemoveGuide(activeDrag.guideId);
          showShortcutFeedback('Guide Deleted (Dragged to ruler)');
        } else {
          showShortcutFeedback('Guide Cancelled');
        }
      } else {
        // Place guide on canvas
        if (activeDrag.isNew) {
          onAddGuide(activeDrag.type, activeDrag.snappedDocPos);
          if (!showGuides) setShowGuides(true);
        } else if (activeDrag.guideId) {
          onUpdateGuide(activeDrag.guideId, activeDrag.snappedDocPos);
          showShortcutFeedback(`Repositioned Guide to ${activeDrag.snappedDocPos}px`);
        }
      }

      setActiveDrag(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    activeDrag,
    clientToDocCoords,
    calculateMagneticSnap,
    containerRef,
    onAddGuide,
    onUpdateGuide,
    onRemoveGuide,
    showGuides,
    setShowGuides,
    showShortcutFeedback,
  ]);

  // Render Horizontal Ruler Ticks on Canvas
  useEffect(() => {
    const canvas = hCanvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = containerRef.current.clientWidth - 20;
    const height = 20;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = theme.isLight ? '#f1f5f9' : '#1e1e24';
    ctx.fillRect(0, 0, width, height);

    // Bottom border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 0.5);
    ctx.lineTo(width, height - 0.5);
    ctx.stroke();

    const { originX } = getOrigin();
    const rulerOriginX = originX - 20; // 20px offset for corner box

    // Adaptive step based on zoom
    let step = 100;
    let subStep = 10;
    if (zoom >= 4) { step = 20; subStep = 5; }
    else if (zoom >= 2) { step = 50; subStep = 10; }
    else if (zoom >= 1) { step = 100; subStep = 20; }
    else if (zoom >= 0.5) { step = 200; subStep = 50; }
    else { step = 500; subStep = 100; }

    const screenStep = step * zoom;
    const screenSubStep = subStep * zoom;

    // Visible range in document units
    const minDocX = Math.floor((-rulerOriginX) / (step * zoom)) * step;
    const maxDocX = Math.ceil((width - rulerOriginX) / (step * zoom)) * step;

    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Draw sub-ticks
    ctx.strokeStyle = theme.isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = minDocX; x <= maxDocX; x += subStep) {
      const screenX = Math.round(rulerOriginX + x * zoom) + 0.5;
      if (screenX >= 0 && screenX <= width) {
        ctx.moveTo(screenX, height - 4);
        ctx.lineTo(screenX, height);
      }
    }
    ctx.stroke();

    // Draw major ticks and numbers
    ctx.strokeStyle = theme.isLight ? '#94a3b8' : 'rgba(255, 255, 255, 0.4)';
    ctx.fillStyle = theme.isLight ? '#475569' : '#94a3b8';

    for (let x = minDocX; x <= maxDocX; x += step) {
      const screenX = Math.round(rulerOriginX + x * zoom) + 0.5;
      if (screenX >= 0 && screenX <= width) {
        // Major tick
        ctx.beginPath();
        const isOrigin = x === 0;
        ctx.lineWidth = isOrigin ? 1.5 : 1;
        ctx.strokeStyle = isOrigin ? theme.accent : theme.isLight ? '#64748b' : 'rgba(255, 255, 255, 0.4)';
        ctx.moveTo(screenX, isOrigin ? 0 : height - 9);
        ctx.lineTo(screenX, height);
        ctx.stroke();

        // Label
        const label = `${formatCoord(x)}`;
        ctx.fillStyle = isOrigin ? theme.accent : theme.isLight ? '#334155' : '#cbd5e1';
        ctx.fillText(label, screenX + 2, 2);
      }
    }

    // Active Cursor Tracker tick
    const screenCursorX = Math.round(rulerOriginX + cursorX * zoom) + 0.5;
    if (screenCursorX >= 0 && screenCursorX <= width) {
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(screenCursorX, 0);
      ctx.lineTo(screenCursorX, height);
      ctx.stroke();

      // Top triangle pip
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.moveTo(screenCursorX - 3, 0);
      ctx.lineTo(screenCursorX + 3, 0);
      ctx.lineTo(screenCursorX, 4);
      ctx.closePath();
      ctx.fill();
    }

    // Existing vertical guide marker pips on ruler
    if (showGuides) {
      for (const g of guides) {
        if (g.type === 'vertical') {
          const gx = Math.round(rulerOriginX + g.position * zoom) + 0.5;
          if (gx >= 0 && gx <= width) {
            ctx.fillStyle = '#06b6d4'; // Cyan guide pip
            ctx.beginPath();
            ctx.moveTo(gx - 3.5, height - 7);
            ctx.lineTo(gx + 3.5, height - 7);
            ctx.lineTo(gx, height - 1);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }
  }, [
    zoom,
    panX,
    panY,
    docWidth,
    docHeight,
    cursorX,
    theme,
    getOrigin,
    formatCoord,
    containerRef,
    showGuides,
    guides,
  ]);

  // Render Vertical Ruler Ticks on Canvas
  useEffect(() => {
    const canvas = vCanvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 20;
    const height = containerRef.current.clientHeight - 20;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = theme.isLight ? '#f1f5f9' : '#1e1e24';
    ctx.fillRect(0, 0, width, height);

    // Right border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width - 0.5, 0);
    ctx.lineTo(width - 0.5, height);
    ctx.stroke();

    const { originY } = getOrigin();
    const rulerOriginY = originY - 20; // 20px offset for corner box

    let step = 100;
    let subStep = 10;
    if (zoom >= 4) { step = 20; subStep = 5; }
    else if (zoom >= 2) { step = 50; subStep = 10; }
    else if (zoom >= 1) { step = 100; subStep = 20; }
    else if (zoom >= 0.5) { step = 200; subStep = 50; }
    else { step = 500; subStep = 100; }

    const minDocY = Math.floor((-rulerOriginY) / (step * zoom)) * step;
    const maxDocY = Math.ceil((height - rulerOriginY) / (step * zoom)) * step;

    // Sub-ticks
    ctx.strokeStyle = theme.isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = minDocY; y <= maxDocY; y += subStep) {
      const screenY = Math.round(rulerOriginY + y * zoom) + 0.5;
      if (screenY >= 0 && screenY <= height) {
        ctx.moveTo(width - 4, screenY);
        ctx.lineTo(width, screenY);
      }
    }
    ctx.stroke();

    // Major ticks and vertical rotated numbers
    for (let y = minDocY; y <= maxDocY; y += step) {
      const screenY = Math.round(rulerOriginY + y * zoom) + 0.5;
      if (screenY >= 0 && screenY <= height) {
        const isOrigin = y === 0;
        ctx.beginPath();
        ctx.lineWidth = isOrigin ? 1.5 : 1;
        ctx.strokeStyle = isOrigin ? theme.accent : theme.isLight ? '#64748b' : 'rgba(255, 255, 255, 0.4)';
        ctx.moveTo(isOrigin ? 0 : width - 9, screenY);
        ctx.lineTo(width, screenY);
        ctx.stroke();

        // Vertical rotated text label
        ctx.save();
        ctx.translate(2, screenY + 2);
        ctx.rotate(-Math.PI / 2);
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = isOrigin ? theme.accent : theme.isLight ? '#334155' : '#cbd5e1';
        ctx.fillText(`${formatCoord(y)}`, 0, 9);
        ctx.restore();
      }
    }

    // Active Cursor Tracker tick
    const screenCursorY = Math.round(rulerOriginY + cursorY * zoom) + 0.5;
    if (screenCursorY >= 0 && screenCursorY <= height) {
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, screenCursorY);
      ctx.lineTo(width, screenCursorY);
      ctx.stroke();

      // Left triangle pip
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.moveTo(0, screenCursorY - 3);
      ctx.lineTo(0, screenCursorY + 3);
      ctx.lineTo(4, screenCursorY);
      ctx.closePath();
      ctx.fill();
    }

    // Existing horizontal guide marker pips on ruler
    if (showGuides) {
      for (const g of guides) {
        if (g.type === 'horizontal') {
          const gy = Math.round(rulerOriginY + g.position * zoom) + 0.5;
          if (gy >= 0 && gy <= height) {
            ctx.fillStyle = '#06b6d4'; // Cyan guide pip
            ctx.beginPath();
            ctx.moveTo(width - 7, gy - 3.5);
            ctx.lineTo(width - 7, gy + 3.5);
            ctx.lineTo(width - 1, gy);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }
  }, [
    zoom,
    panX,
    panY,
    docWidth,
    docHeight,
    cursorY,
    theme,
    getOrigin,
    formatCoord,
    containerRef,
    showGuides,
    guides,
  ]);

  return (
    <>
      {/* =====================================================================
          1. TOP-LEFT CORNER ORIGIN BOX (UNITS & QUICK GUIDE MENU)
          ===================================================================== */}
      <div
        className="absolute top-0 left-0 w-5 h-5 border-r border-b z-30 flex items-center justify-center text-[9px] font-mono font-bold cursor-pointer select-none transition-colors"
        style={{
          backgroundColor: theme.isLight ? '#e2e8f0' : '#27272a',
          borderColor: theme.border,
          color: showCornerMenu ? theme.accent : theme.textSecondary,
        }}
        onClick={() => setShowCornerMenu(prev => !prev)}
        title="Ruler Origin & Guide System Menu (Click to configure)"
      >
        <span>{unit}</span>
      </div>

      {/* Corner Quick Settings Dropdown */}
      {showCornerMenu && (
        <div
          className="absolute top-6 left-1 w-60 rounded-md shadow-2xl py-1.5 text-xs border z-50 animate-in fade-in select-none backdrop-blur-md"
          style={{
            backgroundColor: theme.bgPanel,
            borderColor: theme.border,
            color: theme.textPrimary,
          }}
        >
          <div className="px-3 py-1 font-bold text-[11px] uppercase tracking-wider flex items-center justify-between border-b" style={{ borderColor: theme.border }}>
            <span>Rulers & Guides</span>
            <button
              onClick={() => setShowCornerMenu(false)}
              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Unit Selector */}
          <div className="px-3 py-2 border-b" style={{ borderColor: theme.border }}>
            <span className="text-[10px] uppercase font-bold opacity-75 block mb-1">Measurement Unit</span>
            <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
              {(['px', 'pt', 'mm', 'in'] as RulerUnit[]).map(u => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`py-1 rounded font-semibold transition-colors ${
                    unit === u
                      ? 'bg-[#0d99ff] text-white shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="py-1 border-b" style={{ borderColor: theme.border }}>
            <button
              onClick={() => setShowGuides(g => !g)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                {showGuides ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-400" />}
                <span>Show Guides</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">⌘;</span>
            </button>

            <button
              onClick={() => setSnapToGuides(s => !s)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Magnet className={`w-3.5 h-3.5 ${snapToGuides ? 'text-amber-400' : 'text-neutral-400'}`} />
                <span>Magnetic Snapping</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">{snapToGuides ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setLockGuides(l => !l)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Lock className={`w-3.5 h-3.5 ${lockGuides ? 'text-rose-400' : 'text-neutral-400'}`} />
                <span>Lock Guides</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">{lockGuides ? 'LOCKED' : 'FREE'}</span>
            </button>
          </div>

          {/* Quick Guide Actions */}
          <div className="py-1">
            <button
              onClick={() => {
                setShowCornerMenu(false);
                setShowNewGuideModal(true);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Guide at Exact Position...</span>
            </button>

            <button
              onClick={() => {
                onClearGuides();
                setShowCornerMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-rose-500 hover:text-white transition-colors text-rose-500 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Guides ({guides.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. TOP HORIZONTAL RULER (DRAG DOWN TO CREATE HORIZONTAL GUIDE)
          ===================================================================== */}
      <div
        className="absolute top-0 left-5 right-0 h-5 border-b z-20 overflow-hidden cursor-row-resize select-none pointer-events-auto"
        style={{
          backgroundColor: theme.isLight ? '#f1f5f9' : '#1e1e24',
          borderColor: theme.border,
        }}
        onMouseDown={e => handleRulerMouseDown('horizontal', e)}
        title="Top Ruler: Click and drag DOWN to pull a horizontal guide onto canvas"
      >
        <canvas ref={hCanvasRef} className="w-full h-full block" />
      </div>

      {/* =====================================================================
          3. LEFT VERTICAL RULER (DRAG RIGHT TO CREATE VERTICAL GUIDE)
          ===================================================================== */}
      <div
        className="absolute top-5 left-0 bottom-0 w-5 border-r z-20 overflow-hidden cursor-col-resize select-none pointer-events-auto"
        style={{
          backgroundColor: theme.isLight ? '#f1f5f9' : '#1e1e24',
          borderColor: theme.border,
        }}
        onMouseDown={e => handleRulerMouseDown('vertical', e)}
        title="Left Ruler: Click and drag RIGHT to pull a vertical guide onto canvas"
      >
        <canvas ref={vCanvasRef} className="w-full h-full block" />
      </div>

      {/* =====================================================================
          4. LIVE GUIDE DRAGGING OVERLAY & MAGNETIC SNAPPING HUD
          ===================================================================== */}
      {activeDrag && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Horizontal Dragging Guide line across screen */}
          {activeDrag.type === 'horizontal' && (
            <>
              {/* Infinite Cyan Guideline */}
              <div
                className="absolute left-0 right-0 h-[1.5px] bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] transition-none"
                style={{
                  top: `${activeDrag.clientY}px`,
                }}
              />
              {/* Magnetic Badge HUD near cursor */}
              <div
                className="absolute left-7 px-2.5 py-1 rounded shadow-xl flex items-center gap-1.5 text-xs font-mono font-semibold text-white animate-in fade-in"
                style={{
                  top: `${Math.max(26, activeDrag.clientY - 30)}px`,
                  backgroundColor: activeDrag.snapLabel ? '#0891b2' : 'rgba(15, 23, 42, 0.92)',
                  border: '1px solid rgba(0, 229, 255, 0.6)',
                }}
              >
                {activeDrag.snapLabel ? (
                  <>
                    <Magnet className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>Y: {activeDrag.snappedDocPos}px · {activeDrag.snapLabel}</span>
                  </>
                ) : (
                  <span>Y: {activeDrag.snappedDocPos}px</span>
                )}
              </div>
            </>
          )}

          {/* Vertical Dragging Guide line across screen */}
          {activeDrag.type === 'vertical' && (
            <>
              {/* Infinite Cyan Guideline */}
              <div
                className="absolute top-0 bottom-0 w-[1.5px] bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] transition-none"
                style={{
                  left: `${activeDrag.clientX}px`,
                }}
              />
              {/* Magnetic Badge HUD near cursor */}
              <div
                className="absolute top-7 px-2.5 py-1 rounded shadow-xl flex items-center gap-1.5 text-xs font-mono font-semibold text-white animate-in fade-in"
                style={{
                  left: `${Math.max(26, activeDrag.clientX + 10)}px`,
                  backgroundColor: activeDrag.snapLabel ? '#0891b2' : 'rgba(15, 23, 42, 0.92)',
                  border: '1px solid rgba(0, 229, 255, 0.6)',
                }}
              >
                {activeDrag.snapLabel ? (
                  <>
                    <Magnet className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>X: {activeDrag.snappedDocPos}px · {activeDrag.snapLabel}</span>
                  </>
                ) : (
                  <span>X: {activeDrag.snappedDocPos}px</span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* =====================================================================
          5. NEW GUIDE EXACT POSITION MODAL
          ===================================================================== */}
      {showNewGuideModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div
            className="w-80 rounded-lg border shadow-2xl p-4 text-xs space-y-3"
            style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, color: theme.textPrimary }}
          >
            <div className="flex items-center justify-between font-bold text-sm">
              <span>Create New Guide</span>
              <button
                onClick={() => setShowNewGuideModal(false)}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Orientation */}
            <div>
              <label className="font-semibold block mb-1">Orientation</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewGuideType('horizontal')}
                  className={`py-1.5 rounded font-semibold border ${
                    newGuideType === 'horizontal'
                      ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                      : 'border-slate-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  Horizontal (Y)
                </button>
                <button
                  type="button"
                  onClick={() => setNewGuideType('vertical')}
                  className={`py-1.5 rounded font-semibold border ${
                    newGuideType === 'vertical'
                      ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                      : 'border-slate-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  Vertical (X)
                </button>
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="font-semibold block mb-1">
                Position ({unit}):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newGuidePosInput}
                  onChange={e => setNewGuidePosInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border text-xs font-mono font-bold focus:outline-none focus:border-[#0d99ff]"
                  style={{
                    backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.4)',
                    borderColor: theme.borderStrong,
                    color: theme.textPrimary,
                  }}
                  autoFocus
                />
                <span className="font-mono text-xs opacity-75">{unit}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: theme.border }}>
              <button
                onClick={() => setShowNewGuideModal(false)}
                className="px-3 py-1.5 rounded border font-semibold hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: theme.border }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const parsed = parseFloat(newGuidePosInput) || 0;
                  const posInPx = Math.round(parsed / unitFactor);
                  onAddGuide(newGuideType, posInPx);
                  if (!showGuides) setShowGuides(true);
                  setShowNewGuideModal(false);
                }}
                className="px-4 py-1.5 rounded bg-[#0d99ff] hover:bg-sky-500 font-bold text-white shadow-xs"
              >
                Create Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
