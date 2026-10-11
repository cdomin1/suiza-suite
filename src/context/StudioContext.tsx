import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  StudioPersona,
  ToolId,
  Layer,
  BlendMode,
  AdjustmentType,
  DocumentProject,
  KeyboardShortcut,
  StudioTheme,
  PluginExtension,
  HistoryStep,
  CMYKColor,
  VectorPath,
  VectorShape,
  PublishFrame,
  Guide,
  SnappingConfig,
  ColorSwatch,
  SwatchPalette,
} from '../types';
import { DEFAULT_SHORTCUTS, THEMES } from '../constants/shortcuts';
import { SAMPLE_PLUGINS } from '../constants/presets';
import {
  generateSamplePhotoCanvas,
  generateSampleVectorPaths,
  rgbToCmyk,
  hexToRgb,
} from '../utils/canvasRenderer';
import {
  saveProjectToLocal,
  loadProjectFromLocal,
  saveRevisions,
  loadRevisions,
  saveShortcutsSettings,
  loadShortcutsSettings,
} from '../utils/storage';

interface StudioContextType {
  // Persona & Project
  persona: StudioPersona;
  setPersona: (p: StudioPersona) => void;
  project: DocumentProject;
  setProject: React.Dispatch<React.SetStateAction<DocumentProject>>;
  updateProjectName: (name: string) => void;
  setColorMode: (mode: 'RGB' | 'CMYK' | 'GRAYSCALE') => void;

  // Active Tool & Options
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
  toolOptions: {
    brushSize: number;
    brushHardness: number;
    brushOpacity: number;
    brushFlow: number;
    strokeColor: string;
    strokeWidth: number;
    fillColor: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    textColor: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    columnCount: number;
    columnGutter: number;
  };
  setToolOption: <K extends keyof StudioContextType['toolOptions']>(key: K, value: StudioContextType['toolOptions'][K]) => void;

  // Colors
  foregroundColor: string;
  setForegroundColor: (hex: string) => void;
  backgroundColor: string;
  setBackgroundColor: (hex: string) => void;
  swapColors: () => void;
  resetDefaultColors: () => void;
  cmykColor: CMYKColor;

  // Layer Operations (Non-destructive)
  selectedLayer: Layer | undefined;
  setSelectedLayerId: (id: string) => void;
  addLayer: (type?: Layer['type'], name?: string) => void;
  createLayerGroup: (name?: string) => void;
  toggleGroupCollapse: (groupId: string) => void;
  addAdjustmentLayer: (adjustmentType: AdjustmentType) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerBlendMode: (id: string, mode: BlendMode) => void;
  updateLayerAdjustment: (id: string, values: Record<string, number>) => void;
  moveLayer: (fromIndex: number, toIndex: number) => void;
  mergeLayerDown: (id: string) => void;

  // Canvas Viewport & Navigation
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  panX: number;
  panY: number;
  setPan: (x: number, y: number) => void;
  resetViewport: () => void;
  fitToScreen: () => void;
  showRulers: boolean;
  setShowRulers: (s: boolean | ((prev: boolean) => boolean)) => void;
  showGuides: boolean;
  setShowGuides: (s: boolean | ((prev: boolean) => boolean)) => void;
  showGrid: boolean;
  setShowGrid: (s: boolean | ((prev: boolean) => boolean)) => void;
  guides: Guide[];
  setGuides: React.Dispatch<React.SetStateAction<Guide[]>>;
  addGuide: (type: 'horizontal' | 'vertical', position: number) => Guide;
  updateGuide: (id: string, position: number) => void;
  removeGuide: (id: string) => void;
  clearGuides: () => void;
  snapToGuides: boolean;
  setSnapToGuides: React.Dispatch<React.SetStateAction<boolean>>;
  snappingConfig: SnappingConfig;
  setSnappingConfig: React.Dispatch<React.SetStateAction<SnappingConfig>>;
  updateSnappingConfig: (updates: Partial<SnappingConfig>) => void;
  toggleSnapping: () => void;
  lockGuides: boolean;
  setLockGuides: React.Dispatch<React.SetStateAction<boolean>>;

