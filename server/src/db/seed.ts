// Database seed data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedSongs = [
  {
    title: '晴天',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌',
        lines: [
          { lineOrder: 0, lineText: '故事的小黄花' },
          { lineOrder: 1, lineText: '从出生那年就飘着' },
          { lineOrder: 2, lineText: '童年的荡秋千' },
          { lineOrder: 3, lineText: '随记忆一直晃到现在' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '吹着前奏望着天空' },
          { lineOrder: 1, lineText: '我想起花瓣试着掉落' },
          { lineOrder: 2, lineText: '为你翘起二郎腿' },
          { lineOrder: 3, lineText: '你在胸口练习' },
        ],
      },
    ],
  },
  {
    title: '夜曲',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌',
        lines: [
          { lineOrder: 0, lineText: '一群嗜血的蚂蚁' },
          { lineOrder: 1, lineText: '被腐肉所利用' },
          { lineOrder: 2, lineText: '未开发的城市' },
          { lineOrder: 3, lineText: '开出一朵花' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '我释怀地漂浮' },
          { lineOrder: 1, lineText: '在美梦里' },
          { lineOrder: 2, lineText: '群鸦在棠梨' },
          { lineOrder: 3, lineText: '低唱着呜咽' },
        ],
      },
    ],
  },
  {
    title: '稻香',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌',
        lines: [
          { lineOrder: 0, lineText: '赤脚在乡间道路上' },
          { lineOrder: 1, lineText: '追着蜻蜓追着风' },
          { lineOrder: 2, lineText: '心情像风筝翻滚' },
          { lineOrder: 3, lineText: '恍惚在梦中' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '还记得你说家是唯一的城堡' },
          { lineOrder: 1, lineText: '随着稻香河流继续奔跑' },
          { lineOrder: 2, lineText: '微微笑小时候的梦我知道' },
          { lineOrder: 3, lineText: '不要哭让萤火虫带着你逃跑' },
        ],
      },
    ],
  },
];

async function main() {
  console.log('Seeding database...');

  for (const songData of seedSongs) {
    const { lyrics, ...songInfo } = songData;

    // Check if song already exists
    const existing = await prisma.song.findFirst({
      where: { title: songInfo.title, artist: songInfo.artist },
    });

    if (existing) {
      console.log(`Song "${songInfo.title}" already exists, skipping...`);
      continue;
    }

    const song = await prisma.song.create({
      data: {
        title: songInfo.title,
        artist: songInfo.artist,
        sourcePlatform: 'seed',
        lyrics: {
          create: lyrics.flatMap(section =>
            section.lines.map(line => ({
              sectionOrder: section.sectionOrder,
              sectionTitle: section.sectionTitle,
              lineOrder: line.lineOrder,
              lineText: line.lineText,
            }))
          ),
        },
      },
    });

    console.log(`Created song: ${song.title}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());