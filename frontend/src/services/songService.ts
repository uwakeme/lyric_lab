// Song service - handles song search and fallback data
import type { Song, LyricSection } from '../types';
import { parseLyricText } from './lyricService';

const API_BASE = '/api';

// Fallback songs for offline mode
const fallbackSongs: Song[] = [
  {
    id: 'fallback-1',
    title: '晴天',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's1',
        title: '主歌',
        lines: [
          { id: 'l1', text: '故事的小黄花', charCount: 7 },
          { id: 'l2', text: '从出生那年就飘着', charCount: 8 },
          { id: 'l3', text: '童年的荡秋千', charCount: 6 },
          { id: 'l4', text: '随记忆一直晃到现在', charCount: 9 },
        ],
      },
      {
        id: 's2',
        title: '副歌',
        lines: [
          { id: 'l5', text: '吹着前奏望着天空', charCount: 8 },
          { id: 'l6', text: '我想起花瓣试着掉落', charCount: 9 },
          { id: 'l7', text: '为你翘起二郎腿', charCount: 8 },
          { id: 'l8', text: '你在胸口练习', charCount: 7 },
        ],
      },
    ],
  },
  {
    id: 'fallback-2',
    title: '夜曲',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's3',
        title: '主歌',
        lines: [
          { id: 'l9', text: '一群嗜血的蚂蚁', charCount: 7 },
          { id: 'l10', text: '被腐肉所利用', charCount: 7 },
          { id: 'l11', text: '未开发的城市', charCount: 7 },
          { id: 'l12', text: '开出一朵花', charCount: 6 },
        ],
      },
      {
        id: 's4',
        title: '副歌',
        lines: [
          { id: 'l13', text: '我释怀地漂浮', charCount: 7 },
          { id: 'l14', text: '在美梦里', charCount: 5 },
          { id: 'l15', text: '群鸦在棠梨', charCount: 6 },
          { id: 'l16', text: '低唱着呜咽', charCount: 6 },
        ],
      },
    ],
  },
  {
    id: 'fallback-3',
    title: '稻香',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's5',
        title: '主歌',
        lines: [
          { id: 'l17', text: '赤脚在乡间道路上', charCount: 9 },
          { id: 'l18', text: '追着蜻蜓追着风', charCount: 8 },
          { id: 'l19', text: '心情像风筝翻滚', charCount: 9 },
          { id: 'l20', text: '恍惚在梦中', charCount: 6 },
        ],
      },
      {
        id: 's6',
        title: '副歌',
        lines: [
          { id: 'l21', text: '还记得你说家是唯一的城堡', charCount: 12 },
          { id: 'l22', text: '随着稻香河流继续奔跑', charCount: 11 },
          { id: 'l23', text: '微微笑小时候的梦我知道', charCount: 12 },
          { id: 'l24', text: '不要哭让萤火虫带着你逃跑', charCount: 12 },
        ],
      },
    ],
  },
  {
    id: 'fallback-4',
    title: '七里香',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's7',
        title: '主歌',
        lines: [
          { id: 'l25', text: '窗外的麻雀在电线杆上', charCount: 10 },
          { id: 'l26', text: '多utenberg', charCount: 5 },
          { id: 'l27', text: '你说居庸关', charCount: 5 },
          { id: 'l28', text: '我点名', charCount: 4 },
        ],
      },
      {
        id: 's8',
        title: '副歌',
        lines: [
          { id: 'l29', text: '雨过居庸关', charCount: 6 },
          { id: 'l30', text: '风走进山海关', charCount: 7 },
          { id: 'l31', text: '一价氢碘钾钠', charCount: 7 },
          { id: 'l32', text: '电子桐柏山', charCount: 6 },
        ],
      },
    ],
  },
  {
    id: 'fallback-5',
    title: '青花瓷',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's9',
        title: '主歌',
        lines: [
          { id: 'l33', text: '素胚勾勒出青花', charCount: 8 },
          { id: 'l34', text: '笔锋浓转淡', charCount: 6 },
          { id: 'l35', text: '瓶身描绘的牡丹', charCount: 8 },
          { id: 'l36', text: '一如你初妆', charCount: 6 },
        ],
      },
      {
        id: 's10',
        title: '副歌',
        lines: [
          { id: 'l37', text: '天青色等烟雨', charCount: 7 },
          { id: 'l38', text: '而我在等你', charCount: 6 },
          { id: 'l39', text: '炊烟袅袅升起', charCount: 7 },
          { id: 'l40', text: '隔江千万里', charCount: 6 },
        ],
      },
    ],
  },
  {
    id: 'fallback-6',
    title: '告白气球',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's11',
        title: '主歌',
        lines: [
          { id: 'l41', text: '塞纳河畔左岸的咖啡', charCount: 10 },
          { id: 'l42', text: '我手一杯品尝你的美', charCount: 10 },
          { id: 'l43', text: '忽然飘落的雨水', charCount: 8 },
          { id: 'l44', text: '落在手心里', charCount: 6 },
        ],
      },
      {
        id: 's12',
        title: '副歌',
        lines: [
          { id: 'l45', text: '亲爱的爱上你从那天起', charCount: 11 },
          { id: 'l46', text: '甜蜜的很难轻易忘记', charCount: 11 },
          { id: 'l47', text: '为了确认分析', charCount: 7 },
          { id: 'l48', text: '甜蜜同音期', charCount: 6 },
        ],
      },
    ],
  },
  {
    id: 'fallback-7',
    title: '简单爱',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's13',
        title: '主歌',
        lines: [
          { id: 'l49', text: '说不上很爱我', charCount: 7 },
          { id: 'l50', text: '其实都感觉笨拙', charCount: 8 },
          { id: 'l51', text: '秒以上都会着火', charCount: 8 },
          { id: 'l52', text: '慢慢走星期五', charCount: 7 },
        ],
      },
      {
        id: 's14',
        title: '副歌',
        lines: [
          { id: 'l53', text: '我想带你回我的家', charCount: 9 },
          { id: 'l54', text: '带你回我的外婆家', charCount: 9 },
          { id: 'l55', text: '一家子人淡如水', charCount: 8 },
          { id: 'l56', text: '永久永久在一起', charCount: 8 },
        ],
      },
    ],
  },
  {
    id: 'fallback-8',
    title: '发如雪',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's15',
        title: '主歌',
        lines: [
          { id: 'l57', text: '狼牙月伊人憔悴', charCount: 8 },
          { id: 'l58', text: '我举杯饮尽了雪', charCount: 8 },
          { id: 'l59', text: '谁陪谁又醉', charCount: 5 },
          { id: 'l60', text: '蜡炬已挥挥', charCount: 6 },
        ],
      },
      {
        id: 's16',
        title: '副歌',
        lines: [
          { id: 'l61', text: '繁华如三千东流水', charCount: 9 },
          { id: 'l62', text: '我只取一瓢你了解', charCount: 9 },
          { id: 'l63', text: '爱因为你就在那里', charCount: 9 },
          { id: 'l64', text: '遥远的东方有一条江', charCount: 11 },
        ],
      },
    ],
  },
  {
    id: 'fallback-9',
    title: '以父之名',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's17',
        title: '主歌',
        lines: [
          { id: 'l65', text: '微凉的晨雾弥散', charCount: 8 },
          { id: 'l66', text: '在额度操纵', charCount: 6 },
          { id: 'l67', text: '一丝淡淡温柔', charCount: 7 },
          { id: 'l68', text: '灌溉不朽', charCount: 5 },
        ],
      },
      {
        id: 's18',
        title: '副歌',
        lines: [
          { id: 'l69', text: '以父之名审判', charCount: 7 },
          { id: 'l70', text: '罪恶的影子', charCount: 6 },
          { id: 'l71', text: '超贝多芬之梦', charCount: 7 },
          { id: 'l72', text: '向婉转的黄', charCount: 6 },
        ],
      },
    ],
  },
  {
    id: 'fallback-10',
    title: '听妈妈的话',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's19',
        title: '主歌',
        lines: [
          { id: 'l73', text: '小朋友你是否有很多问号', charCount: 12 },
          { id: 'l74', text: '为什么别人在那看漫画', charCount: 11 },
          { id: 'l75', text: '我却在学画画对着钢琴说话', charCount: 13 },
          { id: 'l76', text: '别人在玩游戏', charCount: 7 },
        ],
      },
      {
        id: 's20',
        title: '副歌',
        lines: [
          { id: 'l77', text: '听妈妈的话晚点再恋爱吧', charCount: 11 },
          { id: 'l78', text: '未来由我来规划', charCount: 8 },
          { id: 'l79', text: '在凉凉的月光下', charCount: 8 },
          { id: 'l80', text: '我想让你更像妈妈', charCount: 9 },
        ],
      },
    ],
  },
];

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
  const lowerKeyword = keyword.toLowerCase();
  return fallbackSongs.filter(
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

  return fallbackSongs.slice(0, 5);
}

export async function getSongById(id: string): Promise<Song | null> {
  // Check fallback first
  const fallback = fallbackSongs.find(s => s.id === id);
  if (fallback) return fallback;

  const data = await fetchWithFallback<{ data: Song }>(
    `${API_BASE}/songs/${id}`
  );

  return data?.data || null;
}

export function getFallbackSongs(): Song[] {
  return fallbackSongs;
}

export async function importSongFromText(title: string, text: string): Promise<Song> {
  const lyrics = parseLyricText(text);

  return {
    id: Math.random().toString(36).substr(2, 9),
    title,
    artist: '未知艺术家',
    lyrics,
  };
}