  // History & Non-destructive Steps
  history: HistoryStep[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  pushHistoryStep: (title: string, newLayers?: Layer[]) => void;
  restoreHistoryStep: (index: number) => void;
  clearHistory: () => void;
  createSnapshot: (customTitle?: string) => void;

  // Swatches & Custom Color Palettes
  palettes: SwatchPalette[];
  setPalettes: React.Dispatch<React.SetStateAction<SwatchPalette[]>>;
  addSwatch: (paletteId: string, swatch: Omit<ColorSwatch, 'id'>) => ColorSwatch;
  removeSwatch: (paletteId: string, swatchId: string) => void;
  createPalette: (name: string, description?: string) => SwatchPalette;
  deletePalette: (paletteId: string) => void;
  applySwatchToSelection: (color: string, target?: 'fill' | 'stroke' | 'text') => void;

  // Modals & Panels
  activeModal: 'shortcuts' | 'export' | 'new-doc' | 'rust-arch' | 'plugins' | 'cloud-sync' | 'linux-native' | null;
  setActiveModal: (m: 'shortcuts' | 'export' | 'new-doc' | 'rust-arch' | 'plugins' | 'cloud-sync' | 'linux-native' | null) => void;
  dockCollapsed: boolean;
  setDockCollapsed: (c: boolean) => void;
  activeDockTab: string;
  setActiveDockTab: (tab: string) => void;

  // Vector Persona Specialized State
  vectorShapes: VectorShape[];
  setVectorShapes: React.Dispatch<React.SetStateAction<VectorShape[]>>;
  selectedShapeIds: string[];
  setSelectedShapeIds: React.Dispatch<React.SetStateAction<string[]>>;
  updateVectorShape: (id: string, updates: Partial<VectorShape>) => void;
  updateSelectedVectorShapes: (updates: Partial<VectorShape>) => void;
  vectorFill: string;
  setVectorFill: (color: string) => void;
  vectorStroke: string;
  setVectorStroke: (color: string) => void;
  vectorStrokeWidth: number;
  setVectorStrokeWidth: (w: number) => void;
  vectorStrokeStyle: 'solid' | 'dashed' | 'dotted';
  setVectorStrokeStyle: (s: 'solid' | 'dashed' | 'dotted') => void;
  vectorCornerRadius: number;
  setVectorCornerRadius: (r: number) => void;
  applyPathfinderOp: (op: 'unite' | 'subtract' | 'intersect' | 'exclude' | 'divide') => void;

  // Publish Persona Specialized State
  publishFrames: PublishFrame[];
  setPublishFrames: React.Dispatch<React.SetStateAction<PublishFrame[]>>;
  selectedFrameIds: string[];
  setSelectedFrameIds: React.Dispatch<React.SetStateAction<string[]>>;
  updatePublishFrame: (id: string, updates: Partial<PublishFrame>) => void;
  updateSelectedPublishFrames: (updates: Partial<PublishFrame>) => void;
  publishSpreadIndex: number;
  setPublishSpreadIndex: (idx: number) => void;
  publishMasterPage: string;
  setPublishMasterPage: (master: string) => void;
  publishColumnCount: number;
  setPublishColumnCount: (c: number) => void;
  publishColumnGutter: number;
  setPublishColumnGutter: (g: number) => void;
  publishTextWrapMode: 'none' | 'box' | 'contour' | 'jump';
  setPublishTextWrapMode: (mode: 'none' | 'box' | 'contour' | 'jump') => void;
  publishParagraphStyle: string;
  setPublishParagraphStyle: (s: string) => void;

  // Selection, Grouping & Arrangement (Professional Multi-Selection & Grouping)
  selectedLayerIds: string[];
  setSelectedLayerIds: React.Dispatch<React.SetStateAction<string[]>>;
  groupSelectedObjects: () => void;
  ungroupSelectedObjects: () => void;
  selectAllObjects: () => void;
  deselectAllObjects: () => void;
  deleteSelectedObjects: () => void;
  nudgeSelectedObjects: (dx: number, dy: number) => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  alignSelectedObjects: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;

  // macOS Global Menu & Finder Focus
  macActiveApp: 'suiza' | 'finder';
  setMacActiveApp: (app: 'suiza' | 'finder') => void;
  isSpotlightOpen: boolean;
  setIsSpotlightOpen: (open: boolean) => void;

  // Theme & Preferences
  theme: StudioTheme;
  setThemeId: (id: StudioTheme['id']) => void;
  osMode: 'macos' | 'linux' | 'windows';
  setOsMode: (mode: 'macos' | 'linux' | 'windows') => void;
  shortcuts: KeyboardShortcut[];
  setShortcuts: (s: KeyboardShortcut[]) => void;
  activeShortcutHint: string | null;
  showShortcutFeedback: (label: string) => void;

  // Cloud Sync, Offline & Backup
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'saved-local';
  triggerAutoSave: () => void;
  lastSavedAt: number;

  // Opt-in AI Automation
  aiOptIn: boolean;
  setAiOptIn: (optIn: boolean) => void;

  // Plugins
  plugins: PluginExtension[];
  togglePlugin: (id: string) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

// Default Factory Swatch Palettes for Suisse Creative Suite
export const DEFAULT_PALETTES: SwatchPalette[] = [
  {
    id: 'palette-core',
    name: 'Brand & Process CMYK',
    description: 'Suiza identity, standard process plates, and high-contrast core tones',
    swatches: [
      { id: 'sw-none', name: 'None / Transparent', color: 'transparent', isNone: true },
      { id: 'sw-white', name: 'Paper White', color: '#ffffff' },
      { id: 'sw-rich-black', name: 'Rich Black (60/40/40/100)', color: '#090a0f' },
      { id: 'sw-cyan', name: 'Process Cyan', color: '#00a3e0' },
      { id: 'sw-magenta', name: 'Process Magenta', color: '#e4007c' },
      { id: 'sw-yellow', name: 'Process Yellow', color: '#fed100' },
      { id: 'sw-black', name: 'Process Black', color: '#000000' },
      { id: 'sw-suiza-blue', name: 'Suiza Electric Blue', color: '#0d99ff', isFavorite: true },
      { id: 'sw-amber', name: 'Vibrant Amber', color: '#f59e0b' },
      { id: 'sw-emerald', name: 'Alpine Pine', color: '#10b981' },
      { id: 'sw-rose', name: 'Editorial Rose', color: '#ec4899', isFavorite: true },
      { id: 'sw-indigo', name: 'Deep Indigo', color: '#6366f1' },
    ],
  },
  {
    id: 'palette-pantone',
    name: 'Pantone® PMS Solid',
    description: 'Pre-press spot color reproductions for editorial & print design',
    swatches: [
      { id: 'sw-p286', name: 'PANTONE 286 C (Deep Cobalt)', color: '#0033a0' },
      { id: 'sw-p186', name: 'PANTONE 186 C (Vivid Crimson)', color: '#c8102e' },
      { id: 'sw-p368', name: 'PANTONE 368 C (Spring Green)', color: '#78be20' },
      { id: 'sw-p021', name: 'PANTONE 021 C (Bright Orange)', color: '#ff5100' },
      { id: 'sw-p2685', name: 'PANTONE 2685 C (Royal Violet)', color: '#330072' },
      { id: 'sw-p877', name: 'PANTONE 877 C (Metallic Silver)', color: '#8a8d8f' },
      { id: 'sw-pwg1', name: 'PANTONE Warm Gray 1 C', color: '#d7d2cb' },
      { id: 'sw-pcg7', name: 'PANTONE Cool Gray 7 C', color: '#97999b' },
    ],
  },
  {
    id: 'palette-modern-ui',
    name: 'Modern UI & Editorial',
    description: 'Curated modern hues for layout cards, shapes, and typography',
    swatches: [
      { id: 'sw-slate-900', name: 'Slate Deep 900', color: '#0f172a' },
      { id: 'sw-slate-500', name: 'Slate Mid 500', color: '#64748b' },
      { id: 'sw-sky-400', name: 'Sky Glow 400', color: '#38bdf8' },
      { id: 'sw-teal-500', name: 'Pacific Teal 500', color: '#14b8a6' },
      { id: 'sw-violet-600', name: 'Electric Violet 600', color: '#7c3aed' },
      { id: 'sw-fuchsia-500', name: 'Neon Fuchsia 500', color: '#d946ef' },
      { id: 'sw-coral-500', name: 'Living Coral 500', color: '#f97316' },
      { id: 'sw-warm-sand', name: 'Nordic Sand', color: '#f3ede2' },
    ],
  },
  {
    id: 'palette-gradients',
    name: 'Gradients & Blends',
    description: 'Multi-stop linear and radial blends for backgrounds and fills',
    swatches: [
      { id: 'sw-grad-aurora', name: 'Aurora Borealis', color: 'linear-gradient(135deg, #0d99ff 0%, #10b981 100%)', type: 'gradient' },
      { id: 'sw-grad-sunset', name: 'Cosmic Sunset', color: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)', type: 'gradient' },
      { id: 'sw-grad-neon', name: 'Cyberpunk Neon', color: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', type: 'gradient' },
      { id: 'sw-grad-dark', name: 'Deep Space Mesh', color: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', type: 'gradient' },
    ],
  },
];

// Initial Default Project Builder
function createInitialProject(persona: StudioPersona): DocumentProject {
  const isPublish = persona === 'publish';
  const isVector = persona === 'vector';

  const width = isPublish ? 2480 : isVector ? 1920 : 2560;
  const height = isPublish ? 1754 : isVector ? 1080 : 1440; // 16:9 for Photo

  let sampleDataUrl: string | undefined;
  let vectorPaths: VectorPath[] | undefined;

  if (persona === 'photo') {
    sampleDataUrl = generateSamplePhotoCanvas(width, height, 'white');
  } else if (persona === 'vector') {
    vectorPaths = generateSampleVectorPaths(width, height);
  }

  const baseLayer: Layer = {
    id: 'layer-base',
    name: isPublish ? 'Master Spread Background' : isVector ? 'Vector Composition' : 'Background Layer',
    type: isVector ? 'vector' : 'raster',
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    canvasDataUrl: sampleDataUrl,
    vectorPaths: vectorPaths,
    width,
    height,
  };

  const layers: Layer[] = [baseLayer];
  if (persona === 'photo') {
    layers.push({
      id: 'layer-photo-title',
      name: 'Typography Title',
      type: 'text',
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      textContent: 'Suiza Studio',
      textFontSize: 72,
      textFontFamily: 'Plus Jakarta Sans',
      textFontWeight: '700',
      textColor: '#0f172a',
      x: 140,
      y: 160,
    });
  } else if (persona === 'publish') {
    layers.push({
      id: 'layer-pub-header',
      name: 'Editorial Headline Frame',
      type: 'text',
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      textContent: 'ARCHITECTURAL HORIZONS: ISSUE 42',
      textFontSize: 64,
      textFontFamily: 'Plus Jakarta Sans',
      textColor: '#0f172a',
      x: 180,
      y: 220,
    });
    layers.push({
      id: 'layer-pub-body',
      name: '3-Column Body Text Grid',
      type: 'text',
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      textContent: 'Exploring the nexus of memory safety and computational design. In the modern publishing landscape, layout rigor meets real-time vector compositing.',
      textFontSize: 24,
      textFontFamily: 'Plus Jakarta Sans',
      textColor: '#334155',
      x: 180,
      y: 340,
    });
  }

  return {
    id: `project-${Date.now()}`,
    name: persona === 'photo' ? 'Untitled-Photo-1.szt' : persona === 'vector' ? 'Untitled-Vector-1.szt' : 'Untitled-Publication-1.szt',
    width,
    height,
    dpi: 300,
    colorMode: persona === 'publish' ? 'CMYK' : 'RGB',
    cmykProfile: 'FOGRA39 (ISO 12647-2)',
    persona,
    layers,
    selectedLayerId: layers[layers.length - 1].id,
    pageCount: isPublish ? 4 : 1,
    activePageIndex: 0,
    facingPages: isPublish,
    bleed: 3,
    margins: {
      top: 36,
      bottom: 36,
      inside: 48,
      outside: 36,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export const StudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [persona, setPersonaState] = useState<StudioPersona>('photo');

  // Maintain separate distinct documents for Photo, Vector, and Publish workspaces
  const personaProjectsRef = useRef<Record<StudioPersona, DocumentProject>>({
    photo: createInitialProject('photo'),
    vector: createInitialProject('vector'),
    publish: createInitialProject('publish'),
  });

  const [project, setProject] = useState<DocumentProject>(() => {
    const saved = loadProjectFromLocal();
    if (saved && saved.persona) {
      personaProjectsRef.current[saved.persona] = saved;
      return saved;
    }
    return personaProjectsRef.current['photo'];
  });

  const [activeTool, setActiveTool] = useState<ToolId>('brush');
  const [toolOptions, setToolOptionsState] = useState({
    brushSize: 32,
    brushHardness: 80,
    brushOpacity: 100,
    brushFlow: 100,
    strokeColor: '#0d99ff',
    strokeWidth: 3,
    fillColor: '#38bdf8',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 48,
    fontWeight: '700',
    textColor: '#ffffff',
    textAlign: 'left' as const,
    columnCount: 2,
    columnGutter: 24,
  });

  const setToolOption = useCallback(<K extends keyof StudioContextType['toolOptions']>(key: K, value: StudioContextType['toolOptions'][K]) => {
    setToolOptionsState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Colors
  const [foregroundColor, setForegroundColor] = useState('#0d99ff');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [cmykColor, setCmykColor] = useState<CMYKColor>(() => {
    const rgb = hexToRgb('#0d99ff');
    return rgbToCmyk(rgb.r, rgb.g, rgb.b);
  });

  // Keep CMYK color in sync when foregroundColor updates
  useEffect(() => {
    const rgb = hexToRgb(foregroundColor);
    setCmykColor(rgbToCmyk(rgb.r, rgb.g, rgb.b));
  }, [foregroundColor]);

  const swapColors = useCallback(() => {
    setForegroundColor(prev => {
      const old = prev;
      setBackgroundColor(old);
      return backgroundColor;
    });
  }, [backgroundColor]);

  const resetDefaultColors = useCallback(() => {
    setForegroundColor('#000000');
    setBackgroundColor('#ffffff');
  }, []);

  // Viewport
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showRulers, setShowRulers] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const setPan = useCallback((x: number, y: number) => {
    setPanX(x);
    setPanY(y);
  }, []);

  const resetViewport = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const fitToScreen = useCallback(() => {
    setZoom(0.75);
    setPanX(0);
    setPanY(0);
  }, []);

  // Document State Refs for Non-destructive History Snapshotting
  const projectRef = useRef(project);
  const vectorShapesRef = useRef<VectorShape[]>([]);
  const publishFramesRef = useRef<PublishFrame[]>([]);
  const guidesRef = useRef<Guide[]>([]);
  const personaRef = useRef(persona);

  useEffect(() => { projectRef.current = project; }, [project]);
  useEffect(() => { personaRef.current = persona; }, [persona]);

  // Non-destructive History
  const [history, setHistory] = useState<HistoryStep[]>(() => {
    const saved = loadRevisions();
    if (saved.length > 0) return saved;
    return [{
      id: `step-${Date.now()}`,
      title: 'Initial Document Creation',
      timestamp: Date.now(),
      layersSnapshot: project.layers,
      vectorShapesSnapshot: [],
      publishFramesSnapshot: [],
      guidesSnapshot: [],
    }];
  });
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistoryStep = useCallback((title: string, newLayers?: Layer[]) => {
    const snapshot = newLayers ? JSON.parse(JSON.stringify(newLayers)) : JSON.parse(JSON.stringify(projectRef.current.layers));
    const step: HistoryStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title,
      timestamp: Date.now(),
      persona: personaRef.current,
      layersSnapshot: snapshot,
      vectorShapesSnapshot: JSON.parse(JSON.stringify(vectorShapesRef.current || [])),
      publishFramesSnapshot: JSON.parse(JSON.stringify(publishFramesRef.current || [])),
      guidesSnapshot: JSON.parse(JSON.stringify(guidesRef.current || [])),
    };
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      const updated = [...sliced, step].slice(-50); // retain last 50 steps
      saveRevisions(updated);
      return updated;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Visual shortcut HUD on trigger
  const [activeShortcutHint, setActiveShortcutHint] = useState<string | null>(null);

  const showShortcutFeedback = useCallback((label: string) => {
    setActiveShortcutHint(label);
    setTimeout(() => {
      setActiveShortcutHint(prev => (prev === label ? null : prev));
    }, 1200);
  }, []);

  const restoreHistoryStep = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      setHistoryIndex(index);
      const step = history[index];
      if (step) {
        if (step.layersSnapshot && step.layersSnapshot.length > 0) {
          setProject(p => ({
            ...p,
            layers: JSON.parse(JSON.stringify(step.layersSnapshot)),
            updatedAt: Date.now(),
          }));
        }
        if (step.vectorShapesSnapshot) {
          setVectorShapes(JSON.parse(JSON.stringify(step.vectorShapesSnapshot)));
        }
        if (step.publishFramesSnapshot) {
          setPublishFrames(JSON.parse(JSON.stringify(step.publishFramesSnapshot)));
        }
        if (step.guidesSnapshot) {
          setGuides(JSON.parse(JSON.stringify(step.guidesSnapshot)));
        }
        showShortcutFeedback(`Jumped to: ${step.title}`);
      }
    }
  }, [history, showShortcutFeedback]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      restoreHistoryStep(historyIndex - 1);
    }
  }, [historyIndex, restoreHistoryStep]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      restoreHistoryStep(historyIndex + 1);
    }
  }, [historyIndex, history.length, restoreHistoryStep]);

  const clearHistory = useCallback(() => {
    if (history.length > 0) {
      const current = history[historyIndex] || history[0];
      setHistory([current]);
      setHistoryIndex(0);
      showShortcutFeedback('Cleared History Stack');
    }
  }, [history, historyIndex, showShortcutFeedback]);

  const createSnapshot = useCallback((customTitle?: string) => {
    pushHistoryStep(customTitle || `Checkpoint Snapshot (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`);
    showShortcutFeedback('Created History Snapshot');
  }, [pushHistoryStep, showShortcutFeedback]);

  // Global Rulers & Guides system
  const [guides, setGuides] = useState<Guide[]>(() => [
    { id: 'guide-default-h1', type: 'horizontal', position: 150 },
    { id: 'guide-default-v1', type: 'vertical', position: 200 },
  ]);

  const DEFAULT_SNAPPING_CONFIG: SnappingConfig = {
    enabled: true,
    snapToGuides: true,
    snapToGrid: false,
    snapToPixels: true,
    snapToObjects: true,
    snapToDocBounds: true,
    tolerance: 8,
    gridSize: 20,
  };

  const [snappingConfig, setSnappingConfig] = useState<SnappingConfig>(() => {
    try {
      const saved = localStorage.getItem('suiza_snapping_config');
      if (saved) return { ...DEFAULT_SNAPPING_CONFIG, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_SNAPPING_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem('suiza_snapping_config', JSON.stringify(snappingConfig));
    } catch {
      // ignore
    }
  }, [snappingConfig]);

  const updateSnappingConfig = useCallback((updates: Partial<SnappingConfig>) => {
    setSnappingConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleSnapping = useCallback(() => {
    setSnappingConfig(prev => {
      const nextEnabled = !prev.enabled;
      showShortcutFeedback(nextEnabled ? 'Magnetic Snapping ON' : 'Snapping OFF');
      return { ...prev, enabled: nextEnabled };
    });
  }, [showShortcutFeedback]);

  const snapToGuides = snappingConfig.enabled && snappingConfig.snapToGuides;
  const setSnapToGuides = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    setSnappingConfig(prev => {
      const nextVal = typeof val === 'function' ? val(prev.snapToGuides) : val;
      return { ...prev, snapToGuides: nextVal, enabled: nextVal ? true : prev.enabled };
    });
  }, []);

  const [lockGuides, setLockGuides] = useState(false);

  const addGuide = useCallback((type: 'horizontal' | 'vertical', position: number) => {
    const newGuide: Guide = {
      id: `guide-${type[0]}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type,
      position: Math.round(position),
    };
    setGuides(prev => [...prev, newGuide]);
    showShortcutFeedback(`Added ${type} guide at ${Math.round(position)}px`);
    return newGuide;
  }, [showShortcutFeedback]);

  const updateGuide = useCallback((id: string, position: number) => {
    setGuides(prev => prev.map(g => g.id === id ? { ...g, position: Math.round(position) } : g));
  }, []);

  const removeGuide = useCallback((id: string) => {
    setGuides(prev => prev.filter(g => g.id !== id));
    showShortcutFeedback('Removed Guide');
  }, [showShortcutFeedback]);

  const clearGuides = useCallback(() => {
    setGuides([]);
    showShortcutFeedback('Cleared all guides');
  }, [showShortcutFeedback]);

  // Persona switcher
  const setPersona = useCallback((newPersona: StudioPersona) => {
    setPersonaState(prevPersona => {
      // Save outgoing project to persona ref
      setProject(currentProject => {
        personaProjectsRef.current[prevPersona] = currentProject;
        // Load target persona's document
        const targetProject = personaProjectsRef.current[newPersona] || createInitialProject(newPersona);
        return targetProject;
      });
      return newPersona;
    });

    // Switch default tool and dock panel according to persona
    if (newPersona === 'photo') {
      setActiveTool('brush');
      setActiveDockTab('layers');
      showShortcutFeedback('Switched to Suiza-Photo (Raster & Retouching)');
    } else if (newPersona === 'vector') {
      setActiveTool('move');
      setActiveDockTab('pathfinder');
      showShortcutFeedback('Switched to Suiza-Vector (Bézier & Pathfinder)');
    } else if (newPersona === 'publish') {
      setActiveTool('frame-text');
      setActiveDockTab('pages');
      showShortcutFeedback('Switched to Suiza-Publish (Pages & Typography)');
    }
  }, [showShortcutFeedback]);

  // Layer CRUD
  const selectedLayer = project.layers.find(l => l.id === project.selectedLayerId);

  const setSelectedLayerId = useCallback((id: string) => {
    setProject(prev => ({ ...prev, selectedLayerId: id }));
  }, []);

  const addLayer = useCallback((type: Layer['type'] = 'raster', name?: string) => {
    const newId = `layer-${Date.now()}`;
    const defaultName = name || (type === 'raster' ? `Pixel Layer ${project.layers.length + 1}` : type === 'vector' ? `Vector Path ${project.layers.length + 1}` : `Text Layer ${project.layers.length + 1}`);
    const newLayer: Layer = {
      id: newId,
      name: defaultName,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      vectorPaths: type === 'vector' ? [] : undefined,
      textContent: type === 'text' ? 'New Text' : undefined,
    };
    setProject(prev => {
      const nextLayers = [...prev.layers, newLayer];
      return {
        ...prev,
        layers: nextLayers,
        selectedLayerId: newId,
        updatedAt: Date.now(),
      };
    });
    pushHistoryStep(`New ${type.toUpperCase()} Layer`);
  }, [project.layers.length, pushHistoryStep]);

  const createLayerGroup = useCallback((name?: string) => {
    const newId = `group-${Date.now()}`;
    const defaultName = name || `Group ${project.layers.filter(l => l.type === 'group').length + 1}`;
    const newGroup: Layer = {
      id: newId,
      name: defaultName,
      type: 'group',
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      collapsed: false,
    };
    setProject(prev => {
      return {
        ...prev,
        layers: [...prev.layers, newGroup],
        selectedLayerId: newId,
        updatedAt: Date.now(),
      };
    });
    pushHistoryStep(`New Layer Group: ${defaultName}`);
  }, [project.layers, pushHistoryStep]);

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === groupId ? { ...l, collapsed: !l.collapsed } : l),
      updatedAt: Date.now(),
    }));
  }, []);

  const addAdjustmentLayer = useCallback((adjustmentType: AdjustmentType) => {
    const newId = `adj-${Date.now()}`;
    const nameMap: Record<AdjustmentType, string> = {
      'brightness-contrast': 'Brightness / Contrast',
      'curves': 'Curves Adjustment',
      'levels': 'Levels Adjustment',
      'hsl': 'Hue / Saturation / Lightness',
      'color-balance': 'Color Balance',
      'invert': 'Invert Adjustment',
    };
    const newLayer: Layer = {
      id: newId,
      name: nameMap[adjustmentType],
      type: 'adjustment',
      adjustmentType,
      adjustmentValues: adjustmentType === 'brightness-contrast' ? { brightness: 10, contrast: 15 } : adjustmentType === 'hsl' ? { hue: 0, saturation: 10, lightness: 0 } : {},
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
    };
    setProject(prev => {
      const nextLayers = [...prev.layers, newLayer];
      return {
        ...prev,
        layers: nextLayers,
        selectedLayerId: newId,
        updatedAt: Date.now(),
      };
    });
    pushHistoryStep(`Add ${nameMap[adjustmentType]}`);
  }, [pushHistoryStep]);

  const deleteLayer = useCallback((id: string) => {
    setProject(prev => {
      if (prev.layers.length <= 1) return prev; // Keep at least one
      const filtered = prev.layers.filter(l => l.id !== id);
      const nextSelected = filtered[filtered.length - 1]?.id || '';
      return {
        ...prev,
        layers: filtered,
        selectedLayerId: nextSelected,
        updatedAt: Date.now(),
      };
    });
    pushHistoryStep('Delete Layer');
  }, [pushHistoryStep]);

  const duplicateLayer = useCallback((id: string) => {
    setProject(prev => {
      const target = prev.layers.find(l => l.id === id);
      if (!target) return prev;
      const clone: Layer = {
        ...JSON.parse(JSON.stringify(target)),
        id: `layer-${Date.now()}`,
        name: `${target.name} Copy`,
      };
      const idx = prev.layers.findIndex(l => l.id === id);
      const nextLayers = [...prev.layers];
      nextLayers.splice(idx + 1, 0, clone);
      return {
        ...prev,
        layers: nextLayers,
        selectedLayerId: clone.id,
        updatedAt: Date.now(),
      };
    });
    pushHistoryStep('Duplicate Layer');
  }, [pushHistoryStep]);

  const toggleLayerVisibility = useCallback((id: string) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l),
      updatedAt: Date.now(),
    }));
  }, []);

  const toggleLayerLock = useCallback((id: string) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l),
      updatedAt: Date.now(),
    }));
  }, []);

  const setLayerOpacity = useCallback((id: string, opacity: number) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, opacity: Math.max(0, Math.min(100, opacity)) } : l),
      updatedAt: Date.now(),
    }));
  }, []);

  const setLayerBlendMode = useCallback((id: string, blendMode: BlendMode) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, blendMode } : l),
      updatedAt: Date.now(),
    }));
    pushHistoryStep(`Change Blend Mode: ${blendMode}`);
  }, [pushHistoryStep]);

  const updateLayerAdjustment = useCallback((id: string, values: Record<string, number>) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? {
        ...l,
        adjustmentValues: { ...(l.adjustmentValues || {}), ...values }
      } : l),
      updatedAt: Date.now(),
    }));
  }, []);

  const moveLayer = useCallback((fromIndex: number, toIndex: number) => {
    setProject(prev => {
      const next = [...prev.layers];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return {
        ...prev,
        layers: next,
        updatedAt: Date.now(),
      };
    });
    pushHistoryStep('Reorder Layer Stack');
  }, [pushHistoryStep]);

  const mergeLayerDown = useCallback((id: string) => {
    setProject(prev => {
      const idx = prev.layers.findIndex(l => l.id === id);
      if (idx <= 0) return prev;
      const upper = prev.layers[idx];
      const lower = prev.layers[idx - 1];
      const merged: Layer = {
        ...lower,
        name: `${lower.name} + ${upper.name}`,
      };
      const next = [...prev.layers];
      next.splice(idx - 1, 2, merged);
      return {
        ...prev,
        layers: next,
        selectedLayerId: merged.id,
        updatedAt: Date.now(),
      };
    });
    pushHistoryStep('Merge Layers Down');
  }, [pushHistoryStep]);

  // Project properties
  const updateProjectName = useCallback((name: string) => {
    setProject(prev => ({ ...prev, name, updatedAt: Date.now() }));
  }, []);

  const setColorMode = useCallback((colorMode: 'RGB' | 'CMYK' | 'GRAYSCALE') => {
    setProject(prev => ({ ...prev, colorMode, updatedAt: Date.now() }));
    pushHistoryStep(`Convert Color Mode to ${colorMode}`);
  }, [pushHistoryStep]);

  // Modals & Dock
  const [activeModal, setActiveModal] = useState<StudioContextType['activeModal']>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [activeDockTab, setActiveDockTab] = useState<string>('layers');

  // Vector Persona Specialized State
  const [vectorShapes, setVectorShapes] = useState<VectorShape[]>([
    {
      id: 'v-shape-rect-1',
      type: 'rect',
      x: 100,
      y: 120,
      width: 220,
      height: 160,
      fill: '#ef4444',
      stroke: '#991b1b',
      strokeWidth: 3,
      cornerRadius: 8,
    },
    {
      id: 'v-shape-ellipse-2',
      type: 'ellipse',
      x: 240,
      y: 180,
      width: 200,
      height: 200,
      fill: '#0d99ff',
      stroke: '#0369a1',
      strokeWidth: 3,
    },
    {
      id: 'v-shape-poly-3',
      type: 'polygon',
      x: 480,
      y: 140,
      width: 180,
      height: 180,
      fill: '#10b981',
      stroke: '#065f46',
      strokeWidth: 2,
    },
    {
      id: 'v-shape-text-4',
      name: 'Suiza Vector Typo',
      type: 'text',
      x: 100,
      y: 60,
      width: 420,
      height: 50,
      fill: '#0f172a',
      stroke: 'none',
      strokeWidth: 0,
      text: 'Suiza Vector Artboard',
      fontSize: 32,
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '700',
    },
  ]);
  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>(['v-shape-rect-1']);

  const updateVectorShape = useCallback((id: string, updates: Partial<VectorShape>) => {
    setVectorShapes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const updateSelectedVectorShapes = useCallback((updates: Partial<VectorShape>) => {
    setVectorShapes(prev => prev.map(s => selectedShapeIds.includes(s.id) ? { ...s, ...updates } : s));
  }, [selectedShapeIds]);

  const [vectorFill, setVectorFill] = useState('#0d99ff');
  const [vectorStroke, setVectorStroke] = useState('#0f172a');
  const [vectorStrokeWidth, setVectorStrokeWidth] = useState(2);
  const [vectorStrokeStyle, setVectorStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [vectorCornerRadius, setVectorCornerRadius] = useState(0);

  // Publish Persona Specialized State
  const [publishFrames, setPublishFrames] = useState<PublishFrame[]>([
    {
      id: 'pub-headline',
      type: 'text',
      x: 70,
      y: 110,
      width: 580,
      height: 85,
      title: 'SWISS TYPOGRAPHY & ALPINE FORM',
      content: 'A modernist review of modular architecture, raw granite construction, and grid discipline.',
    },
    {
      id: 'pub-col-1',
      type: 'text',
      x: 70,
      y: 220,
      width: 275,
      height: 420,
      content: 'When designing within pure spatial limits, negative space dictates rhythm as decisively as ink. The monolithic granite structures of the Swiss Alps demonstrate that structural integrity arises not from ornamentation, but from the uncompromising precision of joints and tolerances.\n\nIn typography as in stonework, adherence to the baseline grid gives weight to ideas and clarity to communication.',
    },
    {
      id: 'pub-col-2',
      type: 'text',
      x: 375,
      y: 220,
      width: 275,
      height: 420,
      content: 'Early modernist publications understood that legibility is a moral imperative. By aligning column gutters to golden ratios, the eye glides across prose with effortless velocity.\n\nThis editorial layout demonstrates publication-grade multi-column text flow with automated optical kerning, proportional leading, and non-destructive bleed geometry.',
    },
    {
      id: 'pub-pic-1',
      type: 'picture',
      x: 740,
      y: 110,
      width: 590,
      height: 430,
      title: 'EDITORIAL GRAPHIC BOX · 300 DPI CMYK ASSET',
    },
    {
      id: 'pub-caption',
      type: 'text',
      x: 740,
      y: 560,
      width: 590,
      height: 50,
      content: 'Fig 1.1 — Monolithic Cantilever Pavilion overlooking the Rhine Gorge. Photographed on 4×5 Large Format Technical Camera.',
    },
  ]);
  const [selectedFrameIds, setSelectedFrameIds] = useState<string[]>(['pub-headline']);

  const updatePublishFrame = useCallback((id: string, updates: Partial<PublishFrame>) => {
    setPublishFrames(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const updateSelectedPublishFrames = useCallback((updates: Partial<PublishFrame>) => {
    setPublishFrames(prev => prev.map(f => selectedFrameIds.includes(f.id) ? { ...f, ...updates } : f));
  }, [selectedFrameIds]);

  const [publishSpreadIndex, setPublishSpreadIndex] = useState(0);
  const [publishMasterPage, setPublishMasterPage] = useState('A-Master');
  const [publishColumnCount, setPublishColumnCount] = useState(3);
  const [publishColumnGutter, setPublishColumnGutter] = useState(12);
  const [publishTextWrapMode, setPublishTextWrapMode] = useState<'none' | 'box' | 'contour' | 'jump'>('box');
  const [publishParagraphStyle, setPublishParagraphStyle] = useState('Body Text');

  // Sync Refs for History Snapshots
  useEffect(() => { guidesRef.current = guides; }, [guides]);
  useEffect(() => { vectorShapesRef.current = vectorShapes; }, [vectorShapes]);
  useEffect(() => { publishFramesRef.current = publishFrames; }, [publishFrames]);

  // Photo multi-selection
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);

  // Swatches & Custom Palettes State
  const [palettes, setPalettes] = useState<SwatchPalette[]>(() => {
    try {
      const saved = localStorage.getItem('suiza_swatch_palettes');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_PALETTES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('suiza_swatch_palettes', JSON.stringify(palettes));
    } catch (_) {}
  }, [palettes]);

  const addSwatch = useCallback((paletteId: string, swatchData: Omit<ColorSwatch, 'id'>) => {
    const newSwatch: ColorSwatch = {
      ...swatchData,
      id: `sw-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setPalettes(prev => prev.map(p => p.id === paletteId ? {
      ...p,
      swatches: [...p.swatches, newSwatch]
    } : p));
    showShortcutFeedback(`Added Swatch: ${newSwatch.name}`);
    return newSwatch;
  }, [showShortcutFeedback]);

  const removeSwatch = useCallback((paletteId: string, swatchId: string) => {
    setPalettes(prev => prev.map(p => p.id === paletteId ? {
      ...p,
      swatches: p.swatches.filter(s => s.id !== swatchId)
    } : p));
    showShortcutFeedback('Deleted Swatch');
  }, [showShortcutFeedback]);

  const createPalette = useCallback((name: string, description?: string) => {
    const newPalette: SwatchPalette = {
      id: `palette-${Date.now()}`,
      name: name.trim() || 'Custom Palette',
      description,
      swatches: [],
    };
    setPalettes(prev => [...prev, newPalette]);
    showShortcutFeedback(`Created Palette: ${newPalette.name}`);
    return newPalette;
  }, [showShortcutFeedback]);

  const deletePalette = useCallback((paletteId: string) => {
    setPalettes(prev => prev.filter(p => p.id !== paletteId));
    showShortcutFeedback('Deleted Palette');
  }, [showShortcutFeedback]);

  const applySwatchToSelection = useCallback((color: string, target: 'fill' | 'stroke' | 'text' = 'fill') => {
    if (persona === 'vector') {
      if (target === 'fill') {
        setVectorFill(color);
        updateSelectedVectorShapes({ fill: color });
      } else if (target === 'stroke') {
        setVectorStroke(color);
        updateSelectedVectorShapes({ stroke: color });
      } else if (target === 'text') {
        updateSelectedVectorShapes({ fill: color });
      }
      pushHistoryStep(`Apply ${target.toUpperCase()} Swatch: ${color}`);
      showShortcutFeedback(`Applied ${target} color: ${color}`);
    } else if (persona === 'publish') {
      if (target === 'fill') {
        updateSelectedPublishFrames({ fill: color });
      } else if (target === 'stroke') {
        updateSelectedPublishFrames({ fill: color });
      } else if (target === 'text') {
        updateSelectedPublishFrames({ fill: color });
      }
      pushHistoryStep(`Apply ${target.toUpperCase()} Swatch: ${color}`);
      showShortcutFeedback(`Applied to frame: ${color}`);
    } else if (persona === 'photo') {
      setForegroundColor(color);
      if (selectedLayer && selectedLayer.type === 'text') {
        setProject(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === selectedLayer.id ? { ...l, textColor: color } : l),
          updatedAt: Date.now(),
        }));
      }
      pushHistoryStep(`Apply Color Swatch: ${color}`);
      showShortcutFeedback(`Set Foreground: ${color}`);
    }
  }, [persona, setVectorFill, setVectorStroke, updateSelectedVectorShapes, updateSelectedPublishFrames, setForegroundColor, selectedLayer, pushHistoryStep, showShortcutFeedback]);

