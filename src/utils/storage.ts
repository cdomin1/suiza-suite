import { DocumentProject, HistoryStep } from '../types';

const PROJECT_STORAGE_KEY = 'suiza_studio_project_v3';
const REVISIONS_STORAGE_KEY = 'suiza_studio_revisions_v3';
const SHORTCUTS_STORAGE_KEY = 'suiza_studio_shortcuts';
const SETTINGS_STORAGE_KEY = 'suiza_studio_settings';

// Purge any legacy localStorage cache that had baked alpine/mountain graphics
try {
  localStorage.removeItem('suiza_studio_current_project');
  localStorage.removeItem('suiza_studio_revisions');
} catch {
  // Ignore in restricted environments
}

export function saveProjectToLocal(project: DocumentProject): void {
  try {
    const serialized = JSON.stringify(project);
    localStorage.setItem(PROJECT_STORAGE_KEY, serialized);
  } catch (err) {
    console.warn('LocalStorage save failed, quota exceeded or private mode:', err);
  }
}

export function loadProjectFromLocal(): DocumentProject | null {
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse saved project:', err);
  }
  return null;
}

export function saveRevisions(revisions: HistoryStep[]): void {
  try {
    // Keep last 15 revisions to prevent storage bloat
    const trimmed = revisions.slice(-15);
    localStorage.setItem(REVISIONS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Failed to save revisions:', err);
  }
}

export function loadRevisions(): HistoryStep[] {
  try {
    const raw = localStorage.getItem(REVISIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load revisions:', err);
  }
  return [];
}

export function saveShortcutsSettings(shortcuts: unknown): void {
  try {
    localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(shortcuts));
  } catch (e) {
    console.warn('Failed to save shortcuts:', e);
  }
}

export function loadShortcutsSettings<T>(): T | null {
  try {
    const raw = localStorage.getItem(SHORTCUTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load shortcuts:', e);
  }
  return null;
}
