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

  // 离线兜底：按分类轮询取样，让热门列表覆盖各个曲库分类
  const fallback = await getFallbackSongs();
  const groups = new Map<string, Song[]>();
  for (const song of fallback) {
    const key = song.category ?? '';
    const list = groups.get(key);
    if (list) list.push(song);
    else groups.set(key, [song]);
  }

  const hot: Song[] = [];
  const groupList = [...groups.values()];
  const rounds = Math.max(0, ...groupList.map(g => g.length));
  for (let i = 0; i < rounds && hot.length < 10; i++) {
    for (const g of groupList) {
      if (g[i]) hot.push(g[i]);
      if (hot.length >= 10) break;
    }
  }
  return hot;
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