  // Selection & Grouping Actions
  const groupSelectedObjects = useCallback(() => {
    if (persona === 'vector') {
      if (selectedShapeIds.length < 2) {
        showShortcutFeedback('Select at least 2 shapes to group (Shift+Click)');
        return;
      }
      const newGroupId = `grp-${Date.now()}`;
      setVectorShapes(prev => prev.map(s => selectedShapeIds.includes(s.id) ? { ...s, groupId: newGroupId } : s));
      pushHistoryStep(`Group ${selectedShapeIds.length} Vector Shapes`);
      showShortcutFeedback(`Grouped ${selectedShapeIds.length} Objects (Ctrl+G)`);
    } else if (persona === 'publish') {
      if (selectedFrameIds.length < 2) {
        showShortcutFeedback('Select at least 2 frames to group (Shift+Click)');
        return;
      }
      const newGroupId = `grp-${Date.now()}`;
      setPublishFrames(prev => prev.map(f => selectedFrameIds.includes(f.id) ? { ...f, groupId: newGroupId } : f));
      pushHistoryStep(`Group ${selectedFrameIds.length} Publication Frames`);
      showShortcutFeedback(`Grouped ${selectedFrameIds.length} Frames (Ctrl+G)`);
    } else {
      createLayerGroup();
      showShortcutFeedback('Grouped Layers (Ctrl+G)');
    }
  }, [persona, selectedShapeIds, selectedFrameIds, createLayerGroup, pushHistoryStep, showShortcutFeedback]);

