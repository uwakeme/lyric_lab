// Export service - handles TXT, LRC, HTML export
import type { Song, ExportFormat } from '../types';

function generateExportFileName(title: string, format: ExportFormat): string {
  const date = new Date().toISOString().slice(0, 10);
  const safeTitle = title.replace(/[^a-zA-Z0-9一-龥]/g, '_');
  return `${safeTitle}_${date}.${format === 'lrc-simple' ? 'lrc' : format}`;
}

export function exportToTXT(song: Song): void {
  let content = `${song.title} - ${song.artist}\n\n`;

  for (const section of song.lyrics) {
    content += `[${section.title}]\n`;
    for (const line of section.lines) {
      content += `${line.text}\n`;
    }
    content += '\n';
  }

  downloadBlob(content, generateExportFileName(song.title, 'txt'), 'text/plain');
}

export function exportToLRC(song: Song, withTimestamps: boolean = true): void {
  let content = `[ti:${song.title}]\n`;
  content += `[ar:${song.artist}]\n`;
  content += `[by:Lyric Lab]\n`;
  content += `[al:${song.title}]\n\n`;

  let timestamp = 0;
  const secondsPerLine = 5;

  for (const section of song.lyrics) {
    content += `[${section.title}]\n`;
    for (const line of section.lines) {
      if (withTimestamps) {
        const mins = Math.floor(timestamp / 60);
        const secs = timestamp % 60;
        const ms = 0;
        content += `[${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}]`;
        timestamp += secondsPerLine;
      }
      content += `${line.text}\n`;
    }
  }

  downloadBlob(content, generateExportFileName(song.title, 'lrc'), 'text/plain');
}

export function exportToLRCSimple(song: Song): void {
  let content = `${song.title} - ${song.artist}\n\n`;

  for (const section of song.lyrics) {
    content += `[${section.title}]\n`;
    for (const line of section.lines) {
      content += `${line.text}\n`;
    }
    content += '\n';
  }

  downloadBlob(content, generateExportFileName(song.title, 'lrc-simple'), 'text/plain');
}

export function exportToHTML(song: Song): void {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(song.title)} - ${escapeHtml(song.artist)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container {
      max-width: 600px;
      width: 100%;
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .title {
      font-size: 2rem;
      color: #fff;
      margin-bottom: 0.5rem;
    }
    .artist {
      font-size: 1.1rem;
      color: #a0aec0;
    }
    .lyrics {
      background: rgba(255,255,255,0.95);
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    .section {
      margin-bottom: 1.5rem;
    }
    .section-title {
      font-size: 1rem;
      color: #6366f1;
      margin-bottom: 0.75rem;
      font-weight: 600;
    }
    .line {
      font-size: 1.1rem;
      color: #2d3748;
      line-height: 1.8;
      padding: 0.25rem 0;
    }
    .footer {
      text-align: center;
      margin-top: 2rem;
      font-size: 0.875rem;
      color: #718096;
    }
    @media print {
      body { background: white; }
      .lyrics { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">${escapeHtml(song.title)}</h1>
      <p class="artist">${escapeHtml(song.artist)}</p>
    </div>
    <div class="lyrics">
      ${song.lyrics.map(section => `
        <div class="section">
          <div class="section-title">${escapeHtml(section.title)}</div>
          ${section.lines.map(line => `<div class="line">${escapeHtml(line.text)}</div>`).join('')}
        </div>
      `).join('')}
    </div>
    <div class="footer">由 Lyric Lab 生成</div>
  </div>
</body>
</html>`;

  downloadBlob(html, generateExportFileName(song.title, 'html'), 'text/html');
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

function downloadBlob(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSong(song: Song, format: ExportFormat): void {
  switch (format) {
    case 'txt':
      exportToTXT(song);
      break;
    case 'lrc':
      exportToLRC(song, true);
      break;
    case 'lrc-simple':
      exportToLRCSimple(song);
      break;
    case 'html':
      exportToHTML(song);
      break;
  }
}