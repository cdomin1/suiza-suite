import { Layer, VectorPath, CMYKColor } from '../types';

// Convert RGB (0-255) to CMYK (0-100)
export function rgbToCmyk(r: number, g: number, b: number): CMYKColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const kNorm = 1 - Math.max(rNorm, gNorm, bNorm);
  if (kNorm === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const cNorm = (1 - rNorm - kNorm) / (1 - kNorm);
  const mNorm = (1 - gNorm - kNorm) / (1 - kNorm);
  const yNorm = (1 - bNorm - kNorm) / (1 - kNorm);

  return {
    c: Math.round(cNorm * 100),
    m: Math.round(mNorm * 100),
    y: Math.round(yNorm * 100),
    k: Math.round(kNorm * 100),
  };
}

// Convert CMYK (0-100) to RGB (0-255)
export function cmykToRgb(c: number, m: number, y: number, k: number): { r: number; g: number; b: number } {
  const cNorm = c / 100;
  const mNorm = m / 100;
  const yNorm = y / 100;
  const kNorm = k / 100;

  const r = Math.round(255 * (1 - cNorm) * (1 - kNorm));
  const g = Math.round(255 * (1 - mNorm) * (1 - kNorm));
  const b = Math.round(255 * (1 - yNorm) * (1 - kNorm));

  return { r, g, b };
}

// Hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16) || 0;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Map blend mode to CanvasRenderingContext2D GlobalCompositeOperation
export function mapBlendMode(blendMode: string): GlobalCompositeOperation {
  switch (blendMode) {
    case 'multiply':
      return 'multiply';
    case 'screen':
      return 'screen';
    case 'overlay':
      return 'overlay';
    case 'darken':
      return 'darken';
    case 'lighten':
      return 'lighten';
    case 'color-dodge':
      return 'color-dodge';
    case 'color-burn':
      return 'color-burn';
    case 'hard-light':
      return 'hard-light';
    case 'soft-light':
      return 'soft-light';
    case 'difference':
      return 'difference';
    case 'exclusion':
      return 'exclusion';
    default:
      return 'source-over';
  }
}

// Create clean Photoshop-standard photo canvas (White, Transparent Checkered, or Black)
export function generateSamplePhotoCanvas(
  width: number,
  height: number,
  background: 'white' | 'transparent' | 'black' = 'white'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (background === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else if (background === 'black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  } else if (background === 'transparent') {
    // Leave fully transparent - Photoshop checkerboard pattern is rendered on the viewport
    ctx.clearRect(0, 0, width, height);
  }

  return canvas.toDataURL('image/png');
}

// Draw standard Photoshop checkerboard pattern on a 2D canvas context
export function drawPhotoshopCheckerboard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size: number = 16,
  isDarkTheme: boolean = false
) {
  const c1 = isDarkTheme ? '#2a2b30' : '#ffffff';
  const c2 = isDarkTheme ? '#1e1f24' : '#e5e7eb';

  ctx.save();
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      const isEven = ((x / size) + (y / size)) % 2 === 0;
      ctx.fillStyle = isEven ? c1 : c2;
      ctx.fillRect(x, y, Math.min(size, width - x), Math.min(size, height - y));
    }
  }
  ctx.restore();
}

// Return clean empty vector artboard (like Adobe Illustrator / Affinity Designer)
export function generateSampleVectorPaths(width: number, height: number): VectorPath[] {
  return [];
}