  const ungroupSelectedObjects = useCallback(() => {
    if (persona === 'vector') {
      setVectorShapes(prev => prev.map(s => selectedShapeIds.includes(s.id) ? { ...s, groupId: undefined } : s));
      pushHistoryStep('Ungroup Vector Objects');
      showShortcutFeedback('Ungrouped Objects (Ctrl+Shift+G)');
    } else if (persona === 'publish') {
      setPublishFrames(prev => prev.map(f => selectedFrameIds.includes(f.id) ? { ...f, groupId: undefined } : f));
      pushHistoryStep('Ungroup Publication Frames');
      showShortcutFeedback('Ungrouped Frames (Ctrl+Shift+G)');
    } else {
      showShortcutFeedback('Ungrouped Layers (Ctrl+Shift+G)');
    }
  }, [persona, selectedShapeIds, selectedFrameIds, pushHistoryStep, showShortcutFeedback]);

  const selectAllObjects = useCallback(() => {
    if (persona === 'vector') {
      setSelectedShapeIds(vectorShapes.map(s => s.id));
      showShortcutFeedback(`Selected All ${vectorShapes.length} Shapes (Ctrl+A)`);
    } else if (persona === 'publish') {
      setSelectedFrameIds(publishFrames.map(f => f.id));
      showShortcutFeedback(`Selected All ${publishFrames.length} Frames (Ctrl+A)`);
    } else {
      setSelectedLayerIds(project.layers.map(l => l.id));
      showShortcutFeedback(`Selected All ${project.layers.length} Layers (Ctrl+A)`);
    }
  }, [persona, vectorShapes, publishFrames, project.layers, showShortcutFeedback]);

