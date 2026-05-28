// Crawler service - lyrics crawling logic
import { prisma } from '../lib/prisma';
import * as songService from './songService';

interface CrawlResult {
  platform: string;
  status: 'success' | 'failed' | 'partial';
  songsFound: number;
  error?: string;
}

export async function crawlFromSource(
  platform: string,
  fetcher: (limit: number) => Promise<Array<{ title: string; artist: string; lyrics: string }>>
): Promise<CrawlResult> {
  let songsFound = 0;
  let status: 'success' | 'failed' | 'partial' = 'success';
  let errorMessage: string | undefined;

  try {
    const songs = await fetcher(50);

    for (const song of songs) {
      try {
        const exists = await songService.songExists(song.title, song.artist);

        if (exists) {
          const existing = await prisma.song.findFirst({
            where: { title: song.title, artist: song.artist },
          });
          if (existing) {
            await songService.updateSongCrawledAt(existing.id);
          }
          continue;
        }

        const parsedLyrics = parseLyricsText(song.lyrics);

        await songService.createSong(
          song.title,
          song.artist,
          parsedLyrics,
          platform
        );

        songsFound++;
      } catch (err) {
        console.error(`Failed to process song "${song.title}":`, err);
      }
    }
  } catch (err) {
    status = 'failed';
    errorMessage = err instanceof Error ? err.message : 'Unknown error';
  }

  await prisma.crawlLog.create({
    data: {
      platform,
      status,
      songsFound,
      errorMessage,
    },
  });

  return { platform, status, songsFound, error: errorMessage };
}

function parseLyricsText(text: string): Array<{
  sectionOrder: number;
  sectionTitle: string;
  lineOrder: number;
  lineText: string;
}> {
  const result: Array<{
    sectionOrder: number;
    sectionTitle: string;
    lineOrder: number;
    lineText: string;
  }> = [];

  const lines = text.split('\n');
  let currentSection = 0;
  let sectionTitle = '主歌';
  let lineOrder = 0;
  let hasSectionHeader = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const sectionMatch = trimmed.match(/^\[(.+?)\]$/);
    if (sectionMatch) {
      if (hasSectionHeader) {
        currentSection++;
      }
      hasSectionHeader = true;
      sectionTitle = sectionMatch[1];
      lineOrder = 0;
      continue;
    }

    result.push({
      sectionOrder: currentSection,
      sectionTitle,
      lineOrder,
      lineText: trimmed,
    });
    lineOrder++;
  }

  return result;
}

export async function getCrawlLogs(limit = 10) {
  return prisma.crawlLog.findMany({
    orderBy: { crawledAt: 'desc' },
    take: limit,
  });
}

export async function getCrawlStats() {
  const [totalSongs, lastCrawl] = await Promise.all([
    songService.getSongCount(),
    prisma.crawlLog.findFirst({
      orderBy: { crawledAt: 'desc' },
      select: { crawledAt: true, platform: true, songsFound: true },
    }),
  ]);

  return { totalSongs, lastCrawl };
}
