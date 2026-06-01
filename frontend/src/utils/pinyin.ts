// Pinyin utility using pinyin-pro
import { pinyin as pinyinPro } from 'pinyin-pro';

interface PinyinResult {
  shengmu: string;
  yunmu: string;
  tone: number;
  full: string;
}

export function getPinyin(char: string): PinyinResult | null {
  try {
    const result = pinyinPro(char, { toneType: 'num' });
    if (!result || result === 'none') return null;

    // Parse pinyin result (e.g., "zhang" -> shengmu: "zh", yunmu: "ang", tone: 1)
    const match = result.match(/^([a-z]+?)([a-z]+)(\d)$/);
    if (!match) return null;

    return {
      shengmu: match[1],
      yunmu: match[2],
      tone: parseInt(match[3]),
      full: result,
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