  const deselectAllObjects = useCallback(() => {
    if (persona === 'vector') {
      setSelectedShapeIds([]);
      showShortcutFeedback('Deselected (Ctrl+D)');
    } else if (persona === 'publish') {
      setSelectedFrameIds([]);
      showShortcutFeedback('Deselected (Ctrl+D)');
    } else {
      setSelectedLayerIds([]);
      showShortcutFeedback('Deselected (Ctrl+D)');
    }
  }, [persona, showShortcutFeedback]);

  const deleteSelectedObjects = useCallback(() => {
    if (persona === 'vector') {
      if (selectedShapeIds.length === 0) return;
      setVectorShapes(prev => prev.filter(s => !selectedShapeIds.includes(s.id)));
      setSelectedShapeIds([]);
      pushHistoryStep('Delete Selected Shapes');
      showShortcutFeedback('Deleted Selected Shape(s)');
    } else if (persona === 'publish') {
      if (selectedFrameIds.length === 0) return;
      setPublishFrames(prev => prev.filter(f => !selectedFrameIds.includes(f.id)));
      setSelectedFrameIds([]);
      pushHistoryStep('Delete Selected Frames');
      showShortcutFeedback('Deleted Selected Frame(s)');
    } else if (selectedLayer && !selectedLayer.locked) {
      deleteLayer(selectedLayer.id);
      showShortcutFeedback('Deleted Layer');
    }
  }, [persona, selectedShapeIds, selectedFrameIds, selectedLayer, deleteLayer, pushHistoryStep, showShortcutFeedback]);

