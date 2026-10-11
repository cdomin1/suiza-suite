import React, { useState, useRef, useMemo } from 'react';
import { useStudio } from '../../context/StudioContext';
import { BlendMode, Layer, VectorShape, PublishFrame } from '../../types';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  SlidersHorizontal,
  Layers,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Folder,
  FolderOpen,
  ArrowDown,
  ArrowUp,
  ShieldCheck,
  Combine,
  Type,
  Square,
  Circle,
  Shapes,
  Image as ImageIcon,
  GripVertical,
  Search,
  X,
  Filter,
  Check,
} from 'lucide-react';

const BLEND_MODES: { id: BlendMode; name: string }[] = [
  { id: 'normal', name: 'Normal' },
  { id: 'multiply', name: 'Multiply' },
  { id: 'screen', name: 'Screen' },
  { id: 'overlay', name: 'Overlay' },
  { id: 'darken', name: 'Darken' },
  { id: 'lighten', name: 'Lighten' },
  { id: 'color-dodge', name: 'Color Dodge' },
  { id: 'color-burn', name: 'Color Burn' },
  { id: 'soft-light', name: 'Soft Light' },
  { id: 'hard-light', name: 'Hard Light' },
  { id: 'difference', name: 'Difference' },
  { id: 'exclusion', name: 'Exclusion' },
];

