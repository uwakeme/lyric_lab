// Core types for Lyric Lab

export interface LyricLine {
  id: string;
  text: string;
  adaptedText?: string;
  charCount: number;
  rhymeStatus?: 'match' | 'mismatch' | 'unchecked';
  pinyin?: {
    shengmu: string;
    yunmu: string;
    tone: number;
  };
}

export interface LyricSection {
  id: string;
  title: string;
  lines: LyricLine[];
  rhymeRule?: RhymeRule;
  charLimit?: { min: number; max: number };
}

export interface RhymeRule {
  type: 'none' | 'yunmu' | 'ping' | 'ze';
  value?: string; // e.g., 'ang', 'i', 'u'
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics: LyricSection[];
  source?: string;
  sourceUrl?: string;
}

export interface Version {
  id: string;
  label: string;
  timestamp: number;
  content: Song;
  isAutoSave?: boolean;
}

export interface User {
  id: string;
  email: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  data?: T;
  message?: string;
}

// Editor state
export interface EditorState {
  currentSong: Song | null;
  selectedSectionId: string | null;
  selectedLineId: string | null;
  isDirty: boolean;
  rhymeRule: RhymeRule;
  charLimit: { min: number; max: number };
}

// Undo/Redo command
export interface EditorCommand {
  type: 'text' | 'section' | 'rhyme';
  timestamp: number;
  before: Song;
  after: Song;
}

// Export formats
export type ExportFormat = 'txt' | 'lrc' | 'lrc-simple' | 'html';

// Rhyme word library
export interface RhymeWord {
  word: string;
  pinyin: string;
  yunmu: string;
}