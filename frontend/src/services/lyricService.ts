// Lyric parsing and import service
import type { Song, LyricSection, LyricLine } from '../types';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function parseLyricText(text: string): LyricSection[] {
  const sections: LyricSection[] = [];
  const lines = text.split('\n');

  let currentSection: LyricSection | null = null;
  let currentLines: LyricLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Check for section header (e.g., [主歌]、[副歌]、[前奏])
    const sectionMatch = trimmed.match(/^\[(.+?)\]$/);
    if (sectionMatch) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.lines = currentLines;
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        id: generateId(),
        title: sectionMatch[1],
        lines: [],
      };
      currentLines = [];
      continue;
    }

    // Regular lyric line
    const lyricLine: LyricLine = {
      id: generateId(),
      text: trimmed,
      charCount: countChars(trimmed),
      rhymeStatus: 'unchecked',
    };

    currentLines.push(lyricLine);
  }

  // Don't forget the last section
  if (currentSection) {
    currentSection.lines = currentLines;
    sections.push(currentSection);
  }

  // If no sections were found, create a default one
  if (sections.length === 0 && currentLines.length > 0) {
    sections.push({
      id: generateId(),
      title: '主歌',
      lines: currentLines,
    });
  }

  return sections;
}

function countChars(text: string): number {
  let count = 0;
  for (const char of text) {
    if (/[一-龥]/.test(char)) count++;
    else if (/[0-9a-zA-Z]/.test(char)) count++;
  }
  return count;
}

export function createEmptySong(): Song {
  return {
    id: generateId(),
    title: '未命名歌曲',
    artist: '未知艺术家',
    lyrics: [
      {
        id: generateId(),
        title: '主歌',
        lines: [],
      },
    ],
  };
}

export function parseManualImport(text: string): LyricSection[] {
  return parseLyricText(text);
}

export function splitIntoSections(text: string): string[] {
  const sectionPattern = /^\[(.+?)\]$/gm;
  const matches = [...text.matchAll(sectionPattern)];

  if (matches.length === 0) {
    return [text];
  }

  const sections: string[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    if (match.index !== undefined) {
      if (match.index > lastIndex) {
        sections.push(text.slice(lastIndex, match.index));
      }
      lastIndex = match.index;
    }
  }

  // Add remaining text
  if (lastIndex < text.length) {
    sections.push(text.slice(lastIndex));
  }

  return sections;
}