// Pinyin utility using pinyin-pro
import { pinyin as pinyinPro } from 'pinyin-pro';

interface PinyinResult {
  shengmu: string;
  yunmu: string;
  tone: number;
  full: string;
}

/**
 * 韵基归一化：介音（韵头）不参与押韵，复合韵母折算到所属韵类。
 * 词库的 12 个韵类按十三辙归组，此处映射与其一一对应：
 * ang 含 iang/uang（江阳）、ai 含 uai（怀来）、ei 含 ui/uei（灰堆）、
 * ou 含 iu/iou（由求）、an 含 ian/uan/üan（言前）、en 含 in/un/ün（人辰）、
 * ong 含 eng/iong（中东）、ie 含 üe/ue（乜斜）、ao 含 iao（遥条）。
 */
const YUNMU_BASE: Record<string, string> = {
  iang: 'ang',
  uang: 'ang',
  uai: 'ai',
  ui: 'ei',   // ui 是 uei 的简写
  uei: 'ei',
  ve: 'ie',   // 兼容 üe 的替代写法
  üe: 'ie',
  ue: 'ie',
  iu: 'ou',   // iu 是 iou 的简写
  iou: 'ou',
  ian: 'an',
  uan: 'an',
  üan: 'an',
  in: 'en',
  un: 'en',
  ün: 'en',
  eng: 'ong',
  iong: 'ong',
  iao: 'ao',
  ia: 'a',
  ua: 'a',
  uo: 'o',
};

export function getPinyin(char: string): PinyinResult | null {
  try {
    // full 形如 "guang1"；轻声声调为 0（如 "a0"）
    const full = pinyinPro(char, { toneType: 'num', type: 'string' });
    if (!full || full === 'none') return null;
    const toneMatch = full.match(/(\d)$/);
    if (!toneMatch) return null;

    // 用结构化 API 切分声母/韵母，避免手写正则切错 zh/ch/sh 和复合韵母
    const shengmu = pinyinPro(char, { pattern: 'initial', toneType: 'none', type: 'string' }) || '';
    let rawYunmu = pinyinPro(char, { pattern: 'final', toneType: 'none', type: 'string' }) || '';
    // pinyin-pro 对 y 开头音节返回去介音形式（羊→ang、言→an），但单独的 ie 韵
    // （夜/叶/爷，full 形如 "ye4"）会返回 "e"，此处还原为 ie
    if (rawYunmu === 'e' && full.startsWith('y')) {
      rawYunmu = 'ie';
    }

    return {
      shengmu,
      // yunmu 存归一化后的韵基，供押韵分类精确匹配
      yunmu: YUNMU_BASE[rawYunmu] ?? rawYunmu,
      tone: parseInt(toneMatch[1]),
      full,
    };
  } catch {
    return null;
  }
}

export function getTone(pinyin: PinyinResult): number {
  return pinyin.tone;
}

export function isPing(pinyin: PinyinResult): boolean {
  // 1st and 2nd tones are "ping" (level)
  return pinyin.tone === 1 || pinyin.tone === 2;
}

export function isZe(pinyin: PinyinResult): boolean {
  // 3rd and 4th tones are "ze" (oblique)
  return pinyin.tone === 3 || pinyin.tone === 4;
}

export function getLastCharPinyin(text: string): PinyinResult | null {
  // 去掉零宽空格占位符（U+200B），避免它们被当作"最后一个字符"
  const cleaned = text.replace(/​/g, '');
  const lastChar = cleaned.trim().slice(-1);
  if (!lastChar) return null;

  // Check if it's a Chinese character
  if (/[一-龥]/.test(lastChar)) {
    return getPinyin(lastChar);
  }

  return null;
}

export function extractYunmu(pinyin: PinyinResult): string {
  return pinyin.yunmu;
}

export function extractShengmu(pinyin: PinyinResult): string {
  return pinyin.shengmu;
}
