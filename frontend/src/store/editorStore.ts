// Editor store using Zustand
import { create } from 'zustand';
import type { Song, LyricSection, LyricLine, RhymeRule, EditorCommand } from '../types';
import { saveAutoSave, loadAutoSave } from '../services/versionService';
import { checkRhyme } from '../services/rhymeService';
import { countChars } from '../utils/charCount';
import { generateId } from '../utils/id';

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
  editVersion: number;

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

// Module-level debounce timer for rhyme rule changes
let rhymeDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function cloneSong(song: Song): Song {
  return structuredClone(song);
}

function pushUndo(state: EditorStore, before: Song): Pick<EditorStore, 'undoStack' | 'redoStack'> {
  const cmd: EditorCommand = {
    type: 'text',
    timestamp: Date.now(),
    before,
    after: cloneSong(state.currentSong!),
  };
  const undoStack = [...state.undoStack, cmd];
  if (undoStack.length > 50) undoStack.shift();
  return { undoStack, redoStack: [] };
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
  editVersion: 0,

  setCurrentSong: (song) => set({
    currentSong: song ? cloneSong(song) : null,
    selectedSectionId: song?.lyrics[0]?.id || null,
    isDirty: false,
    undoStack: [],
    redoStack: [],
    editVersion: 0,
  }),

  selectSection: (sectionId) => set({ selectedSectionId: sectionId }),

  selectLine: (lineId) => set({ selectedLineId: lineId }),

  updateLineText: (sectionId, lineId, text, field = 'text') => {
    const state = get();
    if (!state.currentSong) return;

    const before = cloneSong(state.currentSong);
    const newLyrics = state.currentSong.lyrics.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        lines: section.lines.map(line => {
          if (line.id !== lineId) return line;
          const updated = { ...line };
          if (field === 'adapted') {
            updated.adaptedText = text;
          } else {
            updated.text = text;
            updated.charCount = countChars(text);
          }
          if (state.rhymeRule.type !== 'none') {
            const textToCheck = field === 'adapted' ? text : (updated.adaptedText ?? updated.text);
            const result = checkRhyme(updated, state.rhymeRule, textToCheck);
            updated.rhymeStatus = result.status;
          }
          return updated;
        }),
      };
    });

    const newSong = { ...state.currentSong, lyrics: newLyrics };
    set({
      currentSong: newSong,
      ...pushUndo({ ...state, currentSong: newSong }, before),
      isDirty: true,
      editVersion: state.editVersion + 1,
    });
  },

  addSection: (title) => {
    const state = get();
    if (!state.currentSong) return;

    const before = cloneSong(state.currentSong);
    const newSection: LyricSection = {
      id: generateId(),
      title,
      lines: [],
    };
    const newSong = {
      ...state.currentSong,
      lyrics: [...state.currentSong.lyrics, newSection],
    };

    set({
      currentSong: newSong,
      ...pushUndo({ ...state, currentSong: newSong }, before),
      isDirty: true,
      selectedSectionId: newSection.id,
      editVersion: state.editVersion + 1,
    });
  },

  deleteSection: (sectionId) => {
    const state = get();
    if (!state.currentSong) return;
    if (state.currentSong.lyrics.length <= 1) return;

    const before = cloneSong(state.currentSong);
    const newLyrics = state.currentSong.lyrics.filter(s => s.id !== sectionId);
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({
      currentSong: newSong,
      ...pushUndo({ ...state, currentSong: newSong }, before),
      isDirty: true,
      selectedSectionId: newLyrics[0]?.id || null,
      editVersion: state.editVersion + 1,
    });
  },

  moveSection: (sectionId, direction) => {
    const state = get();
    if (!state.currentSong) return;

    const index = state.currentSong.lyrics.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= state.currentSong.lyrics.length) return;

    const before = cloneSong(state.currentSong);
    const newLyrics = [...state.currentSong.lyrics];
    [newLyrics[index], newLyrics[newIndex]] = [newLyrics[newIndex], newLyrics[index]];
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({
      currentSong: newSong,
      ...pushUndo({ ...state, currentSong: newSong }, before),
      isDirty: true,
      editVersion: state.editVersion + 1,
    });
  },

  updateSectionTitle: (sectionId, title) => {
    const state = get();
    if (!state.currentSong) return;

    const before = cloneSong(state.currentSong);
    const newLyrics = state.currentSong.lyrics.map(section =>
      section.id === sectionId ? { ...section, title } : section
    );
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({
      currentSong: newSong,
      ...pushUndo({ ...state, currentSong: newSong }, before),
      isDirty: true,
      editVersion: state.editVersion + 1,
    });
  },

  addLine: (sectionId, afterLineId) => {
    const state = get();
    if (!state.currentSong) return;

    const before = cloneSong(state.currentSong);
    const newLine: LyricLine = {
      id: generateId(),
      text: '',
      charCount: 0,
      rhymeStatus: 'unchecked',
    };

    const newLyrics = state.currentSong.lyrics.map(section => {
      if (section.id !== sectionId) return section;
      if (afterLineId) {
        const index = section.lines.findIndex(l => l.id === afterLineId);
        const newLines = [...section.lines];
        newLines.splice(index + 1, 0, newLine);
        return { ...section, lines: newLines };
      }
      return { ...section, lines: [...section.lines, newLine] };
    });
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({
      currentSong: newSong,
      ...pushUndo({ ...state, currentSong: newSong }, before),
      isDirty: true,
      selectedLineId: newLine.id,
      editVersion: state.editVersion + 1,
    });
  },

  deleteLine: (sectionId, lineId) => {
    const state = get();
    if (!state.currentSong) return;

    const section = state.currentSong.lyrics.find(s => s.id === sectionId);
    if (!section || section.lines.length <= 1) return;

    const before = cloneSong(state.currentSong);
    const newLyrics = state.currentSong.lyrics.map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, lines: s.lines.filter(l => l.id !== lineId) };
    });
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({
      currentSong: newSong,
      ...pushUndo({ ...state, currentSong: newSong }, before),
      isDirty: true,
      editVersion: state.editVersion + 1,
    });
  },

  moveLine: (sectionId, lineId, direction) => {
    const state = get();
    if (!state.currentSong) return;

    const section = state.currentSong.lyrics.find(s => s.id === sectionId);
    if (!section) return;

    const index = section.lines.findIndex(l => l.id === lineId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= section.lines.length) return;

    const before = cloneSong(state.currentSong);
    const newLyrics = state.currentSong.lyrics.map(s => {
      if (s.id !== sectionId) return s;
      const newLines = [...s.lines];
      [newLines[index], newLines[newIndex]] = [newLines[newIndex], newLines[index]];
      return { ...s, lines: newLines };
    });
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({
      currentSong: newSong,
      ...pushUndo({ ...state, currentSong: newSong }, before),
      isDirty: true,
      editVersion: state.editVersion + 1,
    });
  },

  setRhymeRule: (rule) => {
    set({ rhymeRule: rule });
    // Debounce: avoid redundant full-song rhyme checks when switching rules rapidly
    if (rhymeDebounceTimer) clearTimeout(rhymeDebounceTimer);
    rhymeDebounceTimer = setTimeout(() => {
      rhymeDebounceTimer = null;
      get().checkAllRhymes();
    }, 150);
  },

  setCharLimit: (min, max) => set({ charLimit: { min, max } }),

  checkLineRhyme: (sectionId, lineId) => {
    const state = get();
    if (!state.currentSong) return;
    if (state.rhymeRule.type === 'none') return;

    const newLyrics = state.currentSong.lyrics.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        lines: section.lines.map(line => {
          if (line.id !== lineId) return line;
          const textToCheck = line.adaptedText ?? line.text;
          const result = checkRhyme(line, state.rhymeRule, textToCheck);
          return { ...line, rhymeStatus: result.status };
        }),
      };
    });
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({ currentSong: newSong, isDirty: true });
  },

  checkAllRhymes: () => {
    const state = get();
    if (!state.currentSong) return;
    if (state.rhymeRule.type === 'none') return;

    const newLyrics = state.currentSong.lyrics.map(section => ({
      ...section,
      lines: section.lines.map(line => {
        const textToCheck = line.adaptedText ?? line.text;
        const result = checkRhyme(line, state.rhymeRule, textToCheck);
        return { ...line, rhymeStatus: result.status };
      }),
    }));
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({ currentSong: newSong, isDirty: true });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0 || !state.currentSong) return;

    const cmd = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);
    const redoEntry: EditorCommand = {
      type: 'text',
      timestamp: Date.now(),
      before: cloneSong(state.currentSong),
      after: cmd.before,
    };

    set({
      currentSong: cloneSong(cmd.before),
      undoStack: newUndoStack,
      redoStack: [...state.redoStack, redoEntry],
      isDirty: true,
      editVersion: state.editVersion + 1,
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0 || !state.currentSong) return;

    const cmd = state.redoStack[state.redoStack.length - 1];
    const newRedoStack = state.redoStack.slice(0, -1);
    const undoEntry: EditorCommand = {
      type: 'text',
      timestamp: Date.now(),
      before: cloneSong(state.currentSong),
      after: cmd.after,
    };

    set({
      currentSong: cloneSong(cmd.after),
      undoStack: [...state.undoStack, undoEntry],
      redoStack: newRedoStack,
      isDirty: true,
      editVersion: state.editVersion + 1,
    });
  },

  markDirty: () => set({ isDirty: true }),

  reset: () => {
    if (rhymeDebounceTimer) {
      clearTimeout(rhymeDebounceTimer);
      rhymeDebounceTimer = null;
    }
    set({
      currentSong: null,
      selectedSectionId: null,
      selectedLineId: null,
      isDirty: false,
      undoStack: [],
      redoStack: [],
      editVersion: 0,
    });
  },

  autoSave: () => {
    const state = get();
    if (state.currentSong && state.isDirty) {
      saveAutoSave(state.currentSong);
    }
  },

  loadFromAutoSave: () => {
    const saved = loadAutoSave();
    if (saved) {
      set({
        currentSong: saved.content,
        selectedSectionId: saved.content.lyrics[0]?.id || null,
        isDirty: false,
        editVersion: 0,
      });
      return true;
    }
    return false;
  },
}))
