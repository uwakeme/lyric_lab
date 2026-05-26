// Character count utility
// Chinese characters, numbers, and English letters each count as 1
// Punctuation does not count

export function countChars(text: string): number {
  let count = 0;
  for (const char of text) {
    if (isCountableChar(char)) {
      count++;
    }
  }
  return count;
}

export function isCountableChar(char: string): boolean {
  // Chinese characters
  if (/[一-龥]/.test(char)) return true;
  // Numbers
  if (/[0-9]/.test(char)) return true;
  // English letters
  if (/[a-zA-Z]/.test(char)) return true;
  return false;
}

export function getCharCountStatus(
  count: number,
  min: number,
  max: number
): 'ok' | 'warning' | 'error' {
  if (count < min || count > max) return 'error';
  if (count === max) return 'warning';
  return 'ok';
}

export function formatCharCount(count: number, min: number, max: number): string {
  return `${count}/${max}`;
}