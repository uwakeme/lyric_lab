// Editor store using Zustand
import { create } from 'zustand';
import type { Song, LyricSection, LyricLine, RhymeRule, EditorCommand } from '../types';
import { saveAutoSave, loadAutoSave, clearAutoSave } from '../services/versionService';
import { checkRhyme } from '../services/rhymeService';
import { countChars } from '../utils/charCount';

interface EditorStore {
  // State
  currentSong: Song | null;
  selectedSectionId: string | null;
  selectedLineId: string | null;
  isDirty: boolean;
  rhymeRule: RhymeRule;
  charLimit: { min: number; max: number };
  undoStack: EditorCommand[];
  redoStack: EditorCommand[];

  // Actions
  setCurrentSong: (song: Song | null) => void;
  selectSection: (sectionId: string | null) => void;
  selectLine: (lineId: string | null) => void;
  updateLineText: (sectionId: string, lineId: string, text: string, field?: 'text' | 'adapted') => void;
  addSection: (title: string) => void;
  deleteSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  addLine: (sectionId: string, afterLineId?: string) => void;
  deleteLine: (sectionId: string, lineId: string) => void;
  moveLine: (sectionId: string, lineId: string, direction: 'up' | 'down') => void;
  setRhymeRule: (rule: RhymeRule) => void;
  setCharLimit: (min: number, max: number) => void;
  checkLineRhyme: (sectionId: string, lineId: string) => void;
  checkAllRhymes: () => void;
  undo: () => void;
  redo: () => void;
  markDirty: () => void;
  reset: () => void;
  autoSave: () => void;
  loadFromAutoSave: () => boolean;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function cloneSong(song: Song): Song {
  return JSON.parse(JSON.stringify(song));
}

function pushUndo(store: EditorStore, before: Song): void {
  const cmd: EditorCommand = {
    type: 'text',
    timestamp: Date.now(),
    before,
    after: cloneSong(store.currentSong!),
  };
  store.undoStack.push(cmd);
  if (store.undoStack.length > 50) {
    store.undoStack.shift();
  }
  store.redoStack = [];
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentSong: null,
  selectedSectionId: null,
  selectedLineId: null,
  isDirty: false,
  rhymeRule: { type: 'none' },
  charLimit: { min: 5, max: 10 },
  undoStack: [],
  redoStack: [],

  setCurrentSong: (song) => set({
    currentSong: song,
    selectedSectionId: song?.lyrics[0]?.id || null,
    isDirty: false,
    undoStack: [],
    redoStack: [],
  }),

  selectSection: (sectionId) => set({ selectedSectionId: sectionId }),

  selectLine: (lineId) => set({ selectedLineId: lineId }),

  updateLineText: (sectionId, lineId, text, field = 'text') => {
    const store = get();
    if (!store.currentSong) return;

    const before = cloneSong(store.currentSong);
    const section = store.currentSong.lyrics.find(s => s.id === sectionId);
    if (!section) return;

    const line = section.lines.find(l => l.id === lineId);
    if (!line) return;

    if (field === 'adapted') {
      line.adaptedText = text;
    } else {
      line.text = text;
      line.charCount = countChars(text);
    }

    // Check rhyme if enabled
    if (store.rhymeRule.type !== 'none') {
      const textToCheck = field === 'adapted' ? text : (line.adaptedText ?? line.text);
      const result = checkRhyme(line, store.rhymeRule, textToCheck);
      line.rhymeStatus = result.status;
    }

    pushUndo(store, before);
    set({ isDirty: true });
  },

  addSection: (title) => {
    const store = get();
    if (!store.currentSong) return;

    const before = cloneSong(store.currentSong);
    const newSection: LyricSection = {
      id: generateId(),
      title,
      lines: [],
    };
    store.currentSong.lyrics.push(newSection);

    pushUndo(store, before);
    set({ isDirty: true, selectedSectionId: newSection.id });
  },

  deleteSection: (sectionId) => {
    const store = get();
    if (!store.currentSong) return;
    if (store.currentSong.lyrics.length <= 1) return;

    const before = cloneSong(store.currentSong);
    const index = store.currentSong.lyrics.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    store.currentSong.lyrics.splice(index, 1);

    pushUndo(store, before);
    set({
      isDirty: true,
      selectedSectionId: store.currentSong.lyrics[0]?.id || null,
    });
  },

  moveSection: (sectionId, direction) => {
    const store = get();
    if (!store.currentSong) return;

    const before = cloneSong(store.currentSong);
    const index = store.currentSong.lyrics.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= store.currentSong.lyrics.length) return;

    const sections = store.currentSong.lyrics;
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];

