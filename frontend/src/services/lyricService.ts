// Lyric parsing and import service
import type { Song, LyricSection, LyricLine } from '../types';
import { countChars } from '../utils/charCount';

function generateId(): string {
  return crypto.randomUUID().slice(0, 9);
}

export function parseLyricText(text: string): LyricSection[] {
  const sections: LyricSection[] = [];
  const lines = text.split('\n');

  let currentSection: LyricSection | null = null;
  let currentLines: LyricLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) continue;

    const sectionMatch = trimmed.match(/^\[(.+?)\]$/);
    if (sectionMatch) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.lines = currentLines;
        sections.push(currentSection);
      } else if (currentLines.length > 0) {
        // Lines before first section header -> wrap in default section
        sections.push({
          id: generateId(),
          title: '主歌',
          lines: currentLines,
        });
      }

      currentSection = {
        id: generateId(),
        title: sectionMatch[1],
        lines: [],
      };
      currentLines = [];
      continue;
    }

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

  if (lastIndex < text.length) {
    sections.push(text.slice(lastIndex));
  }

  return sections;
}
