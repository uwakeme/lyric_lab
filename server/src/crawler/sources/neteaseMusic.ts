// NetEase Music lyrics crawler adapter
// Note: This is a placeholder - actual implementation would need to handle anti-scraping measures

interface NetEaseSong {
  id: number;
  name: string;
  artists: Array<{ name: string }>;
}

export async function fetchHotSongs(limit: number = 50): Promise<Array<{
  title: string;
  artist: string;
  lyrics: string;
}>> {
  // Placeholder implementation
  // In production, this would need to handle NetEase Music's API and anti-bot measures
  console.log('NetEase Music crawler placeholder called');

  return [];
}

export async function fetchLyric(songId: string): Promise<string | null> {
  // Placeholder implementation
  return null;
}