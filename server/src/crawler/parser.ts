// Lyrics text parser and cleaner
export function parseAndCleanLyrics(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Normalize line endings
  text = text.replace(/\r\n/g, '\n');
  text = text.replace(/\r/g, '\n');

  // Remove excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  // Trim each line
  text = text
    .split('\n')
    .map(line => line.trim())
    .join('\n');

  return text;
}

export function detectSections(text: string): Array<{ title: string; lines: string[] }> {
  const lines = text.split('\n');
  const sections: Array<{ title: string; lines: string[] }> = [];

  let currentSection = { title: '主歌', lines: [] as string[] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for section header
    const sectionMatch = trimmed.match(/^\[(.+?)\]$/);
    if (sectionMatch) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: sectionMatch[1], lines: [] };
      continue;
    }

    currentSection.lines.push(trimmed);
  }

  // Don't forget the last section
  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

export function formatAsLyricText(sections: Array<{ title: string; lines: string[] }>): string {
  return sections
    .map(section => {
      const header = `[${section.title}]`;
      const content = section.lines.join('\n');
      return `${header}\n${content}`;
    })
    .join('\n\n');
}