// Rhyme service - rhyme detection logic
import type { RhymeRule, LyricLine } from '../types';
import { getLastCharPinyin, isPing, isZe, extractYunmu } from '../utils/pinyin';

export interface RhymeCheckResult {
  lineId: string;
  status: 'match' | 'mismatch' | 'unchecked';
  expected?: string;
  actual?: string;
  message?: string;
}

export function checkRhyme(
  line: LyricLine,
  rule: RhymeRule,
  textToCheck?: string
): RhymeCheckResult {
  const result: RhymeCheckResult = {
    lineId: line.id,
    status: 'unchecked',
  };

  if (rule.type === 'none') {
    result.status = 'unchecked';
    return result;
  }

  // 去掉零宽空格占位符（U+200B），避免影响押韵检测
  const text = (textToCheck ?? line.adaptedText ?? line.text).replace(/​/g, '');
  const pinyin = getLastCharPinyin(text);
  if (!pinyin) {
    result.status = 'unchecked';
    return result;
  }

  switch (rule.type) {
    case 'yunmu':
      if (rule.value) {
        const actualYunmu = extractYunmu(pinyin);
        if (actualYunmu === rule.value) {
          result.status = 'match';
        } else {
          result.status = 'mismatch';
          result.expected = rule.value;
          result.actual = actualYunmu;
          result.message = `韵母不符：期望 "${rule.value}"，实际 "${actualYunmu}"`;
        }
      }
      break;

    case 'ping':
      if (isPing(pinyin)) {
        result.status = 'match';
      } else {
        result.status = 'mismatch';
        result.expected = '平声（1、2声）';
        result.actual = `仄声（${pinyin.tone}声）`;
        result.message = `声调不符：期望平声，实际${pinyin.tone}声`;
      }
      break;

    case 'ze':
      if (isZe(pinyin)) {
        result.status = 'match';
      } else {
        result.status = 'mismatch';
        result.expected = '仄声（3、4声）';
        result.actual = `平声（${pinyin.tone}声）`;
        result.message = `声调不符：期望仄声，实际${pinyin.tone}声`;
      }
      break;
  }

  return result;
}

export function checkAllRhymes(
  lines: LyricLine[],
  rule: RhymeRule
): RhymeCheckResult[] {
  return lines.map(line => checkRhyme(line, rule));
}

export function calculateRhymeSuccessRate(
  results: RhymeCheckResult[]
): { total: number; matched: number; rate: number } {
  const checked = results.filter(r => r.status !== 'unchecked');
  const matched = checked.filter(r => r.status === 'match');

  return {
    total: checked.length,
    matched: matched.length,
    rate: checked.length > 0 ? matched.length / checked.length : 0,
  };
}

export function getRhymeTypeLabel(rule: RhymeRule): string {
  switch (rule.type) {
    case 'none':
      return '无押韵';
    case 'yunmu':
      return `押韵：${rule.value}`;
    case 'ping':
      return '平声尾';
    case 'ze':
      return '仄声尾';
    default:
      return '未知';
  }
}