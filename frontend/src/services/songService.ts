// Song service - handles song search and fallback data
import type { Song, LyricSection } from '../types';
import { parseLyricText } from './lyricService';

const API_BASE = '/api';

// Fallback songs for offline mode - complete lyrics
const fallbackSongs: Song[] = [
  {
    id: 'fallback-1',
    title: '晴天',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's1',
        title: '主歌1',
        lines: [
          { id: 'l1', text: '故事的小黄花', charCount: 6 },
          { id: 'l2', text: '从出生那年就飘着', charCount: 8 },
          { id: 'l3', text: '童年的荡秋千', charCount: 6 },
          { id: 'l4', text: '随记忆一直晃到现在', charCount: 10 },
        ],
      },
      {
        id: 's2',
        title: '主歌2',
        lines: [
          { id: 'l5', text: '那些我爱的人', charCount: 6 },
          { id: 'l6', text: '活在多少的笔尖上', charCount: 9 },
          { id: 'l7', text: '哼过哪些旋律', charCount: 6 },
          { id: 'l8', text: '永远是很好的倾听者', charCount: 10 },
        ],
      },
      {
        id: 's3',
        title: '副歌',
        lines: [
          { id: 'l9', text: '吹着前奏望着天空', charCount: 8 },
          { id: 'l10', text: '我想起花瓣试着掉落', charCount: 10 },
          { id: 'l11', text: '在一起的时候', charCount: 7 },
          { id: 'l12', text: '能不能再要点', charCount: 7 },
          { id: 'l13', text: '看着天空努力回想', charCount: 9 },
          { id: 'l14', text: '花瓣落下的形状', charCount: 8 },
          { id: 'l15', text: '像你的微笑', charCount: 5 },
        ],
      },
      {
        id: 's4',
        title: '主歌3',
        lines: [
          { id: 'l16', text: '好不容易按下暂停', charCount: 9 },
          { id: 'l17', text: '又回到过去', charCount: 5 },
          { id: 'l18', text: '想着如果能倒退', charCount: 7 },
          { id: 'l19', text: '我会把你收回', charCount: 7 },
        ],
      },
    ],
  },
  {
    id: 'fallback-2',
    title: '七里香',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's5',
        title: '主歌1',
        lines: [
          { id: 'l20', text: '窗外的麻雀在电线杆上站', charCount: 12 },
          { id: 'l21', text: '你说这句很有夏天的感觉', charCount: 12 },
          { id: 'l22', text: '手中的铅笔在纸上来来回回', charCount: 12 },
          { id: 'l23', text: '我弹出的和弦引起了胡思乱想', charCount: 14 },
        ],
      },
      {
        id: 's6',
        title: '主歌2',
        lines: [
          { id: 'l24', text: '我secsflkng', charCount: 10 },
          { id: 'l25', text: '我发会儿呆把你的豆腐嘴', charCount: 12 },
          { id: 'l26', text: '你的眼睛水里的棉花糖', charCount: 11 },
          { id: 'l27', text: '嚼着嚼着也会要醉了', charCount: 10 },
        ],
      },
      {
        id: 's7',
        title: '副歌',
        lines: [
          { id: 'l28', text: '雨下整夜我的爱溢出就像雨水', charCount: 14 },
          { id: 'l29', text: '窗台蝴蝶像诗里纷飞的美丽章节', charCount: 14 },
          { id: 'l30', text: '我接着写把永远爱你写进诗的结尾', charCount: 15 },
          { id: 'l31', text: '你是我唯一想要的了解', charCount: 11 },
          { id: 'l32', text: '那饱满的稻穗幸福了整个季节', charCount: 13 },
          { id: 'l33', text: '而你的脸颊像田熟透的苹果', charCount: 12 },
        ],
      },
    ],
  },
  {
    id: 'fallback-3',
    title: '夜曲',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's8',
        title: '主歌1',
        lines: [
          { id: 'l34', text: '一群嗜血的蚂蚁被腐肉所利用', charCount: 13 },
          { id: 'l35', text: '我是否城市化所开发的花朵', charCount: 13 },
          { id: 'l36', text: '未开发的城市开出一朵花', charCount: 11 },
          { id: 'l37', text: '枝叶都不剩的挖掘', charCount: 8 },
        ],
      },
      {
        id: 's9',
        title: '主歌2',
        lines: [
          { id: 'l38', text: '我想你想要的气氛', charCount: 8 },
          { id: 'l39', text: '什么都不会', charCount: 5 },
          { id: 'l40', text: '也无所谓', charCount: 4 },
          { id: 'l41', text: '我释怀地漂浮', charCount: 7 },
          { id: 'l42', text: '在恶梦里', charCount: 5 },
        ],
      },
      {
        id: 's10',
        title: '副歌',
        lines: [
          { id: 'l43', text: '一群嗜血的蚂蚁被腐肉所利用', charCount: 13 },
          { id: 'l44', text: '我是否城市化所开发的花朵', charCount: 13 },
          { id: 'l45', text: '未开发的城市开出一朵花', charCount: 11 },
          { id: 'l46', text: '枝叶都不剩的挖掘', charCount: 8 },
        ],
      },
    ],
  },
  {
    id: 'fallback-4',
    title: '稻香',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's11',
        title: '主歌1',
        lines: [
          { id: 'l47', text: '赤脚在乡间道路上追着蜻蜓追着风', charCount: 15 },
          { id: 'l48', text: '心情像风筝幻想双手散开', charCount: 11 },
          { id: 'l49', text: '想要的大雨泡着稻谷好香', charCount: 11 },
          { id: 'l50', text: '恍惚在梦中', charCount: 5 },
        ],
      },
      {
        id: 's12',
        title: '副歌',
        lines: [
          { id: 'l51', text: '还记得你说家是唯一的城堡', charCount: 12 },
          { id: 'l52', text: '随着稻香河流继续奔跑', charCount: 10 },
          { id: 'l53', text: '微微笑小时候的梦我知道', charCount: 11 },
          { id: 'l54', text: '不要哭让萤火虫带着你逃跑', charCount: 12 },
          { id: 'l55', text: '乡间的歌谣永远的依靠', charCount: 10 },
          { id: 'l56', text: '回家回到最初的美好', charCount: 10 },
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
        id: 's13',
        title: '主歌1',
        lines: [
          { id: 'l57', text: '素胚勾勒出青花笔锋浓转淡', charCount: 12 },
          { id: 'l58', text: '瓶身描绘的牡丹一如你初妆', charCount: 12 },
          { id: 'l59', text: '釉色渲染仕女图韵味被私藏', charCount: 12 },
          { id: 'l60', text: '而你嫣然的一笑如含苞待放', charCount: 12 },
        ],
      },
      {
        id: 's14',
        title: '副歌',
        lines: [
          { id: 'l61', text: '天青色等烟雨而我在等你', charCount: 11 },
          { id: 'l62', text: '炊烟袅袅升起隔江千万里', charCount: 11 },
          { id: 'l63', text: '在瓶底书刻隶一枚盘龙在云际', charCount: 13 },
          { id: 'l64', text: '临摹宋体落款时惦记着什么', charCount: 12 },
          { id: 'l65', text: '色白花青的锦鲤跃然于碗底', charCount: 12 },
          { id: 'l66', text: '炊烟袅袅升起隔江千万里', charCount: 12 },
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
        id: 's15',
        title: '主歌1',
        lines: [
          { id: 'l67', text: '塞纳河畔左岸的咖啡我手一杯', charCount: 12 },
          { id: 'l68', text: '品尝你的美留下唇印在加隆', charCount: 12 },
          { id: 'l69', text: '忽然飘落的雨水落在手心里', charCount: 12 },
          { id: 'l70', text: '这种感觉大约就是微微的想起', charCount: 13 },
        ],
      },
      {
        id: 's16',
        title: '副歌',
        lines: [
          { id: 'l71', text: '亲爱的爱上你从那天起', charCount: 10 },
          { id: 'l72', text: '甜蜜的很难轻易忘记', charCount: 10 },
          { id: 'l73', text: '呼吸频率有点相似', charCount: 8 },
          { id: 'l74', text: '就那么可以在一起', charCount: 8 },
          { id: 'l75', text: '亲爱的别太担心', charCount: 7 },
          { id: 'l76', text: '难道你不想要吗', charCount: 6 },
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
        id: 's17',
        title: '主歌1',
        lines: [
          { id: 'l77', text: '说不上很爱我', charCount: 6 },
          { id: 'l78', text: '其实都感觉笨拙', charCount: 7 },
          { id: 'l79', text: '秒以上都会着火', charCount: 7 },
          { id: 'l80', text: '慢慢星期五晚上', charCount: 6 },
        ],
      },
      {
        id: 's18',
        title: '副歌',
        lines: [
          { id: 'l81', text: '我想带你回我的外婆家', charCount: 10 },
          { id: 'l82', text: '一家子人淡如水', charCount: 6 },
          { id: 'l83', text: '永久永久在一起', charCount: 6 },
          { id: 'l84', text: '简单爱', charCount: 3 },
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
        id: 's19',
        title: '主歌1',
        lines: [
          { id: 'l85', text: '狼牙月伊人憔悴我举杯饮尽了雪', charCount: 13 },
          { id: 'l86', text: '谁陪谁又醉酒', charCount: 5 },
          { id: 'l87', text: '蜡炬已挥挥', charCount: 5 },
          { id: 'l88', text: '等不到完结', charCount: 5 },
        ],
      },
      {
        id: 's20',
        title: '副歌',
        lines: [
          { id: 'l89', text: '繁华如三千东流水', charCount: 8 },
          { id: 'l90', text: '我只取一瓢你了解', charCount: 8 },
          { id: 'l91', text: '爱因为你就在那里', charCount: 8 },
          { id: 'l92', text: '遥远的东方有一条江', charCount: 10 },
        ],
      },
    ],
  },
  {
    id: 'fallback-9',
    title: '听妈妈的话',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's21',
        title: '主歌1',
        lines: [
          { id: 'l93', text: '小朋友你是否有很多问号', charCount: 11 },
          { id: 'l94', text: '为什么别人在那看漫画我却在学画画', charCount: 15 },
          { id: 'l95', text: '对着钢琴说话', charCount: 5 },
          { id: 'l96', text: '别人在玩游戏', charCount: 6 },
        ],
      },
      {
        id: 's22',
        title: '副歌',
        lines: [
          { id: 'l97', text: '听妈妈的话晚点再恋爱吧', charCount: 10 },
          { id: 'l98', text: '未来由我来规划', charCount: 7 },
          { id: 'l99', text: '在凉凉的月光下', charCount: 7 },
          { id: 'l100', text: '努力就能够成功吗', charCount: 8 },
        ],
      },
    ],
  },
  {
    id: 'fallback-10',
    title: '夜的第七章',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's23',
        title: '主歌1',
        lines: [
          { id: 'l101', text: '打字机要推向的隔壁事情', charCount: 10 },
          { id: 'l102', text: '分工太精细失去对手', charCount: 8 },
          { id: 'l103', text: '失去意义', charCount: 4 },
        ],
      },
      {
        id: 's24',
        title: '主歌2',
        lines: [
          { id: 'l104', text: '凶手的影子猫的毛发', charCount: 8 },
          { id: 'l105', text: '在地图上一一结束', charCount: 7 },
          { id: 'l106', text: '永恒不灭的火焰', charCount: 7 },
        ],
      },
      {
        id: 's25',
        title: '副歌',
        lines: [
          { id: 'l107', text: '如果我转发有任何未解之谜', charCount: 11 },
          { id: 'l108', text: '我会彻底的重新来过', charCount: 9 },
          { id: 'l109', text: '香水全面唤醒', charCount: 6 },
          { id: 'l110', text: '这种问题太完美', charCount: 6 },
        ],
      },
    ],
  },
  {
    id: 'fallback-11',
    title: '蒲公英的约定',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's26',
        title: '主歌1',
        lines: [
          { id: 'l111', text: '小学篱芭边的蒲公英', charCount: 9 },
          { id: 'l112', text: '飘散着旧时的梦境', charCount: 8 },
          { id: 'l113', text: '和风扇一起叛逆', charCount: 7 },
          { id: 'l114', text: '我们的约定', charCount: 5 },
        ],
      },
      {
        id: 's27',
        title: '副歌',
        lines: [
          { id: 'l115', text: '将眉眼的思绪深锁', charCount: 7 },
          { id: 'l116', text: '等过了一个秋', charCount: 5 },
          { id: 'l117', text: '到吹散花朵的球迷', charCount: 7 },
          { id: 'l118', text: '你的唇印在风中', charCount: 7 },
        ],
      },
    ],
  },
  {
    id: 'fallback-12',
    title: '说好的幸福呢',
    artist: '周杰伦',
    lyrics: [
      {
        id: 's28',
        title: '主歌1',
        lines: [
          { id: 'l119', text: '你的绘画绘画话不存的爱', charCount: 10 },
          { id: 'l120', text: '我静静手抱着你之前', charCount: 8 },
          { id: 'l121', text: '却无话不说', charCount: 4 },
        ],
      },
      {
        id: 's29',
        title: '副歌',
        lines: [
          { id: 'l122', text: '说好的幸福呢', charCount: 5 },
          { id: 'l123', text: '我错了干涉棿棿', charCount: 6 },
          { id: 'l124', text: '泪流不止时', charCount: 5 },
          { id: 'l125', text: '抱紧你喔喔喔', charCount: 5 },
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