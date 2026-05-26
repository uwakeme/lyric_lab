// QQ Music lyrics crawler adapter
// Note: This is a placeholder - actual implementation would need to handle anti-scraping measures

interface QQMusicSong {
  songmid: string;
  songname: string;
  singer: Array<{ name: string }>;
}

interface QQMusicLyric {
  lyric: string;
}

export async function fetchHotSongs(limit: number = 50): Promise<Array<{
  title: string;
  artist: string;
  lyrics: string;
}>> {
  // Placeholder implementation
  // In production, this would need to handle QQ Music's API and anti-bot measures
  console.log('QQ Music crawler placeholder called');

  return [];
}

export async function fetchLyric(songId: string): Promise<string | null> {
  // Placeholder implementation
  return null;
}