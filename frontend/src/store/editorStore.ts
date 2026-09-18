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

// 撤销栈直接保存快照引用：所有 state 更新都是不可变操作，
// 历史 Song 对象不会再被修改，无需 structuredClone（每次按键深拷贝整首歌开销大）。
// 只有 setCurrentSong 从外部（API/导入）接收歌曲时才做一次防御性拷贝。
function pushUndo(
  undoStack: EditorCommand[],
  before: Song,
  after: Song
): Pick<EditorStore, 'undoStack' | 'redoStack'> {
  const cmd: EditorCommand = {
    type: 'text',
    timestamp: Date.now(),
    before,
    after,
  };
  const next = [...undoStack, cmd];
  if (next.length > 50) next.shift();
  return { undoStack: next, redoStack: [] };
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
      ...pushUndo(state.undoStack, state.currentSong, newSong),
      isDirty: true,
      editVersion: state.editVersion + 1,
    });
  },

  addSection: (title) => {
    const state = get();
    if (!state.currentSong) return;

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
      ...pushUndo(state.undoStack, state.currentSong, newSong),
      isDirty: true,
      selectedSectionId: newSection.id,
      editVersion: state.editVersion + 1,
    });
  },

  deleteSection: (sectionId) => {
    const state = get();
    if (!state.currentSong) return;
    if (state.currentSong.lyrics.length <= 1) return;

    const newLyrics = state.currentSong.lyrics.filter(s => s.id !== sectionId);
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({
      currentSong: newSong,
      ...pushUndo(state.undoStack, state.currentSong, newSong),
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

    const newLyrics = [...state.currentSong.lyrics];
    [newLyrics[index], newLyrics[newIndex]] = [newLyrics[newIndex], newLyrics[index]];
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({
      currentSong: newSong,
      ...pushUndo(state.undoStack, state.currentSong, newSong),
      isDirty: true,
      editVersion: state.editVersion + 1,
    });
  },

  updateSectionTitle: (sectionId, title) => {
    const state = get();
    if (!state.currentSong) return;

    const newLyrics = state.currentSong.lyrics.map(section =>
      section.id === sectionId ? { ...section, title } : section
    );
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({
      currentSong: newSong,
      ...pushUndo(state.undoStack, state.currentSong, newSong),
      isDirty: true,
      editVersion: state.editVersion + 1,
    });
  },

  addLine: (sectionId, afterLineId) => {
    const state = get();
    if (!state.currentSong) return;

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
      ...pushUndo(state.undoStack, state.currentSong, newSong),
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

    const newLyrics = state.currentSong.lyrics.map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, lines: s.lines.filter(l => l.id !== lineId) };
    });
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({
      currentSong: newSong,
      ...pushUndo(state.undoStack, state.currentSong, newSong),
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

    const newLyrics = state.currentSong.lyrics.map(s => {
      if (s.id !== sectionId) return s;
      const newLines = [...s.lines];
      [newLines[index], newLines[newIndex]] = [newLines[newIndex], newLines[index]];
      return { ...s, lines: newLines };
    });
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({
      currentSong: newSong,
      ...pushUndo(state.undoStack, state.currentSong, newSong),
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

    let changed = false;
    const newLyrics = state.currentSong.lyrics.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        lines: section.lines.map(line => {
          if (line.id !== lineId) return line;
          const textToCheck = line.adaptedText ?? line.text;
          const result = checkRhyme(line, state.rhymeRule, textToCheck);
          if (line.rhymeStatus === result.status) return line;
          changed = true;
          return { ...line, rhymeStatus: result.status };
        }),
      };
    });
    // 状态没变化就不更新 state，避免多余的 isDirty 和重渲染
    if (!changed) return;
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({ currentSong: newSong, isDirty: true });
  },

  checkAllRhymes: () => {
    const state = get();
    if (!state.currentSong) return;
    if (state.rhymeRule.type === 'none') return;

    let changed = false;
    const newLyrics = state.currentSong.lyrics.map(section => {
      let sectionChanged = false;
      const newLines = section.lines.map(line => {
        const textToCheck = line.adaptedText ?? line.text;
        const result = checkRhyme(line, state.rhymeRule, textToCheck);
        // 保留未变化行的引用，未受影响的组件可以跳过重渲染
        if (line.rhymeStatus === result.status) return line;
        sectionChanged = true;
        changed = true;
        return { ...line, rhymeStatus: result.status };
      });
      return sectionChanged ? { ...section, lines: newLines } : section;
    });
    if (!changed) return;
    const newSong = { ...state.currentSong, lyrics: newLyrics };

    set({ currentSong: newSong, isDirty: true });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0 || !state.currentSong) return;

    const cmd = state.undoStack[state.undoStack.length - 1];
    const redoEntry: EditorCommand = {
      type: 'text',
      timestamp: Date.now(),
      before: state.currentSong,
      after: cmd.before,
    };

    set({
      currentSong: cmd.before,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, redoEntry],
      isDirty: true,
      editVersion: state.editVersion + 1,
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0 || !state.currentSong) return;

    const cmd = state.redoStack[state.redoStack.length - 1];
    const undoEntry: EditorCommand = {
      type: 'text',
      timestamp: Date.now(),
      before: state.currentSong,
      after: cmd.after,
    };

    set({
      currentSong: cmd.after,
      undoStack: [...state.undoStack, undoEntry],
      redoStack: state.redoStack.slice(0, -1),
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
    // 防御损坏/旧格式的 autosave 数据，避免恢复时整页崩溃
    if (saved && saved.content && Array.isArray(saved.content.lyrics)) {
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
