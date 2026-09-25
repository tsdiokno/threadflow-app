// lib/theme-utils.ts
// Dynamic token-based user theming with WCAG AA compliance calculation & full-spectrum palette generation

export interface ThemeTintPreset {
  id: string;
  name: string;
  hex: string;
  category: 'classic' | 'nature' | 'warm' | 'cool' | 'editorial';
  description: string;
}

export interface ThemeShadePalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface DynamicThemeScheme {
  tintHex: string;
  tintName: string;
  isCustom: boolean;
  // Full-spectrum 11-shade palette
  palette: ThemeShadePalette;
  // Dynamic CSS variable tokens
  primaryHex: string;
  primaryLightHex: string;
  primaryDarkHex: string;
  surfaceTintLight: string;
  surfaceTintDark: string;
  borderTintLight: string;
  borderTintDark: string;
  contrastTextLight: string;
  contrastTextDark: string;
  // Contrast ratio against standard white and dark slate
  contrastOnLight: number;
  contrastOnDark: number;
  isAccessibleOnLight: boolean;
  isAccessibleOnDark: boolean;
}

export const PRESET_TINTS: ThemeTintPreset[] = [
  {
    id: 'indigo',
    name: 'Electric Indigo',
    hex: '#4f46e5',
    category: 'classic',
    description: 'ThreadFlow default brand accent — crisp, modern, focused',
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    hex: '#2563eb',
    category: 'cool',
    description: 'Clean balanced blue for analytical clarity',
  },
  {
    id: 'sky',
    name: 'Arctic Cyan',
    hex: '#0284c7',
    category: 'cool',
    description: 'Cool crisp tint with high readability',
  },
  {
    id: 'teal',
    name: 'Nordic Teal',
    hex: '#0d9488',
    category: 'nature',
    description: 'Earthy tranquil green-blue for low eye strain',
  },
  {
    id: 'emerald',
    name: 'Sage Emerald',
    hex: '#059669',
    category: 'nature',
    description: 'Fresh organic green inspiring clarity and action',
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    hex: '#d97706',
    category: 'warm',
    description: 'Energizing warm golden tint for creative focus',
  },
  {
    id: 'rose',
    name: 'Sunset Rose',
    hex: '#e11d48',
    category: 'warm',
    description: 'Vibrant punchy tone for expressive, spirited teams',
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    hex: '#7c3aed',
    category: 'editorial',
    description: 'Deep sophisticated purple with creative poise',
  },
  {
    id: 'fuchsia',
    name: 'Neon Fuchsia',
    hex: '#c026d3',
    category: 'editorial',
    description: 'Playful vibrant magenta for distinct personalities',
  },
  {
    id: 'slate',
    name: 'Neutral Slate',
    hex: '#475569',
    category: 'editorial',
    description: 'Monochrome minimalist tint with understated elegance',
  },
];

// Precision handcrafted palettes for the curated presets
const PRESET_PALETTES: Record<string, ThemeShadePalette> = {
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  sky: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  fuchsia: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
};