export const LayersPanel: React.FC = () => {
  const {
    persona,
    project,
    setProject,
    selectedLayer,
    setSelectedLayerId,
    addLayer,
    createLayerGroup,
    toggleGroupCollapse,
    addAdjustmentLayer,
    deleteLayer,
    duplicateLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    setLayerOpacity,
    setLayerBlendMode,
    moveLayer,
    mergeLayerDown,
    theme,
    vectorShapes,
    setVectorShapes,
    selectedShapeIds,
    setSelectedShapeIds,
    updateVectorShape,
    publishFrames,
    setPublishFrames,
    selectedFrameIds,
    setSelectedFrameIds,
    updatePublishFrame,
    groupSelectedObjects,
    ungroupSelectedObjects,
    deleteSelectedObjects,
    bringForward,
    sendBackward,
    showShortcutFeedback,
    pushHistoryStep,
  } = useStudio();

  // Search & Type Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'text' | 'shape' | 'image' | 'group'>('all');

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | 'inside'>('below');

  // Inline renaming state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Group expansion state for Vector and Publish groups
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Record<string, boolean>>({});

  const toggleGroupExpanded = (groupId: string) => {
    setCollapsedGroupIds(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const startRenaming = (id: string, currentName: string) => {
    setEditingId(id);
    setEditNameValue(currentName);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const commitRename = (id: string) => {
    if (!editNameValue.trim()) {
      setEditingId(null);
      return;
    }
    const newName = editNameValue.trim();
    if (persona === 'vector') {
      updateVectorShape(id, { name: newName });
    } else if (persona === 'publish') {
      updatePublishFrame(id, { name: newName, title: newName });
    } else {
      setProject(prev => ({
        ...prev,
        layers: prev.layers.map(l => l.id === id ? { ...l, name: newName } : l)
      }));
    }
    setEditingId(null);
    showShortcutFeedback(`Renamed to "${newName}"`);
  };

  // Helper to reorder arrays based on source, target, and position ('above' or 'below' in UI)
  const reorderArray = <T extends { id: string }>(
    items: T[],
    sourceId: string,
    targetId: string,
    position: 'above' | 'below' | 'inside'
  ): T[] => {
    const sourceIdx = items.findIndex(i => i.id === sourceId);
    if (sourceIdx === -1) return items;
    const next = [...items];
    const [moved] = next.splice(sourceIdx, 1);

    let targetIdx = next.findIndex(i => i.id === targetId);
    if (targetIdx === -1) return items;

    // Because UI lists display items in reverse (top of visual stack at the top of the UI list),
    // dropping 'above' in UI means higher in visual stack (after target in original array).
    if (position === 'above') {
      targetIdx += 1;
    }
    next.splice(targetIdx, 0, moved);
    return next;
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string, isGroup: boolean) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedId === targetId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const height = rect.height;

    if (isGroup && offsetY > height * 0.25 && offsetY < height * 0.75) {
      setDropPosition('inside');
    } else if (offsetY < height / 2) {
      setDropPosition('above');
    } else {
      setDropPosition('below');
    }
    setDropTargetId(targetId);
  };

  const handleDragLeave = () => {
    // Avoid rapid flashing
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    if (persona === 'vector') {
      if (dropPosition === 'inside') {
        // Move item into target group
        updateVectorShape(draggedId, { groupId: targetId });
        showShortcutFeedback('Moved Shape into Group');
      } else {
        const targetShape = vectorShapes.find(s => s.id === targetId);
        setVectorShapes(prev => {
          const reordered = reorderArray(prev, draggedId, targetId, dropPosition);
          // If dropped near an item in a group, adopt that group, or if root, clear group
          return reordered.map(s => s.id === draggedId ? { ...s, groupId: targetShape?.groupId } : s);
        });
        pushHistoryStep('Reorder Vector Objects');
        showShortcutFeedback('Reordered Vector Layer');
      }
    } else if (persona === 'publish') {
      if (dropPosition === 'inside') {
        updatePublishFrame(draggedId, { groupId: targetId });
        showShortcutFeedback('Moved Frame into Group');
      } else {
        const targetFrame = publishFrames.find(f => f.id === targetId);
        setPublishFrames(prev => {
          const reordered = reorderArray(prev, draggedId, targetId, dropPosition);
          return reordered.map(f => f.id === draggedId ? { ...f, groupId: targetFrame?.groupId } : f);
        });
        pushHistoryStep('Reorder Publication Frames');
        showShortcutFeedback('Reordered Publication Frame');
      }
    } else {
      // Photo Persona
      if (dropPosition === 'inside') {
        setProject(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === draggedId ? { ...l, groupId: targetId } : l)
        }));
        showShortcutFeedback('Moved Layer into Group Folder');
      } else {
        const targetLayer = project.layers.find(l => l.id === targetId);
        setProject(prev => {
          const reordered = reorderArray(prev.layers, draggedId, targetId, dropPosition);
          return {
            ...prev,
            layers: reordered.map(l => l.id === draggedId ? { ...l, groupId: targetLayer?.groupId } : l)
          };
        });
        pushHistoryStep('Reorder Layer Stack');
        showShortcutFeedback('Reordered Layer Stack');
      }
    }

    setDraggedId(null);
    setDropTargetId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTargetId(null);
  };

  // =========================================================================
  // 1. VECTOR PERSONA HIERARCHICAL LAYERS VIEW
  // =========================================================================
  if (persona === 'vector') {
    // Filter shapes based on search & type
    const filteredShapes = vectorShapes.filter(s => {
      const matchesSearch = !searchQuery || (s.name || s.text || s.type).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'text' && s.type === 'text') ||
        (typeFilter === 'shape' && (s.type === 'rect' || s.type === 'ellipse' || s.type === 'polygon')) ||
        (typeFilter === 'group' && !!s.groupId);
      return matchesSearch && matchesType;
    });

    // Group items hierarchically: find unique groupIds
    const groupMap: Record<string, VectorShape[]> = {};
    const rootShapes: VectorShape[] = [];

    filteredShapes.forEach(s => {
      if (s.groupId) {
        if (!groupMap[s.groupId]) groupMap[s.groupId] = [];
        groupMap[s.groupId].push(s);
      } else {
        rootShapes.push(s);
      }
    });

    // Render shape list top-to-bottom
    const reversedRoots = [...rootShapes].reverse();
    const groupKeys = Object.keys(groupMap);

    const handleShapeClick = (id: string, e: React.MouseEvent) => {
      if (e.shiftKey) {
        setSelectedShapeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
      } else {
        setSelectedShapeIds([id]);
      }
    };

    const handleToggleShapeVisibility = (shape: VectorShape) => {
      const nextVis = shape.visible === false ? true : false;
      updateVectorShape(shape.id, { visible: nextVis });
      showShortcutFeedback(`Shape ${nextVis ? 'Visible' : 'Hidden'}`);
    };

    const handleToggleGroupVisibility = (groupId: string) => {
      const groupMembers = vectorShapes.filter(s => s.groupId === groupId);
      const allVisible = groupMembers.every(s => s.visible !== false);
      const nextVis = !allVisible;
      setVectorShapes(prev => prev.map(s => s.groupId === groupId ? { ...s, visible: nextVis } : s));
      showShortcutFeedback(`Group ${nextVis ? 'Visible' : 'Hidden'}`);
    };

    const handleToggleShapeLock = (shape: VectorShape) => {
      const nextLock = !shape.locked;
      updateVectorShape(shape.id, { locked: nextLock });
      showShortcutFeedback(`Shape ${nextLock ? 'Locked' : 'Unlocked'}`);
    };

    const handleAddVectorLayer = () => {
      const newShape: VectorShape = {
        id: `v-rect-${Date.now()}`,
        name: `Rectangle ${vectorShapes.length + 1}`,
        type: 'rect',
        x: 160 + (vectorShapes.length % 5) * 30,
        y: 160 + (vectorShapes.length % 5) * 30,
        width: 180,
        height: 120,
        fill: '#0d99ff',
        stroke: '#0369a1',
        strokeWidth: 2,
        cornerRadius: 4,
      };
      setVectorShapes(prev => [...prev, newShape]);
      setSelectedShapeIds([newShape.id]);
      pushHistoryStep('Add Vector Shape Layer');
      showShortcutFeedback('Added Vector Shape');
    };

    return (
      <div className="flex flex-col h-full text-xs select-none">
        {/* Search & Filter Header */}
        <div className="p-2 border-b space-y-1.5" style={{ borderColor: theme.border, backgroundColor: theme.bgSubtle }}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>
              Vector Layers & Objects
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded border font-semibold" style={{ borderColor: theme.borderStrong, color: theme.accent }}>
              {vectorShapes.length} objects
            </span>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded border text-xs" style={{ backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.3)', borderColor: theme.borderStrong }}>
              <Search className="w-3.5 h-3.5 opacity-50 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter layers..."
                className="w-full bg-transparent focus:outline-none text-[11px]"
                style={{ color: theme.textPrimary }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-0.5 opacity-60 hover:opacity-100">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="px-1.5 py-1 rounded border text-[10px] font-semibold"
              style={{ backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.3)', borderColor: theme.borderStrong, color: theme.textPrimary }}
            >
              <option value="all">All</option>
              <option value="shape">Shapes</option>
              <option value="text">Text</option>
              <option value="group">Groups</option>
            </select>
          </div>
        </div>

        {/* Hierarchical Layers Tree */}
        <div className="flex-1 overflow-y-auto divide-y scrollbar-thin" style={{ borderColor: theme.border }}>
          {/* Render Groups First */}
          {groupKeys.map(groupId => {
            const members = groupMap[groupId];
            const isCollapsed = !!collapsedGroupIds[groupId];
            const allSelected = members.every(m => selectedShapeIds.includes(m.id));
            const allVisible = members.every(m => m.visible !== false);
            const isDropTarget = dropTargetId === groupId;

            return (
              <div key={groupId} className="border-b" style={{ borderColor: theme.border }}>
                {/* Group Folder Row */}
                <div
                  onDragOver={e => handleDragOver(e, groupId, true)}
                  onDrop={e => handleDrop(e, groupId)}
                  onClick={() => {
                    const ids = members.map(m => m.id);
                    setSelectedShapeIds(ids);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 cursor-pointer transition-colors ${
                    isDropTarget
                      ? 'bg-sky-500/20 ring-2 ring-[#0d99ff]'
                      : allSelected
                      ? theme.isLight ? 'bg-sky-100/90 border-l-4 border-[#0d99ff]' : 'bg-[#0d99ff]/25 border-l-2 border-[#0d99ff]'
                      : theme.isLight ? 'bg-slate-50 hover:bg-slate-100 font-semibold' : 'bg-black/20 hover:bg-white/5 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleGroupExpanded(groupId);
                      }}
                      className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 opacity-70" /> : <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleToggleGroupVisibility(groupId);
                      }}
                      className="p-0.5 rounded"
                      title="Toggle Group Visibility"
                    >
                      {allVisible ? <Eye className="w-3.5 h-3.5 text-sky-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    </button>

                    {isCollapsed ? <Folder className="w-4 h-4 text-amber-500 shrink-0" /> : <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />}

                    <span className="font-bold text-[11px] truncate" style={{ color: theme.textPrimary }}>
                      Group ({members.length})
                    </span>
                  </div>

                  <span className="text-[10px] font-mono opacity-60">Ctrl+Shift+G to ungroup</span>
                </div>

                {/* Group Children (Indented Tree) */}
                {!isCollapsed && (
                  <div className="pl-6 border-l-2 ml-3 divide-y" style={{ borderColor: theme.borderStrong }}>
                    {members.map(shape => {
                      const isSelected = selectedShapeIds.includes(shape.id);
                      const isVisible = shape.visible !== false;
                      const isDragging = draggedId === shape.id;
                      const isTarget = dropTargetId === shape.id;

                      return (
                        <div
                          key={shape.id}
                          draggable={!shape.locked}
                          onDragStart={e => handleDragStart(e, shape.id)}
                          onDragOver={e => handleDragOver(e, shape.id, false)}
                          onDrop={e => handleDrop(e, shape.id)}
                          onDragEnd={handleDragEnd}
                          onClick={e => handleShapeClick(shape.id, e)}
                          className={`flex items-center justify-between px-2 py-1.5 cursor-pointer transition-all ${
                            isDragging ? 'opacity-40 scale-95' : ''
                          } ${
                            isTarget && dropPosition === 'above' ? 'border-t-2 border-[#0d99ff]' : ''
                          } ${
                            isTarget && dropPosition === 'below' ? 'border-b-2 border-[#0d99ff]' : ''
                          } ${
                            isSelected
                              ? theme.isLight ? 'bg-sky-100 border-l-2 border-[#0d99ff]' : 'bg-[#0d99ff]/20 border-l-2 border-[#0d99ff]'
                              : theme.isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                            <GripVertical className="w-3 h-3 opacity-30 group-hover:opacity-100 cursor-grab shrink-0" />

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleToggleShapeVisibility(shape);
                              }}
                              className="p-0.5 rounded"
                            >
                              {isVisible ? <Eye className="w-3 h-3 text-slate-700 dark:text-slate-300" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                            </button>

                            <div
                              className="w-4 h-4 rounded-xs shrink-0 flex items-center justify-center border shadow-2xs"
                              style={{
                                backgroundColor: shape.fill && shape.fill !== 'none' ? shape.fill : '#0d99ff',
                                borderColor: shape.stroke || theme.borderStrong,
                              }}
                            >
                              {shape.type === 'text' ? (
                                <span className="text-[8px] font-bold text-white">T</span>
                              ) : (
                                <Square className="w-2.5 h-2.5 text-white/90" />
                              )}
                            </div>

                            {editingId === shape.id ? (
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editNameValue}
                                onChange={e => setEditNameValue(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') commitRename(shape.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                onBlur={() => commitRename(shape.id)}
                                className="px-1 py-0.5 rounded border text-xs font-semibold w-28 bg-white dark:bg-black/40 text-black dark:text-white"
                              />
                            ) : (
                              <span
                                onDoubleClick={() => startRenaming(shape.id, shape.name || shape.text || `Shape ${shape.type}`)}
                                className="truncate font-medium text-[11px]"
                                style={{ color: theme.textPrimary }}
                                title="Double-click to rename"
                              >
                                {shape.name || (shape.text ? `"${shape.text.slice(0, 12)}"` : `${shape.type} (${Math.round(shape.width)}×${Math.round(shape.height)})`)}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleToggleShapeLock(shape);
                            }}
                            className="p-0.5 opacity-50 hover:opacity-100"
                          >
                            {shape.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3 opacity-30" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Render Root Level Shapes */}
          {reversedRoots.map(shape => {
            const isSelected = selectedShapeIds.includes(shape.id);
            const isVisible = shape.visible !== false;
            const isDragging = draggedId === shape.id;
            const isTarget = dropTargetId === shape.id;

            return (
              <div
                key={shape.id}
                draggable={!shape.locked}
                onDragStart={e => handleDragStart(e, shape.id)}
                onDragOver={e => handleDragOver(e, shape.id, false)}
                onDrop={e => handleDrop(e, shape.id)}
                onDragEnd={handleDragEnd}
                onClick={e => handleShapeClick(shape.id, e)}
                className={`flex items-center justify-between px-2.5 py-2 cursor-pointer transition-all group ${
                  isDragging ? 'opacity-40 scale-95' : ''
                } ${
                  isTarget && dropPosition === 'above' ? 'border-t-2 border-[#0d99ff]' : ''
                } ${
                  isTarget && dropPosition === 'below' ? 'border-b-2 border-[#0d99ff]' : ''
                } ${
                  isSelected
                    ? theme.isLight ? 'bg-sky-100 border-l-4 border-[#0d99ff]' : 'bg-[#0d99ff]/25 border-l-2 border-[#0d99ff]'
                    : theme.isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <GripVertical className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 cursor-grab shrink-0" />

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleShapeVisibility(shape);
                    }}
                    className="p-1 rounded transition-colors"
                    title="Toggle Visibility"
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  <div
                    className="w-5 h-5 rounded-xs shrink-0 flex items-center justify-center border shadow-2xs"
                    style={{
                      backgroundColor: shape.fill && shape.fill !== 'none' ? shape.fill : (theme.isLight ? '#f1f5f9' : '#27272a'),
                      borderColor: shape.stroke && shape.stroke !== 'none' ? shape.stroke : theme.borderStrong,
                    }}
                  >
                    {shape.type === 'text' ? (
                      <span className="text-[10px] font-bold text-white drop-shadow-xs">T</span>
                    ) : shape.type === 'polygon' ? (
                      <Shapes className="w-3 h-3 text-white/90 drop-shadow-xs" />
                    ) : shape.type === 'ellipse' ? (
                      <Circle className="w-3 h-3 text-white/90 drop-shadow-xs" />
                    ) : (
                      <Square className="w-3 h-3 text-white/90 drop-shadow-xs" />
                    )}
                  </div>

                  {editingId === shape.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editNameValue}
                      onChange={e => setEditNameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitRename(shape.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => commitRename(shape.id)}
                      className="px-1.5 py-0.5 rounded border text-xs font-semibold w-32 bg-white dark:bg-black/40 text-black dark:text-white"
                    />
                  ) : (
                    <div className="flex flex-col truncate" onDoubleClick={() => startRenaming(shape.id, shape.name || shape.text || `Vector ${shape.type}`)}>
                      <span className="truncate font-semibold text-[11px]" style={{ color: theme.textPrimary }} title="Double click to rename">
                        {shape.name || (shape.text ? `"${shape.text.slice(0, 16)}"` : `Vector ${shape.type.toUpperCase()}`)}
                      </span>
                      <span className="text-[10px] font-mono opacity-65" style={{ color: theme.textSecondary }}>
                        {shape.type} · {Math.round(shape.width)}×{Math.round(shape.height)}px
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleShapeLock(shape);
                    }}
                    className="p-1 rounded opacity-50 group-hover:opacity-100 transition-opacity"
                  >
                    {shape.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 opacity-30" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vector Layers Footer Action Bar */}
        <div className="p-2 border-t flex items-center justify-between" style={{ borderColor: theme.border, backgroundColor: theme.bgSubtle }}>
          <div className="flex items-center gap-1">
            <button onClick={handleAddVectorLayer} title="New Vector Shape Layer" className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors" style={{ color: theme.textPrimary }}>
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={groupSelectedObjects} disabled={selectedShapeIds.length < 2} title="Group Selected Shapes (Ctrl+G)" className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors" style={{ color: theme.textPrimary }}>
              <Combine className="w-4 h-4" />
            </button>
            <button onClick={ungroupSelectedObjects} title="Ungroup (Ctrl+Shift+G)" className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors" style={{ color: theme.textPrimary }}>
              <FolderPlus className="w-4 h-4" />
            </button>
            <button onClick={bringForward} disabled={selectedShapeIds.length === 0} title="Bring Forward (Ctrl+])" className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors" style={{ color: theme.textPrimary }}>
              <ArrowUp className="w-4 h-4" />
            </button>
            <button onClick={sendBackward} disabled={selectedShapeIds.length === 0} title="Send Backward (Ctrl+[)" className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors" style={{ color: theme.textPrimary }}>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          <button onClick={deleteSelectedObjects} disabled={selectedShapeIds.length === 0} title="Delete Selected Shape (Delete)" className="p-1.5 rounded hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 disabled:opacity-40 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PUBLISH PERSONA HIERARCHICAL LAYERS VIEW
  // =========================================================================
  if (persona === 'publish') {
    const filteredFrames = publishFrames.filter(f => {
      const matchesSearch = !searchQuery || (f.name || f.title || f.content || f.type).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'text' && f.type === 'text') ||
        (typeFilter === 'image' && f.type === 'picture') ||
        (typeFilter === 'shape' && (f.type === 'shape' || f.type === 'rule'));
      return matchesSearch && matchesType;
    });

    const reversedFrames = [...filteredFrames].reverse();

    const handleFrameClick = (id: string, e: React.MouseEvent) => {
      if (e.shiftKey) {
        setSelectedFrameIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
      } else {
        setSelectedFrameIds([id]);
      }
    };

    const handleToggleFrameVisibility = (frame: PublishFrame) => {
      const nextVis = frame.visible === false ? true : false;
      updatePublishFrame(frame.id, { visible: nextVis });
      showShortcutFeedback(`Frame ${nextVis ? 'Visible' : 'Hidden'}`);
    };

    const handleToggleFrameLock = (frame: PublishFrame) => {
      const nextLock = !frame.locked;
      updatePublishFrame(frame.id, { locked: nextLock });
      showShortcutFeedback(`Frame ${nextLock ? 'Locked' : 'Unlocked'}`);
    };

    const handleAddFrame = () => {
      const newFrame: PublishFrame = {
        id: `pub-f-${Date.now()}`,
        name: `Text Frame ${publishFrames.length + 1}`,
        type: 'text',
        x: 80 + (publishFrames.length % 4) * 40,
        y: 120 + (publishFrames.length % 4) * 30,
        width: 320,
        height: 180,
        title: 'New Publication Story',
        content: 'Editorial body paragraph text flows across columns.',
      };
      setPublishFrames(prev => [...prev, newFrame]);
      setSelectedFrameIds([newFrame.id]);
      pushHistoryStep('Add Publication Frame');
      showShortcutFeedback('Added Publication Frame');
    };

    return (
      <div className="flex flex-col h-full text-xs select-none">
        {/* Header with Search */}
        <div className="p-2 border-b space-y-1.5" style={{ borderColor: theme.border, backgroundColor: theme.bgSubtle }}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>
              Publication Document Layers
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded border font-semibold text-pink-500" style={{ borderColor: theme.borderStrong }}>
              {publishFrames.length} frames
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded border text-xs" style={{ backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.3)', borderColor: theme.borderStrong }}>
            <Search className="w-3.5 h-3.5 opacity-50 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search editorial frames..."
              className="w-full bg-transparent focus:outline-none text-[11px]"
              style={{ color: theme.textPrimary }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 opacity-60 hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Frames List with Drag & Drop */}
        <div className="flex-1 overflow-y-auto divide-y scrollbar-thin" style={{ borderColor: theme.border }}>
          {reversedFrames.map(frame => {
            const isSelected = selectedFrameIds.includes(frame.id);
            const isVisible = frame.visible !== false;
            const isDragging = draggedId === frame.id;
            const isTarget = dropTargetId === frame.id;

            return (
              <div
                key={frame.id}
                draggable={!frame.locked}
                onDragStart={e => handleDragStart(e, frame.id)}
                onDragOver={e => handleDragOver(e, frame.id, false)}
                onDrop={e => handleDrop(e, frame.id)}
                onDragEnd={handleDragEnd}
                onClick={e => handleFrameClick(frame.id, e)}
                className={`flex items-center justify-between px-2.5 py-2 cursor-pointer transition-all group ${
                  isDragging ? 'opacity-40 scale-95' : ''
                } ${
                  isTarget && dropPosition === 'above' ? 'border-t-2 border-pink-500' : ''
                } ${
                  isTarget && dropPosition === 'below' ? 'border-b-2 border-pink-500' : ''
                } ${
                  isSelected
                    ? theme.isLight ? 'bg-pink-100/80 border-l-4 border-pink-500' : 'bg-pink-500/25 border-l-2 border-pink-500'
                    : theme.isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <GripVertical className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 cursor-grab shrink-0" />

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleFrameVisibility(frame);
                    }}
                    className="p-1 rounded transition-colors"
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  <div className="w-5 h-5 rounded-xs shrink-0 flex items-center justify-center border bg-slate-100 dark:bg-neutral-800" style={{ borderColor: theme.borderStrong }}>
                    {frame.type === 'picture' ? (
                      <ImageIcon className="w-3 h-3 text-emerald-500" />
                    ) : frame.type === 'rule' ? (
                      <span className="text-[10px] font-mono text-slate-400">—</span>
                    ) : (
                      <Type className="w-3 h-3 text-pink-500" />
                    )}
                  </div>

                  {editingId === frame.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editNameValue}
                      onChange={e => setEditNameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitRename(frame.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => commitRename(frame.id)}
                      className="px-1.5 py-0.5 rounded border text-xs font-semibold w-32 bg-white dark:bg-black/40 text-black dark:text-white"
                    />
                  ) : (
                    <div className="flex flex-col truncate" onDoubleClick={() => startRenaming(frame.id, frame.name || frame.title || `Frame: ${frame.type}`)}>
                      <span className="truncate font-semibold text-[11px]" style={{ color: theme.textPrimary }} title="Double click to rename">
                        {frame.name || frame.title || `Frame: ${frame.type}`}
                      </span>
                      <span className="text-[10px] font-mono opacity-65 truncate" style={{ color: theme.textSecondary }}>
                        {frame.type} · {Math.round(frame.width)}×{Math.round(frame.height)}px
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleToggleFrameLock(frame);
                  }}
                  className="p-1 rounded opacity-50 group-hover:opacity-100 transition-opacity"
                >
                  {frame.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 opacity-30" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Publish Layers Footer Action Bar */}
        <div className="p-2 border-t flex items-center justify-between" style={{ borderColor: theme.border, backgroundColor: theme.bgSubtle }}>
          <div className="flex items-center gap-1">
            <button onClick={handleAddFrame} title="New Frame" className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors" style={{ color: theme.textPrimary }}>
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={groupSelectedObjects} disabled={selectedFrameIds.length < 2} title="Group Frames (Ctrl+G)" className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors" style={{ color: theme.textPrimary }}>
              <Combine className="w-4 h-4" />
            </button>
            <button onClick={bringForward} disabled={selectedFrameIds.length === 0} title="Bring Forward (Ctrl+])" className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors" style={{ color: theme.textPrimary }}>
              <ArrowUp className="w-4 h-4" />
            </button>
            <button onClick={sendBackward} disabled={selectedFrameIds.length === 0} title="Send Backward (Ctrl+[)" className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 transition-colors" style={{ color: theme.textPrimary }}>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          <button onClick={deleteSelectedObjects} disabled={selectedFrameIds.length === 0} title="Delete Selected Frame" className="p-1.5 rounded hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 disabled:opacity-40 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. PHOTO PERSONA HIERARCHICAL LAYERS VIEW (Photoshop CC Style)
  // =========================================================================
  const filteredLayers = project.layers.filter(l => {
    const matchesSearch = !searchQuery || (l.name || l.textContent || l.type).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'text' && l.type === 'text') ||
      (typeFilter === 'group' && l.type === 'group');
    return matchesSearch && matchesType;
  });

  // Group structure mapping
  const groupFolders = filteredLayers.filter(l => l.type === 'group');
  const groupChildrenMap: Record<string, Layer[]> = {};
  const rootLayers: Layer[] = [];

  filteredLayers.forEach(l => {
    if (l.type === 'group') return;
    if (l.groupId) {
      if (!groupChildrenMap[l.groupId]) groupChildrenMap[l.groupId] = [];
      groupChildrenMap[l.groupId].push(l);
    } else {
      rootLayers.push(l);
    }
  });

  // Ordered list of top-level items: groups and root layers
  const topLevelLayers = [...groupFolders, ...rootLayers].sort((a, b) => {
    const idxA = project.layers.findIndex(l => l.id === a.id);
    const idxB = project.layers.findIndex(l => l.id === b.id);
    return idxB - idxA; // Reverse display order (top layer at top of UI list)
  });

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Top Layer Controls: Blend Mode & Opacity */}
      <div className="p-2.5 border-b space-y-2 shrink-0" style={{ borderColor: theme.border, backgroundColor: theme.bgSubtle }}>
        <div className="flex items-center justify-between gap-2">
          {/* Blend Mode */}
          <div className="flex-1">
            <select
              value={selectedLayer?.blendMode || 'normal'}
              onChange={e => {
                if (selectedLayer) setLayerBlendMode(selectedLayer.id, e.target.value as BlendMode);
              }}
              disabled={!selectedLayer || selectedLayer.locked}
              className="w-full rounded px-2 py-1 text-xs font-medium border focus:outline-none focus:border-[#0d99ff] disabled:opacity-50"
              style={{
                backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.4)',
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
              }}
            >
              {BLEND_MODES.map(bm => (
                <option key={bm.id} value={bm.id} className={theme.isLight ? 'bg-white text-slate-900' : 'bg-neutral-900 text-neutral-100'}>
                  {bm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center gap-1.5 w-32">
            <span className="text-[10px] font-semibold" style={{ color: theme.textSecondary }}>Op:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedLayer?.opacity ?? 100}
              onChange={e => {
                if (selectedLayer) setLayerOpacity(selectedLayer.id, parseInt(e.target.value) || 0);
              }}
              disabled={!selectedLayer || selectedLayer.locked}
              className={`w-full accent-[#0d99ff] h-1.5 rounded cursor-pointer disabled:opacity-50 ${theme.isLight ? 'bg-slate-300' : 'bg-black/40'}`}
            />
            <span className="font-mono text-[10px] w-7 text-right tabular-nums font-bold" style={{ color: theme.textPrimary }}>
              {selectedLayer?.opacity ?? 100}%
            </span>
          </div>
        </div>

        {/* Lock & Non-destructive status */}
        <div className="flex items-center justify-between text-[10px] px-0.5">
          <span className={`flex items-center gap-1 font-semibold ${theme.isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Non-destructive Photoshop Stack</span>
          </span>
          {selectedLayer && (
            <button
              onClick={() => toggleLayerLock(selectedLayer.id)}
              className="flex items-center gap-1 font-medium transition-colors"
              style={{ color: theme.textSecondary }}
            >
              {selectedLayer.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3 opacity-60" />}
              <span>{selectedLayer.locked ? 'Locked' : 'Unlocked'}</span>
            </button>
          )}
        </div>

        {/* Layer Search Filter */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs" style={{ backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.3)', borderColor: theme.borderStrong }}>
          <Search className="w-3.5 h-3.5 opacity-50 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search layers..."
            className="w-full bg-transparent focus:outline-none text-[11px]"
            style={{ color: theme.textPrimary }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-0.5 opacity-60 hover:opacity-100">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Layer List Stack with Drag & Drop */}
      <div className="flex-1 overflow-y-auto divide-y scrollbar-thin" style={{ borderColor: theme.border }}>
        {topLevelLayers.map(item => {
          const isGroup = item.type === 'group';
          const isSelected = item.id === project.selectedLayerId;
          const isDragging = draggedId === item.id;
          const isTarget = dropTargetId === item.id;
          const children = isGroup ? (groupChildrenMap[item.id] || []) : [];

          return (
            <div key={item.id} className="border-b" style={{ borderColor: theme.border }}>
              {/* Layer / Group Header Row */}
              <div
                draggable={!item.locked}
                onDragStart={e => handleDragStart(e, item.id)}
                onDragOver={e => handleDragOver(e, item.id, isGroup)}
                onDrop={e => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedLayerId(item.id)}
                className={`flex items-center justify-between px-2.5 py-2 cursor-pointer transition-all group ${
                  isDragging ? 'opacity-40 scale-95' : ''
                } ${
                  isTarget && dropPosition === 'inside'
                    ? 'bg-sky-500/20 ring-2 ring-[#0d99ff]'
                    : isTarget && dropPosition === 'above'
                    ? 'border-t-2 border-[#0d99ff]'
                    : isTarget && dropPosition === 'below'
                    ? 'border-b-2 border-[#0d99ff]'
                    : ''
                } ${
                  isSelected
                    ? theme.isLight ? 'bg-sky-100 border-l-4 border-[#0d99ff]' : 'bg-[#0d99ff]/25 border-l-2 border-[#0d99ff]'
                    : isGroup
                    ? theme.isLight ? 'bg-slate-50 hover:bg-slate-100 font-bold' : 'bg-black/30 hover:bg-white/5 font-semibold'
                    : theme.isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <GripVertical className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 cursor-grab shrink-0" />

                  {/* Group Expand / Collapse OR Visibility */}
                  {isGroup ? (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleGroupCollapse(item.id);
                      }}
                      className="p-0.5"
                      style={{ color: theme.textSecondary }}
                    >
                      {item.collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleLayerVisibility(item.id);
                      }}
                      className="p-1 rounded transition-colors"
                      title="Toggle Visibility"
                    >
                      {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  )}

                  {/* Thumbnail Preview */}
                  <div
                    className="w-6 h-6 rounded shrink-0 flex items-center justify-center overflow-hidden border"
                    style={{
                      backgroundColor: theme.isLight ? '#f1f5f9' : '#27272a',
                      borderColor: theme.borderStrong,
                    }}
                  >
                    {isGroup ? (
                      item.collapsed ? <Folder className="w-3.5 h-3.5 text-amber-500" /> : <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                    ) : item.type === 'adjustment' ? (
                      <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    ) : item.type === 'vector' ? (
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">V</span>
                    ) : item.type === 'text' ? (
                      <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold">T</span>
                    ) : (
                      <Layers className="w-3.5 h-3.5" style={{ color: theme.textSecondary }} />
                    )}
                  </div>

                  {/* Layer Name & Inline Rename */}
                  {editingId === item.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editNameValue}
                      onChange={e => setEditNameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitRename(item.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => commitRename(item.id)}
                      className="px-1.5 py-0.5 rounded border text-xs font-semibold w-32 bg-white dark:bg-black/40 text-black dark:text-white"
                    />
                  ) : (
                    <div
                      className="flex flex-col truncate"
                      onDoubleClick={() => startRenaming(item.id, item.name)}
                    >
                      <span className="truncate font-semibold text-[11px]" style={{ color: theme.textPrimary }} title="Double click to rename">
                        {item.name} {isGroup && `(${children.length})`}
                      </span>
                      <span className="text-[10px] capitalize font-medium opacity-65" style={{ color: theme.textSecondary }}>
                        {item.type} · {item.blendMode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Lock icon */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleLayerLock(item.id);
                  }}
                  className="p-1 rounded opacity-50 group-hover:opacity-100 transition-opacity"
                >
                  {item.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 opacity-30" />}
                </button>
              </div>

              {/* Group Nested Children */}
              {isGroup && !item.collapsed && (
                <div className="pl-6 border-l-2 ml-4 divide-y" style={{ borderColor: theme.borderStrong }}>
                  {children.map(child => {
                    const isChildSelected = child.id === project.selectedLayerId;
                    const isChildDragging = draggedId === child.id;
                    const isChildTarget = dropTargetId === child.id;

                    return (
                      <div
                        key={child.id}
                        draggable={!child.locked}
                        onDragStart={e => handleDragStart(e, child.id)}
                        onDragOver={e => handleDragOver(e, child.id, false)}
                        onDrop={e => handleDrop(e, child.id)}
                        onDragEnd={handleDragEnd}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedLayerId(child.id);
                        }}
                        className={`flex items-center justify-between px-2 py-1.5 cursor-pointer transition-all ${
                          isChildDragging ? 'opacity-40 scale-95' : ''
                        } ${
                          isChildTarget && dropPosition === 'above' ? 'border-t-2 border-[#0d99ff]' : ''
                        } ${
                          isChildTarget && dropPosition === 'below' ? 'border-b-2 border-[#0d99ff]' : ''
                        } ${
                          isChildSelected
                            ? theme.isLight ? 'bg-sky-100 border-l-2 border-[#0d99ff]' : 'bg-[#0d99ff]/20 border-l-2 border-[#0d99ff]'
                            : theme.isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                          <GripVertical className="w-3 h-3 opacity-30 cursor-grab shrink-0" />

                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleLayerVisibility(child.id);
                            }}
                            className="p-0.5 rounded"
                          >
                            {child.visible ? <Eye className="w-3 h-3 text-slate-700 dark:text-slate-300" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                          </button>

                          <div className="w-4 h-4 rounded-xs shrink-0 flex items-center justify-center border bg-slate-100 dark:bg-neutral-800">
                            {child.type === 'text' ? (
                              <span className="text-[8px] font-bold text-pink-500">T</span>
                            ) : (
                              <Layers className="w-2.5 h-2.5 text-slate-400" />
                            )}
                          </div>

                          {editingId === child.id ? (
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editNameValue}
                              onChange={e => setEditNameValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') commitRename(child.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              onBlur={() => commitRename(child.id)}
                              className="px-1.5 py-0.5 rounded border text-xs font-semibold w-28 bg-white dark:bg-black/40 text-black dark:text-white"
                            />
                          ) : (
                            <span
                              onDoubleClick={() => startRenaming(child.id, child.name)}
                              className="truncate font-medium text-[11px]"
                              style={{ color: theme.textPrimary }}
                            >
                              {child.name}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleLayerLock(child.id);
                          }}
                          className="p-0.5 opacity-50 hover:opacity-100"
                        >
                          {child.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3 opacity-30" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Layer Action Bar */}
      <div className="p-2 border-t flex items-center justify-between shrink-0" style={{ borderColor: theme.border, backgroundColor: theme.bgSubtle }}>
        <div className="flex items-center gap-1">
          <button onClick={() => addLayer()} title="Create New Raster Layer (Ctrl+Shift+N)" className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors" style={{ color: theme.textPrimary }}>
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => createLayerGroup()} title="Create New Group Folder (Ctrl+G)" className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors" style={{ color: theme.textPrimary }}>
            <FolderPlus className="w-4 h-4" />
          </button>

          {/* New Adjustment Layer dropdown */}
          <div className="relative group">
            <button title="Add Non-destructive Adjustment Layer" className="p-1 rounded transition-colors" style={{ color: theme.isLight ? '#b45309' : '#fbbf24' }}>
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex flex-col w-48 rounded border shadow-xl py-1 z-30" style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, color: theme.textPrimary }}>
              <button onClick={() => addAdjustmentLayer('curves')} className="text-left px-3 py-1 hover:bg-[#0d99ff] hover:text-white">Curves...</button>
              <button onClick={() => addAdjustmentLayer('hsl')} className="text-left px-3 py-1 hover:bg-[#0d99ff] hover:text-white">Hue / Saturation / Lightness</button>
              <button onClick={() => addAdjustmentLayer('brightness-contrast')} className="text-left px-3 py-1 hover:bg-[#0d99ff] hover:text-white">Brightness & Contrast</button>
              <button onClick={() => addAdjustmentLayer('invert')} className="text-left px-3 py-1 hover:bg-[#0d99ff] hover:text-white">Invert Filter</button>
            </div>
          </div>

          {selectedLayer && (
            <button onClick={() => duplicateLayer(selectedLayer.id)} title="Duplicate Selected Layer (Ctrl+J)" className="p-1 rounded transition-colors" style={{ color: theme.textSecondary }}>
              <Copy className="w-4 h-4" />
            </button>
          )}

          {selectedLayer && project.layers.findIndex(l => l.id === selectedLayer.id) > 0 && (
            <button onClick={() => mergeLayerDown(selectedLayer.id)} title="Merge Down (Ctrl+E)" className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors" style={{ backgroundColor: theme.isLight ? '#ffffff' : 'rgba(0,0,0,0.3)', borderColor: theme.borderStrong, color: theme.textPrimary }}>
              Merge
            </button>
          )}
        </div>

        {selectedLayer && project.layers.length > 1 && (
          <button onClick={() => deleteLayer(selectedLayer.id)} title="Delete Layer (Delete)" className="p-1 rounded hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
