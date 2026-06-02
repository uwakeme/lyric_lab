// Song service - handles song search and fallback data
import type { Song } from '../types';
import { parseLyricText } from './lyricService';

const API_BASE = '/api';

// Cached fallback songs - loaded lazily
let fallbackSongsCache: Song[] | null = null;

async function getFallbackSongs(): Promise<Song[]> {
  if (!fallbackSongsCache) {
    const data = await import('./fallbackSongs.json');
    fallbackSongsCache = data.default as Song[];
  }
  return fallbackSongsCache;
}

async function fetchWithFallback<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('API not available');
    return await response.json();
  } catch {
    return null;
  }
}

export async function searchSongs(keyword: string): Promise<Song[]> {
  if (!keyword.trim()) return [];

  const data = await fetchWithFallback<{ data: Song[] }>(
    `${API_BASE}/songs?keyword=${encodeURIComponent(keyword)}`
  );

  if (data?.data) return data.data;

  // Fallback to local search
  const fallback = await getFallbackSongs();
  const lowerKeyword = keyword.toLowerCase();
  return fallback.filter(
    song =>
      song.title.toLowerCase().includes(lowerKeyword) ||
      song.artist.toLowerCase().includes(lowerKeyword)
  );
}

export async function getHotSongs(): Promise<Song[]> {
  const data = await fetchWithFallback<{ data: Song[] }>(
    `${API_BASE}/songs/hot`
  );

  if (data?.data) return data.data;

  const fallback = await getFallbackSongs();
  return fallback.slice(0, 5);
}

export async function getSongById(id: string): Promise<Song | null> {
  // Check fallback first
  const fallback = await getFallbackSongs();
  const found = fallback.find(s => s.id === id);
  if (found) return found;

  const data = await fetchWithFallback<{ data: Song }>(
    `${API_BASE}/songs/${id}`
  );

  return data?.data || null;
}

export async function importSongFromText(title: string, text: string): Promise<Song> {
  const lyrics = parseLyricText(text);

  return {
    id: crypto.randomUUID().slice(0, 9),
    title,
    artist: '未知艺术家',
    lyrics,
  };
}
