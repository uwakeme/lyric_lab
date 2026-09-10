/**
 * 内置曲库生成脚本（仅公有领域歌曲）
 *
 * 运行：node scripts/buildFallbackSongs.mjs
 * 输出：frontend/src/services/fallbackSongs.json
 *
 * 版权原则：只收录歌词已进入公有领域的歌曲，歌词全文随代码分发：
 * - 古典诗词歌曲：词均为宋（含）以前作品，作者辞世远超 50 年
 * - 近代老歌：词作者李叔同（1942 卒）、刘半农（1934 卒）、田汉（1968 卒）、
 *   张寒晖（1946 卒）等，均已超过著作权保护期（终生 + 50 年）
 * - 传统民歌：无名氏集体创作
 * - 国际民谣：传统曲调或 19 世纪前词作（Newton 1807 卒、Burns 1796 卒、
 *   Weatherly 1929 卒）
 * 词仍在保护期内的流行歌曲不要加入本曲库（如需使用，由用户通过
 * 「手动导入」自行粘贴，或由后端爬虫抓取入库）。
 *
 * 修改曲库后重新运行本脚本即可。
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * 分类 -> 歌曲（sections 内为歌词全文，按行拆分）
 */
const CATALOG = [
  {
    category: '古典诗词',
    songs: [
      {
        title: '但愿人长久',
        artist: '邓丽君',
        source: '词：苏轼《水调歌头·明月几时有》（宋，公有领域）',
        sections: [
          { title: '上阕', lines: ['明月几时有？', '把酒问青天。', '不知天上宫阙，', '今夕是何年。', '我欲乘风归去，', '又恐琼楼玉宇，', '高处不胜寒。', '起舞弄清影，', '何似在人间。'] },
          { title: '下阕', lines: ['转朱阁，', '低绮户，', '照无眠。', '不应有恨、', '何事长向别时圆？', '人有悲欢离合，', '月有阴晴圆缺，', '此事古难全。', '但愿人长久，', '千里共婵娟。'] },
        ],
      },
      {
        title: '独上西楼',
        artist: '邓丽君',
        source: '词：李煜《相见欢·无言独上西楼》（南唐，公有领域）',
        sections: [
          { title: '相见欢', lines: ['无言独上西楼，', '月如钩。', '寂寞梧桐深院锁清秋。', '剪不断，', '理还乱，', '是离愁。', '别是一般滋味在心头。'] },
        ],
      },
      {
        title: '几多愁',
        artist: '邓丽君',
        source: '词：李煜《虞美人·春花秋月何时了》（南唐，公有领域）',
        sections: [
          { title: '上阕', lines: ['春花秋月何时了？', '往事知多少。', '小楼昨夜又东风，', '故国不堪回首月明中。'] },
          { title: '下阕', lines: ['雕栏玉砌应犹在，', '只是朱颜改。', '问君能有几多愁？', '恰似一江春水向东流。'] },
        ],
      },
      {
        title: '胭脂泪',
        artist: '邓丽君',
        source: '词：李煜《乌夜啼·林花谢了春红》（南唐，公有领域）',
        sections: [
          { title: '乌夜啼', lines: ['林花谢了春红，', '太匆匆。', '无奈朝来寒雨晚来风。', '胭脂泪，', '相留醉，', '几时重。', '自是人生长恨水长东。'] },
        ],
      },
      {
        title: '芳草无情',
        artist: '邓丽君',
        source: '词：范仲淹《苏幕遮·碧云天》（宋，公有领域）',
        sections: [
          { title: '上阕', lines: ['碧云天，', '黄叶地，', '秋色连波，', '波上寒烟翠。', '山映斜阳天接水，', '芳草无情，', '更在斜阳外。'] },
          { title: '下阕', lines: ['黯乡魂，', '追旅思，', '夜夜除非，', '好梦留人睡。', '明月楼高休独倚，', '酒入愁肠，', '化作相思泪。'] },
        ],
      },
      {
        title: '清夜悠悠',
        artist: '邓丽君',
        source: '词：秦观《桃源忆故人·玉楼深锁薄情种》（宋，公有领域）',
        sections: [
          { title: '上阕', lines: ['玉楼深锁薄情种，', '清夜悠悠谁共？', '羞见枕衾鸳凤，', '闷即和衣拥。'] },
          { title: '下阕', lines: ['无端画角严城动，', '惊破一番新梦。', '窗外月华霜重，', '听彻梅花弄。'] },
        ],
      },
      {
        title: '有谁知我此时情',
        artist: '邓丽君',
        source: '词：聂胜琼《鹧鸪天·别情》（宋，公有领域）',
        sections: [
          { title: '上阕', lines: ['玉惨花愁出凤城，', '莲花楼下柳青青。', '尊前一唱阳关曲，', '别个人人第五程。'] },
          { title: '下阕', lines: ['寻好梦，', '梦难成。', '有谁知我此时情。', '枕前泪共阶前雨，', '隔个窗儿滴到明。'] },
        ],
      },
      {
        title: '万叶千声',
        artist: '邓丽君',
        source: '词：欧阳修《玉楼春·别后不知君远近》（宋，公有领域）',
        sections: [
          { title: '上阕', lines: ['别后不知君远近，', '触目凄凉多少闷。', '渐行渐远渐无书，', '水阔鱼沉何处问。'] },
          { title: '下阕', lines: ['夜深风竹敲秋韵，', '万叶千声皆是恨。', '故欹单枕梦中寻，', '梦又不成灯又烬。'] },
        ],
      },
      {
        title: '人约黄昏后',
        artist: '邓丽君',
        source: '词：《生查子·元夕》（宋，公有领域）',
        sections: [
          { title: '上阕', lines: ['去年元夜时，', '花市灯如昼。', '月上柳梢头，', '人约黄昏后。'] },
          { title: '下阕', lines: ['今年元夜时，', '月与灯依旧。', '不见去年人，', '泪湿春衫袖。'] },
        ],
      },
      {
        title: '相看泪眼',
        artist: '邓丽君',
        source: '词：柳永《雨霖铃·寒蝉凄切》（宋，公有领域）',
        sections: [
          { title: '上阕', lines: ['寒蝉凄切，', '对长亭晚，', '骤雨初歇。', '都门帐饮无绪，', '留恋处、兰舟催发。', '执手相看泪眼，', '竟无语凝噎。', '念去去、千里烟波，', '暮霭沉沉楚天阔。'] },
          { title: '下阕', lines: ['多情自古伤离别，', '更那堪、冷落清秋节！', '今宵酒醒何处？', '杨柳岸、晓风残月。', '此去经年，', '应是良辰好景虚设。', '便纵有千种风情，', '更与何人说？'] },
        ],
      },
      {
        title: '欲说还休',
        artist: '邓丽君',
        source: '词：辛弃疾《丑奴儿·书博山道中壁》（宋，公有领域）',
        sections: [
          { title: '上阕', lines: ['少年不识愁滋味，', '爱上层楼。', '爱上层楼，', '为赋新词强说愁。'] },
          { title: '下阕', lines: ['而今识尽愁滋味，', '欲说还休。', '欲说还休，', '却道天凉好个秋。'] },
        ],
      },
      {
        title: '思君',
        artist: '邓丽君',
        source: '词：李之仪《卜算子·我住长江头》（宋，公有领域）',
        sections: [
          { title: '卜算子', lines: ['我住长江头，', '君住长江尾。', '日日思君不见君，', '共饮长江水。', '此水几时休，', '此恨何时已。', '只愿君心似我心，', '定不负相思意。'] },
        ],
      },
      {
        title: '月满西楼',
        artist: '安雯',
        source: '词：李清照《一剪梅·红藕香残玉簟秋》（宋，公有领域）',
        sections: [
          { title: '上阕', lines: ['红藕香残玉簟秋。', '轻解罗裳，', '独上兰舟。', '云中谁寄锦书来？', '雁字回时，', '月满西楼。'] },
          { title: '下阕', lines: ['花自飘零水自流。', '一种相思，', '两处闲愁。', '此情无计可消除，', '才下眉头，', '却上心头。'] },
        ],
      },
      {
        title: '满江红',
        artist: '罗文',
        source: '词：岳飞《满江红·怒发冲冠》（宋，公有领域）',
        sections: [
          { title: '上阕', lines: ['怒发冲冠，', '凭栏处、潇潇雨歇。', '抬望眼、仰天长啸，', '壮怀激烈。', '三十功名尘与土，', '八千里路云和月。', '莫等闲、', '白了少年头，', '空悲切！'] },
          { title: '下阕', lines: ['靖康耻，', '犹未雪。', '臣子恨，', '何时灭！', '驾长车，', '踏破贺兰山缺。', '壮志饥餐胡虏肉，', '笑谈渴饮匈奴血。', '待从头、', '收拾旧山河，', '朝天阙。'] },
        ],
      },
      {
        title: '滚滚长江东逝水',
        artist: '杨洪基',
        source: '词：杨慎《临江仙·滚滚长江东逝水》（明，公有领域）',
        sections: [
          { title: '上阕', lines: ['滚滚长江东逝水，', '浪花淘尽英雄。', '是非成败转头空。', '青山依旧在，', '几度夕阳红。'] },
          { title: '下阕', lines: ['白发渔樵江渚上，', '惯看秋月春风。', '一壶浊酒喜相逢。', '古今多少事，', '都付笑谈中。'] },
        ],
      },
    ],
  },
  {
    category: '经典老歌',
    songs: [
      {
        title: '送别',
        artist: '李叔同',
        source: '词：李叔同（1942 卒，公有领域）；曲：美国民谣 J.P.奥德威',
        sections: [
          { title: '主歌一', lines: ['长亭外，', '古道边，', '芳草碧连天。', '晚风拂柳笛声残，', '夕阳山外山。', '天之涯，', '地之角，', '知交半零落。', '一壶浊酒尽余欢，', '今宵别梦寒。'] },
          { title: '主歌二', lines: ['长亭外，', '古道边，', '芳草碧连天。', '问君此去几时来，', '来时莫徘徊。', '天之涯，', '地之角，', '知交半零落。', '人生难得是欢聚，', '惟有别离多。'] },
        ],
      },
      {
        title: '教我如何不想她',
        artist: '刘半农 词 / 赵元任 曲',
        source: '词：刘半农（1934 卒，公有领域）',
        sections: [
          { title: '主歌一', lines: ['天上飘着些微云，', '地上吹着些微风。', '啊！', '微风吹动了我头发，', '教我如何不想她？'] },
          { title: '主歌二', lines: ['月光恋爱着海洋，', '海洋恋爱着月光。', '啊！', '这般蜜也似的银夜，', '教我如何不想她？'] },
          { title: '主歌三', lines: ['水面落花慢慢流，', '水底鱼儿慢慢游。', '啊！', '燕子你说些什么话？', '教我如何不想她？'] },
          { title: '主歌四', lines: ['枯树在冷风里摇，', '野火在暮色中烧。', '啊！', '西天还有些儿残霞，', '教我如何不想她？'] },
        ],
      },
      {
        title: '大江东去',
        artist: '苏轼 词 / 青主 曲',
        source: '词：苏轼《念奴娇·赤壁怀古》（宋，公有领域）；曲：青主（1959 卒，公有领域）',
        sections: [
          { title: '上阕', lines: ['大江东去，', '浪淘尽、', '千古风流人物。', '故垒西边，', '人道是、', '三国周郎赤壁。', '乱石穿空，', '惊涛拍岸，', '卷起千堆雪。', '江山如画，', '一时多少豪杰。'] },
          { title: '下阕', lines: ['遥想公瑾当年，', '小乔初嫁了，', '雄姿英发。', '羽扇纶巾，', '谈笑间、', '樯橹灰飞烟灭。', '故国神游，', '多情应笑我，', '早生华发。', '人生如梦，', '一尊还酹江月。'] },
        ],
      },
      {
        title: '花非花',
        artist: '白居易 词 / 黄自 曲',
        source: '词：白居易《花非花》（唐，公有领域）；曲：黄自（1938 卒，公有领域）',
        sections: [
          { title: '花非花', lines: ['花非花，', '雾非雾。', '夜半来，', '天明去。', '来如春梦几多时？', '去似朝云无觅处。'] },
        ],
      },
      {
        title: '松花江上',
        artist: '张寒晖',
        source: '词曲：张寒晖（1946 卒，公有领域）',
        sections: [
          { title: '主歌', lines: ['我的家在东北松花江上，', '那里有森林煤矿，', '还有那满山遍野的大豆高粱。', '我的家在东北松花江上，', '那里有我的同胞，', '还有那衰老的爹娘。', '九一八！九一八！', '从那个悲惨的时候！', '脱离了我的家乡，', '抛弃那无尽的宝藏，', '流浪！流浪！', '整日价在关内，流浪！', '哪年？哪月？', '才能够回到我那可爱的故乡？', '哪年？哪月？', '才能够收回那无尽的宝藏？', '爹娘啊！爹娘啊！', '什么时候，', '才能欢聚一堂？'] },
        ],
      },
      {
        title: '天涯歌女',
        artist: '周璇',
        source: '词：田汉（1968 卒，公有领域）；曲：贺绿汀 编（据苏州民歌）',
        sections: [
          { title: '主歌一', lines: ['天涯呀海角，', '觅呀觅知音，', '小妹妹唱歌郎奏琴，', '郎呀，咱们俩是一条心。', '哎呀爱呀，', '郎呀，咱们俩是一条心。'] },
          { title: '主歌二', lines: ['家山呀北望，', '泪呀泪沾襟，', '小妹妹想郎直到今，', '郎呀，患难之交恩爱深。', '哎呀爱呀，', '郎呀，患难之交恩爱深。'] },
          { title: '主歌三', lines: ['人生呀谁不惜青春，', '小妹妹似线郎似针，', '郎呀，穿在一起不离分，', '哎呀爱呀，', '郎呀，穿在一起不离分。'] },
        ],
      },
      {
        title: '四季歌',
        artist: '周璇',
        source: '词：田汉（1968 卒，公有领域）',
        sections: [
          { title: '主歌一', lines: ['春季到来绿满窗，', '大姑娘窗下绣鸳鸯。', '忽然一阵无情棒，', '打得鸳鸯各一方。'] },
          { title: '主歌二', lines: ['夏季到来柳丝长，', '大姑娘漂泊到长江。', '江南江北风光好，', '怎及青纱起高粱。'] },
          { title: '主歌三', lines: ['秋季到来荷花香，', '大姑娘夜夜梦家乡。', '醒来不见爹娘面，', '只见窗前明月光。'] },
          { title: '主歌四', lines: ['冬季到来雪茫茫，', '寒衣做好送情郎。', '血肉筑出长城长，', '侬愿做当年小孟姜。'] },
        ],
      },
      {
        title: '茉莉花',
        artist: '江苏民歌',
        source: '中国传统民歌（公有领域）',
        sections: [
          { title: '主歌', lines: ['好一朵美丽的茉莉花，', '好一朵美丽的茉莉花，', '芬芳美丽满枝桠，', '又香又白人人夸。', '让我来将你摘下，', '送给别人家，', '茉莉花呀茉莉花。'] },
        ],
      },
      {
        title: '康定情歌',
        artist: '四川民歌',
        source: '中国传统民歌（公有领域）',
        sections: [
          { title: '主歌一', lines: ['跑马溜溜的山上，', '一朵溜溜的云哟。', '端端溜溜的照在，', '康定溜溜的城哟。', '月亮弯弯，', '康定溜溜的城哟。'] },
          { title: '主歌二', lines: ['李家溜溜的大姐，', '人才溜溜的好哟。', '张家溜溜的大哥，', '看上溜溜的她哟。', '月亮弯弯，', '看上溜溜的她哟。'] },
        ],
      },
    ],
  },
  {
    category: '国际经典',
    songs: [
      {
        title: 'Amazing Grace',
        artist: 'John Newton',
        source: '词：John Newton（1807 卒，公有领域）；传统曲调',
        sections: [
          { title: 'Verse 1', lines: ['Amazing grace, how sweet the sound', 'That saved a wretch like me', 'I once was lost, but now am found', 'Was blind, but now I see'] },
          { title: 'Verse 2', lines: ["'Twas grace that taught my heart to fear", 'And grace my fears relieved', 'How precious did that grace appear', 'The hour I first believed'] },
          { title: 'Verse 3', lines: ['Through many dangers, toils and snares', 'I have already come', "'Tis grace hath brought me safe thus far", 'And grace will lead me home'] },
        ],
      },
      {
        title: 'Auld Lang Syne',
        artist: 'Robert Burns',
        source: '词：Robert Burns（1796 卒，公有领域）',
        sections: [
          { title: 'Verse', lines: ['Should auld acquaintance be forgot', 'And never brought to mind', 'Should auld acquaintance be forgot', 'And auld lang syne'] },
          { title: 'Chorus', lines: ['For auld lang syne, my dear', 'For auld lang syne', "We'll tak a cup o' kindness yet", 'For auld lang syne'] },
        ],
      },
      {
        title: 'Scarborough Fair',
        artist: 'Traditional',
        source: '英格兰传统民谣（公有领域）',
        sections: [
          { title: 'Verse', lines: ['Are you going to Scarborough Fair', 'Parsley, sage, rosemary and thyme', 'Remember me to one who lives there', "'She once was a true love of mine'"] },
        ],
      },
      {
        title: 'Greensleeves',
        artist: 'Traditional',
        source: '英格兰传统民谣（公有领域）',
        sections: [
          { title: 'Verse', lines: ['Alas, my love, you do me wrong', 'To cast me off discourteously', 'For I have loved you well and long', 'Delighting in your company'] },
          { title: 'Chorus', lines: ['Greensleeves was all my joy', 'Greensleeves was my delight', 'Greensleeves was my heart of gold', "And who but my lady Greensleeves"] },
        ],
      },
      {
        title: 'Danny Boy',
        artist: 'Frederick Weatherly',
        source: '词：Frederick Weatherly（1929 卒，公有领域）；传统曲调 Londonderry Air',
        sections: [
          { title: 'Verse', lines: ['Oh Danny boy, the pipes, the pipes are calling', 'From glen to glen, and down the mountain side', "The summer's gone, and all the flowers are dying", "'Tis you, 'tis you must go and I must bide", "But come ye back when summer's in the meadow", 'Or when the valley\'s hushed and white with snow', "'Tis I'll be here in sunshine or in shadow", 'Oh Danny boy, oh Danny boy, I love you so'] },
        ],
      },
      {
        title: 'House of the Rising Sun',
        artist: 'Traditional',
        source: '英美传统民谣（公有领域）',
        sections: [
          { title: 'Verse', lines: ['There is a house in New Orleans', 'They call the Rising Sun', "And it's been the ruin of many a poor boy", "And God, I know I'm one"] },
        ],
      },
    ],
  },
];

