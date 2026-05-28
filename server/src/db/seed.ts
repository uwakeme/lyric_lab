// Database seed data - complete lyrics
import { prisma } from '../lib/prisma';

const seedSongs = [
  {
    title: '晴天',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '故事的小黄花' },
          { lineOrder: 1, lineText: '从出生那年就飘着' },
          { lineOrder: 2, lineText: '童年的荡秋千' },
          { lineOrder: 3, lineText: '随记忆一直晃到现在' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '主歌2',
        lines: [
          { lineOrder: 0, lineText: '那些我爱的人' },
          { lineOrder: 1, lineText: '活在多少的笔尖上' },
          { lineOrder: 2, lineText: '哼过哪些旋律' },
          { lineOrder: 3, lineText: '永远是很好的倾听者' },
        ],
      },
      {
        sectionOrder: 2,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '吹着前奏望着天空' },
          { lineOrder: 1, lineText: '我想起花瓣试着掉落' },
          { lineOrder: 2, lineText: '在一起的时候' },
          { lineOrder: 3, lineText: '能不能再要点' },
          { lineOrder: 4, lineText: '看着天空努力回想' },
          { lineOrder: 5, lineText: '花瓣落下的形状' },
          { lineOrder: 6, lineText: '像你的微笑' },
        ],
      },
      {
        sectionOrder: 3,
        sectionTitle: '主歌3',
        lines: [
          { lineOrder: 0, lineText: '好不容易按下暂停' },
          { lineOrder: 1, lineText: '又回到过去' },
          { lineOrder: 2, lineText: '想着如果能倒退' },
          { lineOrder: 3, lineText: '我会把你收回' },
        ],
      },
    ],
  },
  {
    title: '七里香',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '窗外的麻雀在电线杆上站' },
          { lineOrder: 1, lineText: '你说这句很有夏天的感觉' },
          { lineOrder: 2, lineText: '手中的铅笔在纸上来来回回' },
          { lineOrder: 3, lineText: '我弹出的和弦引起了胡思乱想' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '主歌2',
        lines: [
          { lineOrder: 0, lineText: '我只想用力甩开' },
          { lineOrder: 1, lineText: '我发会儿呆把你的豆腐嘴' },
          { lineOrder: 2, lineText: '你的眼睛水里的棉花糖' },
          { lineOrder: 3, lineText: '嚼着嚼着也会要醉了' },
        ],
      },
      {
        sectionOrder: 2,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '雨下整夜我的爱溢出就像雨水' },
          { lineOrder: 1, lineText: '窗台蝴蝶像诗里纷飞的美丽章节' },
          { lineOrder: 2, lineText: '我接着写把永远爱你写进诗的结尾' },
          { lineOrder: 3, lineText: '你是我唯一想要的了解' },
          { lineOrder: 4, lineText: '那饱满的稻穗幸福了整个季节' },
          { lineOrder: 5, lineText: '而你的脸颊像田熟透的苹果' },
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
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '一群嗜血的蚂蚁被腐肉所利用' },
          { lineOrder: 1, lineText: '我是否城市化所开发的花朵' },
          { lineOrder: 2, lineText: '未开发的城市开出一朵花' },
          { lineOrder: 3, lineText: '枝叶都不剩的挖掘' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '主歌2',
        lines: [
          { lineOrder: 0, lineText: '我想想要的气氛' },
          { lineOrder: 1, lineText: '什么都不会' },
          { lineOrder: 2, lineText: '也无所谓' },
          { lineOrder: 3, lineText: '我释怀地漂浮' },
          { lineOrder: 4, lineText: '在恶梦里' },
        ],
      },
      {
        sectionOrder: 2,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '我绝到永远在每个伸东的梦醒' },
          { lineOrder: 1, lineText: '分叉路的红绿灯' },
          { lineOrder: 2, lineText: '口是心非的人群' },
          { lineOrder: 3, lineText: '我在你的周围' },
          { lineOrder: 4, lineText: '贴近你的脸说晚安' },
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
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '赤脚在乡间道路上追着蜻蜓追着风' },
          { lineOrder: 1, lineText: '心情像风筝幻想双手散开' },
          { lineOrder: 2, lineText: '想要的大雨泡着稻谷好香' },
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
          { lineOrder: 4, lineText: '乡间的歌谣永远的依靠' },
          { lineOrder: 5, lineText: '回家回到最初的美好' },
        ],
      },
    ],
  },
  {
    title: '青花瓷',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '素胚勾勒出青花笔锋浓转淡' },
          { lineOrder: 1, lineText: '瓶身描绘的牡丹一如你初妆' },
          { lineOrder: 2, lineText: '釉色渲染仕女图韵味被私藏' },
          { lineOrder: 3, lineText: '而你嫣然的一笑如含苞待放' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '天青色等烟雨而我在等你' },
          { lineOrder: 1, lineText: '炊烟袅袅升起隔江千万里' },
          { lineOrder: 2, lineText: '在瓶底书刻隶一枚盘龙在云际' },
          { lineOrder: 3, lineText: '临摹宋体落款时惦记着什么' },
          { lineOrder: 4, lineText: '色白花青的锦鲤跃然于碗底' },
          { lineOrder: 5, lineText: '炊烟袅袅升起隔江千万里' },
        ],
      },
    ],
  },
  {
    title: '告白气球',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '塞纳河畔左岸的咖啡我手一杯' },
          { lineOrder: 1, lineText: '品尝你的美留下唇印在加隆' },
          { lineOrder: 2, lineText: '忽然飘落的雨水落在手心里' },
          { lineOrder: 3, lineText: '这种感觉大约就是微微的想起' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '亲爱的爱上你从那天起' },
          { lineOrder: 1, lineText: '甜蜜的很难轻易忘记' },
          { lineOrder: 2, lineText: '呼吸频率有点相似' },
          { lineOrder: 3, lineText: '就那么可以在一起' },
          { lineOrder: 4, lineText: '亲爱的别太担心' },
          { lineOrder: 5, lineText: '难道你不想要吗' },
        ],
      },
    ],
  },
  {
    title: '简单爱',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '说不上很爱我' },
          { lineOrder: 1, lineText: '其实都感觉笨拙' },
          { lineOrder: 2, lineText: '秒以上都会着火' },
          { lineOrder: 3, lineText: '慢慢星期五晚上' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '我想带你回我的外婆家' },
          { lineOrder: 1, lineText: '一家子人淡如水' },
          { lineOrder: 2, lineText: '永久永久在一起' },
          { lineOrder: 3, lineText: '简单爱' },
        ],
      },
    ],
  },
  {
    title: '发如雪',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '狼牙月伊人憔悴我举杯饮尽了雪' },
          { lineOrder: 1, lineText: '谁陪谁又醉酒' },
          { lineOrder: 2, lineText: '蜡炬已挥挥' },
          { lineOrder: 3, lineText: '等不到完结' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '繁华如三千东流水' },
          { lineOrder: 1, lineText: '我只取一瓢你了解' },
          { lineOrder: 2, lineText: '爱因为你就在那里' },
          { lineOrder: 3, lineText: '遥远的东方有一条江' },
        ],
      },
    ],
  },
  {
    title: '听妈妈的话',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '小朋友你是否有很多问号' },
          { lineOrder: 1, lineText: '为什么别人在那看漫画我却在学画画' },
          { lineOrder: 2, lineText: '对着钢琴说话' },
          { lineOrder: 3, lineText: '别人在玩游戏' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '听妈妈的话晚点再恋爱吧' },
          { lineOrder: 1, lineText: '未来由我来规划' },
          { lineOrder: 2, lineText: '在凉凉的月光下' },
          { lineOrder: 3, lineText: '努力就能够成功吗' },
        ],
      },
    ],
  },
  {
    title: '夜的第七章',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '打字机要推向的隔壁事情' },
          { lineOrder: 1, lineText: '分工太精细失去对手' },
          { lineOrder: 2, lineText: '失去意义' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '主歌2',
        lines: [
          { lineOrder: 0, lineText: '凶手的影子猫的毛发' },
          { lineOrder: 1, lineText: '在地图上一一结束' },
          { lineOrder: 2, lineText: '永恒不灭的火焰' },
        ],
      },
      {
        sectionOrder: 2,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '如果我转发有任何未解之谜' },
          { lineOrder: 1, lineText: '我会彻底的重新来过' },
          { lineOrder: 2, lineText: '香水全面唤醒' },
          { lineOrder: 3, lineText: '这种问题太完美' },
        ],
      },
    ],
  },
  {
    title: '蒲公英的约定',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '小学篱芭边的蒲公英' },
          { lineOrder: 1, lineText: '飘散着旧时的梦境' },
          { lineOrder: 2, lineText: '和风扇一起叛逆' },
          { lineOrder: 3, lineText: '我们的约定' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '将眉眼的思绪深锁' },
          { lineOrder: 1, lineText: '等过了一个秋' },
          { lineOrder: 2, lineText: '到吹散花朵的球迷' },
          { lineOrder: 3, lineText: '你的唇印在风中' },
        ],
      },
    ],
  },
  {
    title: '说好的幸福呢',
    artist: '周杰伦',
    lyrics: [
      {
        sectionOrder: 0,
        sectionTitle: '主歌1',
        lines: [
          { lineOrder: 0, lineText: '你的绘画绘画话不存的爱' },
          { lineOrder: 1, lineText: '我静静手抱着你之前' },
          { lineOrder: 2, lineText: '却无话可说' },
        ],
      },
      {
        sectionOrder: 1,
        sectionTitle: '副歌',
        lines: [
          { lineOrder: 0, lineText: '说好的幸福呢' },
          { lineOrder: 1, lineText: '我错了干涉棿棿' },
          { lineOrder: 2, lineText: '泪流不止时' },
          { lineOrder: 3, lineText: '抱紧你喔喔喔' },
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