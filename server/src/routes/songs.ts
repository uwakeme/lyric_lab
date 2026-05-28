// Song routes
import { Router, Request, Response } from 'express';
import * as songService from '../services/songService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Search songs
router.get('/', async (req: Request, res: Response) => {
  try {
    const keyword = (req.query.keyword as string || '').slice(0, 100);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const songs = await songService.searchSongs(keyword, limit, offset);

    res.json({
      code: 0,
      data: songs,
    });
  } catch (err) {
    const statusCode = (err as AppError).statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: statusCode === 500 ? 'Internal server error' : (err as Error).message,
    });
  }
});

// Get hot songs
router.get('/hot', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const songs = await songService.getHotSongs(limit);

    res.json({
      code: 0,
      data: songs,
    });
  } catch (err) {
    const statusCode = (err as AppError).statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: statusCode === 500 ? 'Internal server error' : (err as Error).message,
    });
  }
});

// Get song by ID with lyrics
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const song = await songService.getSongById(id);

    if (!song) {
      throw new AppError('Song not found', 404);
    }

    const formatted = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      sourceUrl: song.sourceUrl,
      sourcePlatform: song.sourcePlatform,
      crawledAt: song.crawledAt,
      lyrics: groupLyricsBySection(song.lyrics),
    };

    res.json({
      code: 0,
      data: formatted,
    });
  } catch (err) {
    const statusCode = (err as AppError).statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: statusCode === 500 ? 'Internal server error' : (err as Error).message,
    });
  }
});

interface LyricLineData {
  id: string;
  sectionOrder: number;
  sectionTitle: string;
  lineOrder: number;
  lineText: string;
}

interface SectionData {
  id: string;
  title: string;
  lines: { id: string; text: string }[];
}

function groupLyricsBySection(lyrics: LyricLineData[]) {
  const sectionMap = new Map<number, SectionData>();

  for (const line of lyrics) {
    let section = sectionMap.get(line.sectionOrder);
    if (!section) {
      section = {
        id: `section-${line.sectionOrder}`,
        title: line.sectionTitle,
        lines: [],
      };
      sectionMap.set(line.sectionOrder, section);
    }
    section.lines.push({
      id: line.id,
      text: line.lineText,
    });
  }

  return Array.from(sectionMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, section]) => section);
}

export default router;