/** 与前端 utils/charCount.ts 一致：汉字/数字/字母计 1，标点计 0 */
function countChars(text) {
  const cn = text.match(/[\u4e00-\u9fa5]/g)?.length ?? 0;
  const en = text.match(/[0-9a-zA-Z]/g)?.length ?? 0;
  return cn + en;
}

function buildSongs() {
  const songs = [];
  let index = 0;

  for (const { category, songs: entries } of CATALOG) {
    for (const entry of entries) {
      index += 1;
      const id = `fb-${String(index).padStart(3, '0')}`;
      songs.push({
        id,
        title: entry.title,
        artist: entry.artist,
        category,
        source: entry.source,
        lyrics: entry.sections.map((sec, si) => ({
          id: `${id}-s${si + 1}`,
          title: sec.title,
          lines: sec.lines.map((text, li) => ({
            id: `${id}-s${si + 1}-${li + 1}`,
            text,
            charCount: countChars(text),
            rhymeStatus: 'unchecked',
          })),
        })),
      });
    }
  }
  return songs;
}

const songs = buildSongs();

// 基本校验：数量下限 + 曲目（歌名+歌手）不重复 + 每首歌必须有歌词
if (songs.length < 20) {
  throw new Error(`曲库数量不足：${songs.length} < 20`);
}
const seen = new Set();
for (const s of songs) {
  const key = `${s.title}::${s.artist}`;
  if (seen.has(key)) throw new Error(`重复曲目：${key}`);
  seen.add(key);
  if (!s.lyrics.some(sec => sec.lines.length > 0)) {
    throw new Error(`歌曲无歌词：${s.title}`);
  }
}

const outFile = join(dirname(fileURLToPath(import.meta.url)), '../frontend/src/services/fallbackSongs.json');
writeFileSync(outFile, JSON.stringify(songs) + '\n', 'utf8');

console.log(`已生成 ${songs.length} 首内置歌曲（全部为公有领域歌词）-> ${outFile}`);
for (const { category, songs: entries } of CATALOG) {
  console.log(`  ${category}: ${entries.length} 首`);
}