    pushUndo(store, before);
    set({ isDirty: true });
  },

  updateSectionTitle: (sectionId, title) => {
    const store = get();
    if (!store.currentSong) return;

    const section = store.currentSong.lyrics.find(s => s.id === sectionId);
    if (!section) return;

    section.title = title;
    set({ isDirty: true });
  },

  addLine: (sectionId, afterLineId) => {
    const store = get();
    if (!store.currentSong) return;

    const before = cloneSong(store.currentSong);
    const section = store.currentSong.lyrics.find(s => s.id === sectionId);
    if (!section) return;

    const newLine: LyricLine = {
      id: generateId(),
      text: '',
      charCount: 0,
      rhymeStatus: 'unchecked',
    };

    if (afterLineId) {
      const index = section.lines.findIndex(l => l.id === afterLineId);
      section.lines.splice(index + 1, 0, newLine);
    } else {
      section.lines.push(newLine);
    }

    pushUndo(store, before);
    set({ isDirty: true, selectedLineId: newLine.id });
  },

  deleteLine: (sectionId, lineId) => {
    const store = get();
    if (!store.currentSong) return;

    const before = cloneSong(store.currentSong);
    const section = store.currentSong.lyrics.find(s => s.id === sectionId);
    if (!section) return;
    if (section.lines.length <= 1) return;

    const index = section.lines.findIndex(l => l.id === lineId);
    if (index === -1) return;

    section.lines.splice(index, 1);

    pushUndo(store, before);
    set({ isDirty: true });
  },

  moveLine: (sectionId, lineId, direction) => {
    const store = get();
    if (!store.currentSong) return;

    const before = cloneSong(store.currentSong);
    const section = store.currentSong.lyrics.find(s => s.id === sectionId);
    if (!section) return;

    const index = section.lines.findIndex(l => l.id === lineId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= section.lines.length) return;

    [section.lines[index], section.lines[newIndex]] = [
      section.lines[newIndex],
      section.lines[index],
    ];

    pushUndo(store, before);
    set({ isDirty: true });
  },

  setRhymeRule: (rule) => {
    set({ rhymeRule: rule });
    // Re-check all lines
    get().checkAllRhymes();
  },

  setCharLimit: (min, max) => set({ charLimit: { min, max } }),

  checkLineRhyme: (sectionId, lineId) => {
    const store = get();
    if (!store.currentSong) return;
    if (store.rhymeRule.type === 'none') return;

    const section = store.currentSong.lyrics.find(s => s.id === sectionId);
    if (!section) return;

    const line = section.lines.find(l => l.id === lineId);
    if (!line) return;

    const textToCheck = line.adaptedText ?? line.text;
    const result = checkRhyme(line, store.rhymeRule, textToCheck);
    line.rhymeStatus = result.status;
    set({ isDirty: true });
  },

  checkAllRhymes: () => {
    const store = get();
    if (!store.currentSong) return;
    if (store.rhymeRule.type === 'none') return;

    for (const section of store.currentSong.lyrics) {
      for (const line of section.lines) {
        const textToCheck = line.adaptedText ?? line.text;
        const result = checkRhyme(line, store.rhymeRule, textToCheck);
        line.rhymeStatus = result.status;
      }
    }
    set({ isDirty: true });
  },

  undo: () => {
    const store = get();
    if (store.undoStack.length === 0) return;
    if (!store.currentSong) return;

    const cmd = store.undoStack.pop()!;
    store.redoStack.push({
      type: 'text',
      timestamp: Date.now(),
      before: cloneSong(store.currentSong),
      after: cmd.before,
    });

    set({
      currentSong: cmd.before,
      isDirty: true,
    });
  },

  redo: () => {
    const store = get();
    if (store.redoStack.length === 0) return;
    if (!store.currentSong) return;

    const cmd = store.redoStack.pop()!;
    store.undoStack.push({
      type: 'text',
      timestamp: Date.now(),
      before: cloneSong(store.currentSong),
      after: cmd.after,
    });

    set({
      currentSong: cmd.after,
      isDirty: true,
    });
  },

  markDirty: () => set({ isDirty: true }),

  reset: () => set({
    currentSong: null,
    selectedSectionId: null,
    selectedLineId: null,
    isDirty: false,
    undoStack: [],
    redoStack: [],
  }),

  autoSave: () => {
    const store = get();
    if (store.currentSong && store.isDirty) {
      saveAutoSave(store.currentSong);
    }
  },

  loadFromAutoSave: () => {
    const saved = loadAutoSave();
    if (saved) {
      set({
        currentSong: saved.content,
        selectedSectionId: saved.content.lyrics[0]?.id || null,
        isDirty: false,
      });
      return true;
    }
    return false;
  },
}))