// 歌词行有效文本工具
import type { LyricLine } from '../types';

/** 去掉零宽空格占位符（U+200B，编辑器字框 PAD） */
export function stripPads(text: string): string {
  return text.replace(/\u200b/g, '');
}

/** 一行的有效歌词：改编词优先，回退原词，并去掉零宽占位符 */
export function getEffectiveText(line: Pick<LyricLine, 'text' | 'adaptedText'>): string {
  return stripPads(line.adaptedText ?? line.text ?? '');
}
