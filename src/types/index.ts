export type StudioPersona = 'photo' | 'vector' | 'publish';

export type ToolId =
  // Photo tools
  | 'move'
  | 'marquee'
  | 'lasso'
  | 'crop'
  | 'eyedropper'
  | 'healing'
  | 'brush'
  | 'eraser'
  | 'bucket'
  | 'gradient'
  | 'dodge'
  | 'burn'
  | 'pen'
  | 'text'
  | 'hand'
  | 'zoom'
  // Vector tools
  | 'direct-select'
  | 'node-edit'
  | 'anchor-convert'
  | 'shape-rect'
  | 'shape-ellipse'
  | 'shape-polygon'
  | 'shape-builder'
  | 'knife'
  // Publish tools
  | 'frame-text'
  | 'frame-picture'
  | 'frame-shape'
  | 'line-tool'
  | 'page-tool';

export type PhotoDockTab = 'layers' | 'typography' | 'swatches' | 'adjustments' | 'properties' | 'history' | 'ai';
export type VectorDockTab = 'layers' | 'typography' | 'swatches' | 'stroke' | 'pathfinder' | 'properties' | 'history';
export type PublishDockTab = 'pages' | 'typography' | 'swatches' | 'wrap' | 'properties' | 'preflight' | 'layers' | 'history';
export type DockTabId = PhotoDockTab | VectorDockTab | PublishDockTab;

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export type LayerType = 'raster' | 'vector' | 'text' | 'adjustment' | 'frame' | 'group';

export type AdjustmentType =
  | 'brightness-contrast'
  | 'curves'
  | 'levels'
  | 'hsl'
  | 'color-balance'
  | 'invert';

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 100
  blendMode: BlendMode;
  adjustmentType?: AdjustmentType;
  adjustmentValues?: Record<string, number>;
  groupId?: string; // If nested inside a layer group
  collapsed?: boolean; // If group folder is collapsed in UI
  // Drawing & Vector data
  canvasDataUrl?: string;
  vectorPaths?: VectorPath[];
  textContent?: string;
  textFontSize?: number;
  textFontFamily?: string;
  textColor?: string;
  textFontWeight?: string;
  textLetterSpacing?: number;
  textLineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  maskEnabled?: boolean;
}

export interface VectorPoint {
  x: number;
  y: number;
  cp1x?: number;
  cp1y?: number;
  cp2x?: number;
  cp2y?: number;
}

export interface VectorShape {
  id: string;
  name?: string;
  type: 'rect' | 'ellipse' | 'polygon' | 'path' | 'text' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  cap?: 'butt' | 'round' | 'square';
  join?: 'miter' | 'round' | 'bevel';
  points?: VectorPoint[];
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  rotation?: number;
  opacity?: number;
  groupId?: string;
  children?: VectorShape[];
  visible?: boolean;
  locked?: boolean;
}

export interface PublishFrame {
  id: string;
  name?: string;
  type: 'text' | 'picture' | 'rule' | 'shape' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  content?: string;
  imageUrl?: string;
  strokeWidth?: number;
  fill?: string;
  fontFamily?: string;
  fontSize?: number;
  leading?: number;
  tracking?: number;
  align?: 'left' | 'center' | 'right' | 'justify';
  wrapMode?: 'none' | 'box' | 'contour' | 'jump';
  wrapMargin?: { top: number; right: number; bottom: number; left: number };
  groupId?: string;
  children?: PublishFrame[];
  visible?: boolean;
  locked?: boolean;
}

export interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number; // document coordinate (x for vertical, y for horizontal)
  locked?: boolean;
  color?: string;
  name?: string;
}

export interface SnappingConfig {
  enabled: boolean;          // Master snapping on/off
  snapToGuides: boolean;     // Align to layout guides
  snapToGrid: boolean;       // Align to grid intervals
  snapToPixels: boolean;     // Align to exact integer pixel boundaries
  snapToObjects: boolean;    // Align to other object edges & centers (smart guides)
  snapToDocBounds: boolean;  // Align to document bounds (margins/center/edges)
  tolerance: number;         // Snap sensitivity / threshold in px (default 8)
  gridSize: number;          // Grid interval in px (default 20)
}

export interface VectorPath {
  id: string;
  points: VectorPoint[];
  closed: boolean;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
}

export type ColorMode = 'RGB' | 'CMYK' | 'GRAYSCALE';

export interface CMYKColor {
  c: number; // 0-100
  m: number; // 0-100
  y: number; // 0-100
  k: number; // 0-100
}

export interface DocumentProject {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  colorMode: ColorMode;
  cmykProfile: string;
  persona: StudioPersona;
  layers: Layer[];
  selectedLayerId: string;
  pageCount: number;
  activePageIndex: number;
  facingPages: boolean;
  bleed: number;
  margins: {
    top: number;
    bottom: number;
    inside: number;
    outside: number;
  };
  guides?: Guide[];
  createdAt: number;
  updatedAt: number;
}

export interface KeyboardShortcut {
  id: string;
  name: string;
  category: 'Tools' | 'File' | 'Edit' | 'View' | 'Layer' | 'Studio';
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
}

export interface StudioTheme {
  id: 'dark-cc' | 'charcoal' | 'midnight' | 'light-studio' | 'light-contrast';
  name: string;
  isLight: boolean;
  bgMain: string;
  bgPanel: string;
  bgCanvas: string;
  bgSubtle: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  chipBg: string;
  inputBg: string;
  hoverBg: string;
  accent: string;
}

export type OSMode = 'macos' | 'linux' | 'windows';

export interface PluginExtension {
  id: string;
  name: string;
  author: string;
  version: string;
  type: 'rust-wasm' | 'gegl-op' | 'python-gimp' | 'scribus-script';
  description: string;
  enabled: boolean;
  category: 'Retouch' | 'Color' | 'Typography' | 'Export' | 'Automation';
  memorySafetyVerified: boolean;
}

export interface ColorSwatch {
  id: string;
  name: string;
  color: string;
  type?: 'solid' | 'gradient';
  gradientType?: 'linear' | 'radial';
  gradientAngle?: number;
  gradientStops?: { offset: number; color: string }[];
  isNone?: boolean;
  category?: string;
  isFavorite?: boolean;
}

export interface SwatchPalette {
  id: string;
  name: string;
  description?: string;
  swatches: ColorSwatch[];
}

export interface HistoryStep {
  id: string;
  title: string;
  timestamp: number;
  persona?: StudioPersona;
  layersSnapshot?: Layer[];
  vectorShapesSnapshot?: VectorShape[];
  publishFramesSnapshot?: PublishFrame[];
  guidesSnapshot?: Guide[];
}