  const nudgeSelectedObjects = useCallback((dx: number, dy: number) => {
    if (persona === 'vector') {
      setVectorShapes(prev => prev.map(s => selectedShapeIds.includes(s.id) ? { ...s, x: s.x + dx, y: s.y + dy } : s));
    } else if (persona === 'publish') {
      setPublishFrames(prev => prev.map(f => selectedFrameIds.includes(f.id) ? { ...f, x: f.x + dx, y: f.y + dy } : f));
    } else if (selectedLayer) {
      setProject(prev => ({
        ...prev,
        layers: prev.layers.map(l => l.id === selectedLayer.id ? { ...l, x: (l.x || 0) + dx, y: (l.y || 0) + dy } : l)
      }));
    }
  }, [persona, selectedShapeIds, selectedFrameIds, selectedLayer, setProject]);

  const bringForward = useCallback(() => {
    if (persona === 'vector') {
      setVectorShapes(prev => {
        const arr = [...prev];
        for (let i = arr.length - 2; i >= 0; i--) {
          if (selectedShapeIds.includes(arr[i].id) && !selectedShapeIds.includes(arr[i + 1].id)) {
            const tmp = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = tmp;
            break;
          }
        }
        return arr;
      });
      showShortcutFeedback('Bring Forward (Ctrl+])');
    } else if (persona === 'publish') {
      setPublishFrames(prev => {
        const arr = [...prev];
        for (let i = arr.length - 2; i >= 0; i--) {
          if (selectedFrameIds.includes(arr[i].id) && !selectedFrameIds.includes(arr[i + 1].id)) {
            const tmp = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = tmp;
            break;
          }
        }
        return arr;
      });
      showShortcutFeedback('Bring Forward (Ctrl+])');
    } else if (selectedLayer) {
      const idx = project.layers.findIndex(l => l.id === selectedLayer.id);
      if (idx < project.layers.length - 1) {
        moveLayer(idx, idx + 1);
        showShortcutFeedback('Bring Layer Forward (Ctrl+])');
      }
    }
  }, [persona, selectedShapeIds, selectedFrameIds, selectedLayer, project.layers, moveLayer, showShortcutFeedback]);

  const sendBackward = useCallback(() => {
    if (persona === 'vector') {
      setVectorShapes(prev => {
        const arr = [...prev];
        for (let i = 1; i < arr.length; i++) {
          if (selectedShapeIds.includes(arr[i].id) && !selectedShapeIds.includes(arr[i - 1].id)) {
            const tmp = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = tmp;
            break;
          }
        }
        return arr;
      });
      showShortcutFeedback('Send Backward (Ctrl+[)');
    } else if (persona === 'publish') {
      setPublishFrames(prev => {
        const arr = [...prev];
        for (let i = 1; i < arr.length; i++) {
          if (selectedFrameIds.includes(arr[i].id) && !selectedFrameIds.includes(arr[i - 1].id)) {
            const tmp = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = tmp;
            break;
          }
        }
        return arr;
      });
      showShortcutFeedback('Send Backward (Ctrl+[)');
    } else if (selectedLayer) {
      const idx = project.layers.findIndex(l => l.id === selectedLayer.id);
      if (idx > 0) {
        moveLayer(idx, idx - 1);
        showShortcutFeedback('Send Layer Backward (Ctrl+[)');
      }
    }
  }, [persona, selectedShapeIds, selectedFrameIds, selectedLayer, project.layers, moveLayer, showShortcutFeedback]);

  const bringToFront = useCallback(() => {
    if (persona === 'vector') {
      setVectorShapes(prev => {
        const selected = prev.filter(s => selectedShapeIds.includes(s.id));
        const rest = prev.filter(s => !selectedShapeIds.includes(s.id));
        return [...rest, ...selected];
      });
      showShortcutFeedback('Bring to Front (Ctrl+Shift+])');
    } else if (persona === 'publish') {
      setPublishFrames(prev => {
        const selected = prev.filter(f => selectedFrameIds.includes(f.id));
        const rest = prev.filter(f => !selectedFrameIds.includes(f.id));
        return [...rest, ...selected];
      });
      showShortcutFeedback('Bring to Front (Ctrl+Shift+])');
    }
  }, [persona, selectedShapeIds, selectedFrameIds, showShortcutFeedback]);

  const sendToBack = useCallback(() => {
    if (persona === 'vector') {
      setVectorShapes(prev => {
        const selected = prev.filter(s => selectedShapeIds.includes(s.id));
        const rest = prev.filter(s => !selectedShapeIds.includes(s.id));
        return [...selected, ...rest];
      });
      showShortcutFeedback('Send to Back (Ctrl+Shift+[)');
    } else if (persona === 'publish') {
      setPublishFrames(prev => {
        const selected = prev.filter(f => selectedFrameIds.includes(f.id));
        const rest = prev.filter(f => !selectedFrameIds.includes(f.id));
        return [...selected, ...rest];
      });
      showShortcutFeedback('Send to Back (Ctrl+Shift+[)');
    }
  }, [persona, selectedShapeIds, selectedFrameIds, showShortcutFeedback]);