// Helper: Convert HEX to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const sanitized = hex.replace('#', '').trim();
  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0] + sanitized[0], 16);
    const g = parseInt(sanitized[1] + sanitized[1], 16);
    const b = parseInt(sanitized[2] + sanitized[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (sanitized.length === 6) {
    const r = parseInt(sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

// Helper: Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Helper: Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Helper: Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let val = t;
      if (val < 0) val += 1;
      if (val > 1) val -= 1;
      if (val < 1 / 6) return p + (q - p) * 6 * val;
      if (val < 1 / 2) return q;
      if (val < 2 / 3) return p + (q - p) * (2 / 3 - val) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Calculate Relative Luminance per WCAG 2.1
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate Contrast Ratio per WCAG 2.1 (between 1 and 21)
export function getContrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

// Generate an 11-step harmonic palette for arbitrary custom hex
export function generateAlgorithmicPalette(hex: string): ThemeShadePalette {
  const rgb = hexToRgb(hex) || { r: 79, g: 70, b: 229 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const makeHex = (l: number, sFactor = 1.0) => {
    const targetS = Math.max(10, Math.min(100, Math.round(hsl.s * sFactor)));
    const targetL = Math.max(4, Math.min(98, l));
    const c = hslToRgb(hsl.h, targetS, targetL);
    return rgbToHex(c.r, c.g, c.b);
  };

  return {
    50: makeHex(97, 0.9),
    100: makeHex(93, 0.92),
    200: makeHex(85, 0.95),
    300: makeHex(75, 0.96),
    400: makeHex(63, 0.98),
    500: makeHex(52, 1.0),
    600: rgbToHex(rgb.r, rgb.g, rgb.b),
    700: makeHex(36, 1.05),
    800: makeHex(27, 1.05),
    900: makeHex(18, 1.08),
    950: makeHex(11, 1.1),
  };
}

// Generate accessible theme scheme based on tint HEX
export function generateThemeScheme(tintHex: string, tintName?: string): DynamicThemeScheme {
  const rgb = hexToRgb(tintHex) || { r: 79, g: 70, b: 229 }; // Fallback indigo
  const validHex = rgbToHex(rgb.r, rgb.g, rgb.b);

  const whiteRgb = { r: 255, g: 255, b: 255 };
  const darkSlateRgb = { r: 15, g: 23, b: 42 }; // #0f172a

  const contrastOnLight = getContrastRatio(rgb, whiteRgb);
  const contrastOnDark = getContrastRatio(rgb, darkSlateRgb);

  // If text contrast on white is low (< 4.5:1), generate adjusted accessible shade for light mode
  let primaryLightHex = validHex;
  if (contrastOnLight < 4.5) {
    // Darken until WCAG AA 4.5:1 is achieved
    let testRgb = { ...rgb };
    let step = 0;
    while (getContrastRatio(testRgb, whiteRgb) < 4.5 && step < 20) {
      testRgb.r = Math.max(0, testRgb.r - 8);
      testRgb.g = Math.max(0, testRgb.g - 8);
      testRgb.b = Math.max(0, testRgb.b - 8);
      step++;
    }
    primaryLightHex = rgbToHex(testRgb.r, testRgb.g, testRgb.b);
  }

  // If contrast on dark slate is low (< 4.5:1), generate adjusted accessible shade for dark mode
  let primaryDarkHex = validHex;
  if (contrastOnDark < 4.5) {
    // Lighten until WCAG AA 4.5:1 is achieved
    let testRgb = { ...rgb };
    let step = 0;
    while (getContrastRatio(testRgb, darkSlateRgb) < 4.5 && step < 20) {
      testRgb.r = Math.min(255, testRgb.r + 10);
      testRgb.g = Math.min(255, testRgb.g + 10);
      testRgb.b = Math.min(255, testRgb.b + 10);
      step++;
    }
    primaryDarkHex = rgbToHex(testRgb.r, testRgb.g, testRgb.b);
  }

  // Generate subtle tints with transparency
  const surfaceTintLight = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`;
  const surfaceTintDark = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16)`;
  const borderTintLight = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
  const borderTintDark = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;

  const matchedPreset = PRESET_TINTS.find((p) => p.hex.toLowerCase() === validHex.toLowerCase());

  // Determine full spectrum palette
  const palette = matchedPreset && PRESET_PALETTES[matchedPreset.id]
    ? PRESET_PALETTES[matchedPreset.id]
    : generateAlgorithmicPalette(validHex);

  return {
    tintHex: validHex,
    tintName: tintName || matchedPreset?.name || 'Custom Tint',
    isCustom: !matchedPreset,
    palette,
    primaryHex: validHex,
    primaryLightHex,
    primaryDarkHex,
    surfaceTintLight,
    surfaceTintDark,
    borderTintLight,
    borderTintDark,
    contrastTextLight: '#ffffff',
    contrastTextDark: '#0f172a',
    contrastOnLight,
    contrastOnDark,
    isAccessibleOnLight: contrastOnLight >= 4.5,
    isAccessibleOnDark: contrastOnDark >= 4.5,
  };
}

// Storage helpers
const THEME_STORAGE_KEY = 'threadflow_user_tint';

const tintListeners = new Set<() => void>();

export function subscribeUserTint(callback: () => void): () => void {
  tintListeners.add(callback);
  return () => tintListeners.delete(callback);
}

export function notifyUserTintListeners(): void {
  tintListeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('User tint listener error:', e);
    }
  });
}

export function getSavedUserTint(): string {
  if (typeof window === 'undefined') return '#4f46e5';
  return localStorage.getItem(THEME_STORAGE_KEY) || '#4f46e5';
}

export function getUserTintSnapshot(): string {
  if (typeof window === 'undefined') return '#4f46e5';
  return localStorage.getItem(THEME_STORAGE_KEY) || '#4f46e5';
}

export function getUserTintServerSnapshot(): string {
  return '#4f46e5';
}

export function saveUserTint(hex: string): DynamicThemeScheme {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, hex);
  }
  const scheme = generateThemeScheme(hex);
  applyThemeCssVariables(scheme);
  notifyUserTintListeners();
  return scheme;
}

export function applyThemeCssVariables(scheme: DynamicThemeScheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Root theme tokens
  root.style.setProperty('--theme-tint', scheme.tintHex);
  root.style.setProperty('--theme-primary-light', scheme.primaryLightHex);
  root.style.setProperty('--theme-primary-dark', scheme.primaryDarkHex);
  root.style.setProperty('--theme-surface-subtle-light', scheme.surfaceTintLight);
  root.style.setProperty('--theme-surface-subtle-dark', scheme.surfaceTintDark);
  root.style.setProperty('--theme-border-tint-light', scheme.borderTintLight);
  root.style.setProperty('--theme-border-tint-dark', scheme.borderTintDark);

  // Full 11-shade palette dynamically updates all Tailwind indigo-* classes throughout the entire UI
  root.style.setProperty('--color-indigo-50', scheme.palette[50]);
  root.style.setProperty('--color-indigo-100', scheme.palette[100]);
  root.style.setProperty('--color-indigo-200', scheme.palette[200]);
  root.style.setProperty('--color-indigo-300', scheme.palette[300]);
  root.style.setProperty('--color-indigo-400', scheme.palette[400]);
  root.style.setProperty('--color-indigo-500', scheme.palette[500]);
  root.style.setProperty('--color-indigo-600', scheme.palette[600]);
  root.style.setProperty('--color-indigo-700', scheme.palette[700]);
  root.style.setProperty('--color-indigo-800', scheme.palette[800]);
  root.style.setProperty('--color-indigo-900', scheme.palette[900]);
  root.style.setProperty('--color-indigo-950', scheme.palette[950]);

  // RGB components for arbitrary opacity usage
  const rgb = hexToRgb(scheme.tintHex);
  if (rgb) {
    root.style.setProperty('--theme-tint-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  }
}
