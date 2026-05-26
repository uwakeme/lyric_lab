// Song routes
import { Router, Request, Response } from 'express';
import * as songService from '../services/songService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Search songs
router.get('/', async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword as string || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
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
      message: (err as Error).message,
    });
  }
});

// Get hot songs
router.get('/hot', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const songs = await songService.getHotSongs(limit);

    res.json({
      code: 0,
      data: songs,
    });
  } catch (err) {
    const statusCode = (err as AppError).statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: (err as Error).message,
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

    // Format response
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
      message: (err as Error).message,
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
  const sections: Record<string, SectionData> = {};

  for (const line of lyrics) {
    const key = line.sectionTitle;
    if (!sections[key]) {
      sections[key] = {
        id: `section-${line.sectionOrder}`,
        title: line.sectionTitle,
        lines: [],
      };
    }
    sections[key].lines.push({
      id: line.id,
      text: line.lineText,
    });
  }

  return Object.values(sections);
}

export default router;