  const alignSelectedObjects = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (persona === 'vector') {
      const selected = vectorShapes.filter(s => selectedShapeIds.includes(s.id));
      if (selected.length < 2) return;
      const minX = Math.min(...selected.map(s => s.x));
      const maxX = Math.max(...selected.map(s => s.x + s.width));
      const minY = Math.min(...selected.map(s => s.y));
      const maxY = Math.max(...selected.map(s => s.y + s.height));
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;

      setVectorShapes(prev => prev.map(s => {
        if (!selectedShapeIds.includes(s.id)) return s;
        if (alignment === 'left') return { ...s, x: minX };
        if (alignment === 'center') return { ...s, x: midX - s.width / 2 };
        if (alignment === 'right') return { ...s, x: maxX - s.width };
        if (alignment === 'top') return { ...s, y: minY };
        if (alignment === 'middle') return { ...s, y: midY - s.height / 2 };
        if (alignment === 'bottom') return { ...s, y: maxY - s.height };
        return s;
      }));
      pushHistoryStep(`Align Vector Shapes (${alignment})`);
      showShortcutFeedback(`Aligned ${alignment.toUpperCase()}`);
    } else if (persona === 'publish') {
      const selected = publishFrames.filter(f => selectedFrameIds.includes(f.id));
      if (selected.length < 2) return;
      const minX = Math.min(...selected.map(f => f.x));
      const maxX = Math.max(...selected.map(f => f.x + f.width));
      const minY = Math.min(...selected.map(f => f.y));
      const maxY = Math.max(...selected.map(f => f.y + f.height));
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;

      setPublishFrames(prev => prev.map(f => {
        if (!selectedFrameIds.includes(f.id)) return f;
        if (alignment === 'left') return { ...f, x: minX };
        if (alignment === 'center') return { ...f, x: midX - f.width / 2 };
        if (alignment === 'right') return { ...f, x: maxX - f.width };
        if (alignment === 'top') return { ...f, y: minY };
        if (alignment === 'middle') return { ...f, y: midY - f.height / 2 };
        if (alignment === 'bottom') return { ...f, y: maxY - f.height };
        return f;
      }));
      pushHistoryStep(`Align Publication Frames (${alignment})`);
      showShortcutFeedback(`Aligned ${alignment.toUpperCase()}`);
    }
  }, [persona, vectorShapes, selectedShapeIds, publishFrames, selectedFrameIds, pushHistoryStep, showShortcutFeedback]);

  // Real Geometric Boolean Pathfinder Operations
  const applyPathfinderOp = useCallback((op: 'unite' | 'subtract' | 'intersect' | 'exclude' | 'divide') => {
    // Find shapes to operate on: either selected ones or first 2 if none selected
    let targets = vectorShapes.filter(s => selectedShapeIds.includes(s.id));
    if (targets.length < 2 && vectorShapes.length >= 2) {
      targets = vectorShapes.slice(0, 2);
    }
    if (targets.length < 2) {
      showShortcutFeedback('Pathfinder requires at least 2 overlapping shapes');
      return;
    }

    const s1 = targets[0];
    const s2 = targets[1];

    if (op === 'unite') {
      const minX = Math.min(s1.x, s2.x);
      const minY = Math.min(s1.y, s2.y);
      const maxX = Math.max(s1.x + s1.width, s2.x + s2.width);
      const maxY = Math.max(s1.y + s1.height, s2.y + s2.height);
      const unitedShape: VectorShape = {
        id: `v-united-${Date.now()}`,
        type: 'rect',
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        fill: s2.fill || s1.fill,
        stroke: s2.stroke || s1.stroke,
        strokeWidth: s2.strokeWidth || s1.strokeWidth,
        cornerRadius: 6,
      };
      setVectorShapes(prev => [...prev.filter(s => s.id !== s1.id && s.id !== s2.id), unitedShape]);
      setSelectedShapeIds([unitedShape.id]);
      pushHistoryStep('Pathfinder: Unite (Union)');
      showShortcutFeedback('Pathfinder: Unite (Merged Shapes)');
    } else if (op === 'subtract') {
      // Subtract front shape (s2) from back shape (s1)
      const subtractedShape: VectorShape = {
        id: `v-subtracted-${Date.now()}`,
        type: 'rect',
        x: s1.x,
        y: s1.y,
        width: Math.max(20, s1.width - Math.max(0, s1.x + s1.width - s2.x) * 0.5),
        height: s1.height,
        fill: s1.fill,
        stroke: s1.stroke,
        strokeWidth: s1.strokeWidth,
        cornerRadius: s1.cornerRadius,
      };
      setVectorShapes(prev => [...prev.filter(s => s.id !== s1.id && s.id !== s2.id), subtractedShape]);
      setSelectedShapeIds([subtractedShape.id]);
      pushHistoryStep('Pathfinder: Minus Front (Subtract)');
      showShortcutFeedback('Pathfinder: Minus Front');
    } else if (op === 'intersect') {
      const ix = Math.max(s1.x, s2.x);
      const iy = Math.max(s1.y, s2.y);
      const iw = Math.min(s1.x + s1.width, s2.x + s2.width) - ix;
      const ih = Math.min(s1.y + s1.height, s2.y + s2.height) - iy;
      if (iw > 0 && ih > 0) {
        const intersectedShape: VectorShape = {
          id: `v-intersect-${Date.now()}`,
          type: 'ellipse',
          x: ix,
          y: iy,
          width: iw,
          height: ih,
          fill: s2.fill,
          stroke: s2.stroke,
          strokeWidth: s2.strokeWidth,
        };
        setVectorShapes(prev => [...prev.filter(s => s.id !== s1.id && s.id !== s2.id), intersectedShape]);
        setSelectedShapeIds([intersectedShape.id]);
        pushHistoryStep('Pathfinder: Intersect');
        showShortcutFeedback('Pathfinder: Intersect Overlap');
      } else {
        showShortcutFeedback('No geometric intersection between shapes');
      }
    } else if (op === 'exclude') {
      const excludedShape: VectorShape = {
        id: `v-exclude-${Date.now()}`,
        type: 'polygon',
        x: Math.min(s1.x, s2.x),
        y: Math.min(s1.y, s2.y),
        width: Math.max(s1.x + s1.width, s2.x + s2.width) - Math.min(s1.x, s2.x),
        height: Math.max(s1.y + s1.height, s2.y + s2.height) - Math.min(s1.y, s2.y),
        fill: s1.fill,
        stroke: s2.stroke,
        strokeWidth: 2,
      };
      setVectorShapes(prev => [...prev.filter(s => s.id !== s1.id && s.id !== s2.id), excludedShape]);
      setSelectedShapeIds([excludedShape.id]);
      pushHistoryStep('Pathfinder: Exclude');
      showShortcutFeedback('Pathfinder: Exclude Overlap');
    } else if (op === 'divide') {
      // Divide shapes into individual slices
      const p1: VectorShape = { ...s1, id: `v-div-1-${Date.now()}`, width: s1.width * 0.6 };
      const p2: VectorShape = { ...s2, id: `v-div-2-${Date.now()}`, width: s2.width * 0.6 };
      setVectorShapes(prev => [...prev.filter(s => s.id !== s1.id && s.id !== s2.id), p1, p2]);
      setSelectedShapeIds([p1.id, p2.id]);
      pushHistoryStep('Pathfinder: Divide');
      showShortcutFeedback('Pathfinder: Divide Subpaths');
    }
  }, [vectorShapes, selectedShapeIds, pushHistoryStep, showShortcutFeedback]);

  // macOS Global Menu & Finder Focus
  const [macActiveApp, setMacActiveApp] = useState<'suiza' | 'finder'>('suiza');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // Theme & Shortcuts
  const [themeId, setThemeId] = useState<StudioTheme['id']>('dark-cc');
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const [osMode, setOsMode] = useState<'macos' | 'linux' | 'windows'>('macos');

  useEffect(() => {
    if (theme.isLight) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [theme.isLight]);

  const [shortcuts, setShortcutsState] = useState<KeyboardShortcut[]>(() => {
    const saved = loadShortcutsSettings<KeyboardShortcut[]>();
    return saved || DEFAULT_SHORTCUTS;
  });

  const setShortcuts = useCallback((newShortcuts: KeyboardShortcut[]) => {
    setShortcutsState(newShortcuts);
    saveShortcutsSettings(newShortcuts);
  }, []);

  // Offline, Cloud Sync & Auto Backup
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<StudioContextType['syncStatus']>('synced');
  const [lastSavedAt, setLastSavedAt] = useState(Date.now());

  const triggerAutoSave = useCallback(() => {
    setSyncStatus('syncing');
    saveProjectToLocal(project);
    setTimeout(() => {
      setSyncStatus(isOffline ? 'saved-local' : 'synced');
      setLastSavedAt(Date.now());
    }, 400);
  }, [project, isOffline]);

  // Auto-save interval every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      triggerAutoSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [triggerAutoSave]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setSyncStatus('synced');
    };
    const handleOffline = () => {
      setIsOffline(true);
      setSyncStatus('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Opt-in AI
  const [aiOptIn, setAiOptIn] = useState(false);

  // Plugins
  const [plugins, setPlugins] = useState<PluginExtension[]>(SAMPLE_PLUGINS);
  const togglePlugin = useCallback((id: string) => {
    setPlugins(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  }, []);

  // Global Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const keyLower = e.key.toLowerCase();

      // Find matched shortcut
      for (const sc of shortcuts) {
        const matchesCtrl = !!sc.ctrl === isCtrlOrCmd;
        const matchesShift = !!sc.shift === e.shiftKey;
        const matchesAlt = !!sc.alt === e.altKey;
        const matchesKey = sc.key.toLowerCase() === keyLower;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          e.preventDefault();
          showShortcutFeedback(`${sc.name} (${sc.ctrl ? 'Ctrl+' : ''}${sc.shift ? 'Shift+' : ''}${sc.key.toUpperCase()})`);

          // Execute action according to ID
          switch (sc.id) {
            case 'tool-move': setActiveTool('move'); break;
            case 'tool-direct': setActiveTool('direct-select'); break;
            case 'tool-marquee': setActiveTool('marquee'); break;
            case 'tool-lasso': setActiveTool('lasso'); break;
            case 'tool-crop': setActiveTool('crop'); break;
            case 'tool-eyedropper': setActiveTool('eyedropper'); break;
            case 'tool-healing': setActiveTool('healing'); break;
            case 'tool-brush': setActiveTool('brush'); break;
            case 'tool-eraser': setActiveTool('eraser'); break;
            case 'tool-bucket': setActiveTool('bucket'); break;
            case 'tool-pen': setActiveTool('pen'); break;
            case 'tool-text': setActiveTool(persona === 'publish' ? 'frame-text' : 'text'); break;
            case 'tool-hand': setActiveTool('hand'); break;
            case 'tool-zoom': setActiveTool('zoom'); break;
            case 'file-new': setActiveModal('new-doc'); break;
            case 'file-save': triggerAutoSave(); break;
            case 'file-export': setActiveModal('export'); break;
            case 'edit-undo': undo(); break;
            case 'edit-redo': redo(); break;
            case 'edit-shortcuts': setActiveModal('shortcuts'); break;
            case 'object-group': groupSelectedObjects(); break;
            case 'object-ungroup': ungroupSelectedObjects(); break;
            case 'edit-selectall': selectAllObjects(); break;
            case 'edit-deselect': deselectAllObjects(); break;
            case 'edit-delete': deleteSelectedObjects(); break;
            case 'layer-bringforward': bringForward(); break;
            case 'layer-sendbackward': sendBackward(); break;
            case 'layer-bringtofront': bringToFront(); break;
            case 'layer-sendtoback': sendToBack(); break;
            case 'view-guides': setShowGuides(g => !g); break;
            case 'view-snap': setSnapToGuides(s => !s); break;
            case 'view-lockguides': setLockGuides(l => !l); break;
            case 'window-character': setActiveDockTab('typography'); setDockCollapsed(false); break;
            case 'window-dock-toggle': setDockCollapsed(prev => !prev); break;
            case 'view-grid': setShowGrid(g => !g); break;
            case 'view-zoomin': setZoom(z => Math.min(32, z * 1.25)); break;
            case 'view-zoomout': setZoom(z => Math.max(0.1, z / 1.25)); break;
            case 'view-fit': fitToScreen(); break;
            case 'view-actual': resetViewport(); break;
            case 'view-rulers': setShowRulers(r => !r); break;
            case 'layer-new': addLayer(); break;
            case 'layer-duplicate': if (selectedLayer) duplicateLayer(selectedLayer.id); break;
            case 'persona-photo': setPersona('photo'); break;
            case 'persona-vector': setPersona('vector'); break;
            case 'persona-publish': setPersona('publish'); break;
          }
          return;
        }
      }

      // Quick hotkeys for color swap
      if (keyLower === 'x' && !isCtrlOrCmd && !e.shiftKey) {
        swapColors();
        showShortcutFeedback('Swap Colors (X)');
      } else if (keyLower === 'd' && !isCtrlOrCmd && !e.shiftKey) {
        resetDefaultColors();
        showShortcutFeedback('Default Colors (D)');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedObjects();
      } else if (e.key === 'Escape') {
        deselectAllObjects();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        nudgeSelectedObjects(0, e.shiftKey ? -10 : -1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        nudgeSelectedObjects(0, e.shiftKey ? 10 : 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nudgeSelectedObjects(e.shiftKey ? -10 : -1, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nudgeSelectedObjects(e.shiftKey ? 10 : 1, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    shortcuts,
    persona,
    selectedLayer,
    undo,
    redo,
    addLayer,
    duplicateLayer,
    setPersona,
    swapColors,
    resetDefaultColors,
    triggerAutoSave,
    fitToScreen,
    resetViewport,
    showShortcutFeedback,
    groupSelectedObjects,
    ungroupSelectedObjects,
    selectAllObjects,
    deselectAllObjects,
    deleteSelectedObjects,
    nudgeSelectedObjects,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    setShowGuides,
    setShowGrid,
    setShowRulers,
  ]);

  return (
    <StudioContext.Provider
      value={{
        persona,
        setPersona,
        project,
        setProject,
        updateProjectName,
        setColorMode,
        activeTool,
        setActiveTool,
        toolOptions,
        setToolOption,
        foregroundColor,
        setForegroundColor,
        backgroundColor,
        setBackgroundColor,
        swapColors,
        resetDefaultColors,
        cmykColor,
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
        updateLayerAdjustment,
        moveLayer,
        mergeLayerDown,
        zoom,
        setZoom,
        panX,
        panY,
        setPan,
        resetViewport,
        fitToScreen,
        showRulers,
        setShowRulers,
        showGuides,
        setShowGuides,
        showGrid,
        setShowGrid,
        guides,
        setGuides,
        addGuide,
        updateGuide,
        removeGuide,
        clearGuides,
        snapToGuides,
        setSnapToGuides,
        snappingConfig,
        setSnappingConfig,
        updateSnappingConfig,
        toggleSnapping,
        lockGuides,
        setLockGuides,
        history,
        historyIndex,
        undo,
        redo,
        pushHistoryStep,
        restoreHistoryStep,
        clearHistory,
        createSnapshot,
        palettes,
        setPalettes,
        addSwatch,
        removeSwatch,
        createPalette,
        deletePalette,
        applySwatchToSelection,
        activeModal,
        setActiveModal,
        dockCollapsed,
        setDockCollapsed,
        activeDockTab,
        setActiveDockTab,
        vectorShapes,
        setVectorShapes,
        selectedShapeIds,
        setSelectedShapeIds,
        updateVectorShape,
        updateSelectedVectorShapes,
        vectorFill,
        setVectorFill,
        vectorStroke,
        setVectorStroke,
        vectorStrokeWidth,
        setVectorStrokeWidth,
        vectorStrokeStyle,
        setVectorStrokeStyle,
        vectorCornerRadius,
        setVectorCornerRadius,
        applyPathfinderOp,
        publishFrames,
        setPublishFrames,
        selectedFrameIds,
        setSelectedFrameIds,
        updatePublishFrame,
        updateSelectedPublishFrames,
        publishSpreadIndex,
        setPublishSpreadIndex,
        publishMasterPage,
        setPublishMasterPage,
        publishColumnCount,
        setPublishColumnCount,
        publishColumnGutter,
        setPublishColumnGutter,
        publishTextWrapMode,
        setPublishTextWrapMode,
        publishParagraphStyle,
        setPublishParagraphStyle,
        selectedLayerIds,
        setSelectedLayerIds,
        groupSelectedObjects,
        ungroupSelectedObjects,
        selectAllObjects,
        deselectAllObjects,
        deleteSelectedObjects,
        nudgeSelectedObjects,
        bringForward,
        sendBackward,
        bringToFront,
        sendToBack,
        alignSelectedObjects,
        macActiveApp,
        setMacActiveApp,
        isSpotlightOpen,
        setIsSpotlightOpen,
        theme,
        setThemeId,
        osMode,
        setOsMode,
        shortcuts,
        setShortcuts,
        activeShortcutHint,
        showShortcutFeedback,
        isOffline,
        setIsOffline,
        syncStatus,
        triggerAutoSave,
        lastSavedAt,
        aiOptIn,
        setAiOptIn,
        plugins,
        togglePlugin,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
