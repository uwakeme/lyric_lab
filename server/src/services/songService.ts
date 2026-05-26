// Song service - database operations for songs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SongWithLyrics {
  id: string;
  title: string;
  artist: string;
  sourceUrl: string | null;
  sourcePlatform: string | null;
  crawledAt: Date;
  lyrics: {
    id: string;
    sectionOrder: number;
    sectionTitle: string;
    lineOrder: number;
    lineText: string;
  }[];
}

export async function searchSongs(keyword: string, limit = 20, offset = 0) {
  const songs = await prisma.song.findMany({
    where: {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { artist: { contains: keyword, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      title: true,
      artist: true,
      sourcePlatform: true,
      crawledAt: true,
    },
    orderBy: { crawledAt: 'desc' },
    take: limit,
    skip: offset,
  });

  return songs;
}

export async function getHotSongs(limit = 10) {
  return prisma.song.findMany({
    select: {
      id: true,
      title: true,
      artist: true,
      sourcePlatform: true,
      crawledAt: true,
    },
    orderBy: { crawledAt: 'desc' },
    take: limit,
  });
}

export async function getSongById(id: string): Promise<SongWithLyrics | null> {
  const song = await prisma.song.findUnique({
    where: { id },
    include: {
      lyrics: {
        orderBy: [{ sectionOrder: 'asc' }, { lineOrder: 'asc' }],
      },
    },
  });

  return song;
}

export async function createSong(
  title: string,
  artist: string,
  lyrics: Array<{
    sectionOrder: number;
    sectionTitle: string;
    lineOrder: number;
    lineText: string;
  }>,
  sourcePlatform?: string,
  sourceUrl?: string
) {
  return prisma.song.create({
    data: {
      title,
      artist,
      sourcePlatform,
      sourceUrl,
      lyrics: {
        create: lyrics,
      },
    },
  });
}

export async function songExists(title: string, artist: string): Promise<boolean> {
  const count = await prisma.song.count({
    where: { title, artist },
  });
  return count > 0;
}

export async function updateSongCrawledAt(id: string) {
  return prisma.song.update({
    where: { id },
    data: { crawledAt: new Date() },
  });
}

export async function getSongCount(): Promise<number> {
  return prisma.song.count();
}