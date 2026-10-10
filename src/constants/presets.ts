import { PluginExtension } from '../types';

export const DOCUMENT_PRESETS = [
  {
    category: 'Photo & Retouching',
    items: [
      { name: '4K Ultra High-Res', width: 3840, height: 2160, dpi: 300, colorMode: 'RGB' as const, persona: 'photo' as const },
      { name: 'Studio Editorial 16:9', width: 2560, height: 1440, dpi: 300, colorMode: 'RGB' as const, persona: 'photo' as const },
      { name: 'Square Retouch Portrait', width: 2048, height: 2048, dpi: 300, colorMode: 'RGB' as const, persona: 'photo' as const },
      { name: 'Print Fine Art 8×10 in', width: 2400, height: 3000, dpi: 300, colorMode: 'RGB' as const, persona: 'photo' as const },
    ]
  },
  {
    category: 'Vector Illustration',
    items: [
      { name: 'App Icon & Vector Grid', width: 1024, height: 1024, dpi: 72, colorMode: 'RGB' as const, persona: 'vector' as const },
      { name: 'Branding Artboard CMYK', width: 1920, height: 1080, dpi: 300, colorMode: 'CMYK' as const, persona: 'vector' as const },
      { name: 'Scalable SVG Canvas', width: 1200, height: 800, dpi: 72, colorMode: 'RGB' as const, persona: 'vector' as const },
    ]
  },
  {
    category: 'Editorial & Publishing',
    items: [
      { name: 'A4 Magazine Spread', width: 2480, height: 3508, dpi: 300, colorMode: 'CMYK' as const, persona: 'publish' as const, facingPages: true, pageCount: 4 },
      { name: 'US Letter Brochure', width: 2550, height: 3300, dpi: 300, colorMode: 'CMYK' as const, persona: 'publish' as const, facingPages: true, pageCount: 4 },
      { name: 'Modern Book Layout 6×9 in', width: 1800, height: 2700, dpi: 300, colorMode: 'CMYK' as const, persona: 'publish' as const, facingPages: true, pageCount: 8 },
    ]
  }
];

export const SAMPLE_PLUGINS: PluginExtension[] = [
  {
    id: 'plug-gegl-retouch',
    name: 'GEGL High-Pass Frequency Separation',
    author: 'GNOME / GIMP Porting Team',
    version: '3.1.2',
    type: 'gegl-op',
    category: 'Retouch',
    description: 'Hardware-accelerated texture split for skin blemish retouching preserving high frequencies.',
    enabled: true,
    memorySafetyVerified: true
  },
  {
    id: 'plug-rust-denoise',
    name: 'Rust SIMD Bilateral Denoise Engine',
    author: 'Suiza Core Research',
    version: '1.4.0',
    type: 'rust-wasm',
    category: 'Retouch',
    description: 'Zero-cost SIMD vectorized noise reduction with zero GC pauses and edge-preserving filtering.',
    enabled: true,
    memorySafetyVerified: true
  },
  {
    id: 'plug-inkscape-bezier',
    name: 'Inkscape PowerStroke & Spiro Paths',
    author: 'Inkscape Vector Lab',
    version: '2.0.4',
    type: 'rust-wasm',
    category: 'Typography',
    description: 'Non-linear Bézier spline interpolation and variable pressure vector calligraphic ribbons.',
    enabled: true,
    memorySafetyVerified: true
  },
  {
    id: 'plug-scribus-pdfx4',
    name: 'Scribus PDF/X-4 CMYK Engine',
    author: 'Scribus Publishing Group',
    version: '1.6.0',
    type: 'scribus-script',
    category: 'Export',
    description: 'ISO 15930-7 compliant professional print preflight with FOGRA39 / GRACoL profile embedding.',
    enabled: true,
    memorySafetyVerified: true
  },
  {
    id: 'plug-python-resynth',
    name: 'GIMP Resynthesizer Content-Aware Bridge',
    author: 'Paul Harrison / Suiza Bridge',
    version: '2.2.0',
    type: 'python-gimp',
    category: 'Automation',
    description: 'Texture synthesis engine for intelligent object erasure and seamless tile generation.',
    enabled: true,
    memorySafetyVerified: true
  },
  {
    id: 'plug-cmyk-separation',
    name: 'Spectral CMYK Ink Density Analyzer',
    author: 'Suiza Colorimetric Lab',
    version: '1.1.0',
    type: 'rust-wasm',
    category: 'Color',
    description: 'Total Area Coverage (TAC) monitor ensuring ink densities do not exceed 300% on offset presses.',
    enabled: true,
    memorySafetyVerified: true
  }
];
