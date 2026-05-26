// Rhyme word library - organized by yunmu (finals)
import type { RhymeWord } from '../types';

export const rhymeWordLibrary: Record<string, RhymeWord[]> = {
  // "ang" rhyme
  ang: [
    { word: '方向', pinyin: 'fangxiang', yunmu: 'ang' },
    { word: '梦想', pinyin: 'mengxiang', yunmu: 'ang' },
    { word: '成长', pinyin: 'chengzhang', yunmu: 'ang' },
    { word: '希望', pinyin: 'xiwang', yunmu: 'ang' },
    { word: '飞翔', pinyin: 'feixiang', yunmu: 'ang' },
    { word: '远方', pinyin: 'yuanfang', yunmu: 'ang' },
    { word: '担当', pinyin: 'dandan', yunmu: 'ang' },
    { word: '沧桑', pinyin: 'cangshang', yunmu: 'ang' },
    { word: '漫长', pinyin: 'mmanchang', yunmu: 'ang' },
    { word: '闪耀', pinyin: 'shanyao', yunmu: 'ang' },
  ],
  // "i" rhyme
  i: [
    { word: '回忆', pinyin: 'huiyi', yunmu: 'i' },
    { word: '分离', pinyin: 'fenli', yunmu: 'i' },
    { word: '秘密', pinyin: 'mimi', yunmu: 'i' },
    { word: '珍惜', pinyin: 'zhenxi', yunmu: 'i' },
    { word: '距离', pinyin: 'juli', yunmu: 'i' },
    { word: '坚持', pinyin: 'jianchi', yunmu: 'i' },
    { word: '伤心', pinyin: 'shangxin', yunmu: 'i' },
    { word: '忘记', pinyin: 'wangji', yunmu: 'i' },
    { word: '日期', pinyin: 'riqi', yunmu: 'i' },
    { word: '机器', pinyin: 'jiqi', yunmu: 'i' },
  ],
  // "u" rhyme
  u: [
    { word: '旅途', pinyin: 'lvtu', yunmu: 'u' },
    { word: '孤独', pinyin: 'gudu', yunmu: 'u' },
    { word: '幸福', pinyin: 'xingfu', yunmu: 'u' },
    { word: '温度', pinyin: 'wendu', yunmu: 'u' },
    { word: '迷雾', pinyin: 'miwu', yunmu: 'u' },
    { word: '当初', pinyin: 'dangchu', yunmu: 'u' },
    { word: '读书', pinyin: 'dushu', yunmu: 'u' },
    { word: '满足', pinyin: 'manzu', yunmu: 'u' },
    { word: '残酷', pinyin: 'kuhan', yunmu: 'u' },
    { word: '无辜', pinyin: 'wugu', yunmu: 'u' },
  ],
  // "ai" rhyme
  ai: [
    { word: '未来', pinyin: 'weilai', yunmu: 'ai' },
    { word: '现在', pinyin: 'xianzai', yunmu: 'ai' },
    { word: '等待', pinyin: 'dengdai', yunmu: 'ai' },
    { word: '无奈', pinyin: 'wunai', yunmu: 'ai' },
    { word: '失败', pinyin: 'shibai', yunmu: 'ai' },
    { word: '相爱', pinyin: 'xiangai', yunmu: 'ai' },
    { word: '伤害', pinyin: 'shanghai', yunmu: 'ai' },
    { word: '五彩', pinyin: 'wucai', yunmu: 'ai' },
    { word: '云彩', pinyin: 'yuncai', yunmu: 'ai' },
    { word: '黑白', pinyin: 'heibai', yunmu: 'ai' },
  ],
  // "ei" rhyme
  ei: [
    { word: '眼泪', pinyin: 'yanlei', yunmu: 'ei' },
    { word: '伤悲', pinyin: 'shangbei', yunmu: 'ei' },
    { word: '疲惫', pinyin: 'pibei', yunmu: 'ei' },
    { word: '追随', pinyin: 'zhuishui', yunmu: 'ei' },
    { word: '作为', pinyin: 'zuowei', yunmu: 'ei' },
    { word: '场合', pinyin: 'changhe', yunmu: 'ei' },
    { word: '惊雷', pinyin: 'jinglei', yunmu: 'ei' },
    { word: '春雷', pinyin: 'chunlei', yunmu: 'ei' },
    { word: '堡垒', pinyin: 'baolei', yunmu: 'ei' },
    { word: '花蕾', pinyin: 'hualei', yunmu: 'ei' },
  ],
  // "ou" rhyme
  ou: [
    { word: '自由', pinyin: 'ziyou', yunmu: 'ou' },
    { word: '朋友', pinyin: 'pengyou', yunmu: 'ou' },
    { word: '守候', pinyin: 'shouhou', yunmu: 'ou' },
    { word: '永久', pinyin: 'yongjiu', yunmu: 'ou' },
    { word: '出口', pinyin: 'chukou', yunmu: 'ou' },
    { word: '借口', pinyin: 'jiekou', yunmu: 'ou' },
    { word: '高楼', pinyin: 'gaolou', yunmu: 'ou' },
    { word: '海鸥', pinyin: 'haiou', yunmu: 'ou' },
    { word: '回眸', pinyin: 'huimou', yunmu: 'ou' },
    { word: '轻柔', pinyin: 'qingrou', yunmu: 'ou' },
  ],
};

export const yunmuCategories = Object.keys(rhymeWordLibrary);

export function getRhymeWords(yunmu: string): RhymeWord[] {
  return rhymeWordLibrary[yunmu] || [];
}

export function getAllRhymeWords(): Record<string, RhymeWord[]> {
  return rhymeWordLibrary;
}