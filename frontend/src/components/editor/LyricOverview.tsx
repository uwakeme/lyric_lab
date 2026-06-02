/**
 * 歌词概览组件
 * 展示当前歌曲的统计信息：段落数、行数、字数、改编进度、韵脚状态分布
 */
import { useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { countChars } from '../../utils/charCount';
import { BarChart3, CheckCircle2, XCircle, CircleDashed, PencilLine } from 'lucide-react';

interface SectionStat {
  id: string;
  title: string;
  lineCount: number;
  charCount: number;
}

export function LyricOverview() {
  const currentSong = useEditorStore(s => s.currentSong);

  const stats = useMemo(() => {
    if (!currentSong) return null;

    let totalLines = 0;
    let totalChars = 0;
    let adaptedLines = 0;
    let matchCount = 0;
    let mismatchCount = 0;
    let uncheckedCount = 0;
    const sectionStats: SectionStat[] = [];

    for (const section of currentSong.lyrics) {
      let sectionChars = 0;
      for (const line of section.lines) {
        const text = line.adaptedText ?? line.text;
        const chars = countChars(text);
        totalChars += chars;
        sectionChars += chars;
        totalLines += 1;
        if (line.adaptedText && line.adaptedText !== line.text) adaptedLines += 1;
        if (line.rhymeStatus === 'match') matchCount += 1;
        else if (line.rhymeStatus === 'mismatch') mismatchCount += 1;
        else uncheckedCount += 1;
      }
      sectionStats.push({
        id: section.id,
        title: section.title || '未命名段落',
        lineCount: section.lines.length,
        charCount: sectionChars,
      });
    }

    const avgChars = totalLines > 0 ? Math.round(totalChars / totalLines) : 0;
    const adaptedPct = totalLines > 0 ? Math.round((adaptedLines / totalLines) * 100) : 0;
    const checkedTotal = matchCount + mismatchCount;
    const matchPct = checkedTotal > 0 ? Math.round((matchCount / checkedTotal) * 100) : null;

    return {
      sectionCount: currentSong.lyrics.length,
      totalLines, totalChars, avgChars,
      adaptedLines, adaptedPct,
      matchCount, mismatchCount, uncheckedCount, matchPct,
      sectionStats,
    };
  }, [currentSong]);

  if (!stats) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <BarChart3 className="w-4 h-4 text-primary-500" />
          歌词概览
        </div>
        <p className="mt-3 text-xs text-slate-400">导入或新建一首歌后即可看到统计信息。</p>
      </div>
    );
  }

  const cells: { label: string; value: React.ReactNode; accent: string }[] = [
    { label: '段落', value: stats.sectionCount, accent: 'text-primary-600' },
    { label: '行数', value: stats.totalLines, accent: 'text-slate-800' },
    { label: '字数', value: stats.totalChars, accent: 'text-slate-800' },
    { label: '均行', value: `${stats.avgChars}`, accent: 'text-slate-800' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <BarChart3 className="w-4 h-4 text-primary-500" />
          歌词概览
        </div>
        <span className="text-[11px] text-slate-400">基于 {stats.totalLines} 行</span>
      </div>

      {/* 指标格 */}
      <div className="grid grid-cols-4 gap-2">
        {cells.map(cell => (
          <div key={cell.label} className="rounded-xl bg-slate-50/80 border border-slate-100 px-2 py-2.5 text-center">
            <div className={`text-lg font-semibold leading-tight ${cell.accent}`}>{cell.value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{cell.label}</div>
          </div>
        ))}
      </div>

      {/* 改编进度 */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="inline-flex items-center gap-1">
            <PencilLine className="w-3.5 h-3.5" />
            改编进度
          </span>
          <span className="font-medium text-slate-700">
            {stats.adaptedLines}/{stats.totalLines} · {stats.adaptedPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300 rounded-full"
            style={{ width: `${stats.adaptedPct}%` }}
          />
        </div>
      </div>

      {/* 韵脚状态 */}
      {(stats.matchCount + stats.mismatchCount + stats.uncheckedCount) > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>韵脚状态</span>
            {stats.matchPct !== null && (
              <span className="font-medium text-slate-700">押韵 {stats.matchPct}%</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3.5 h-3.5" />{stats.matchCount}
            </span>
            <span className="inline-flex items-center gap-1 text-error">
              <XCircle className="w-3.5 h-3.5" />{stats.mismatchCount}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <CircleDashed className="w-3.5 h-3.5" />{stats.uncheckedCount}
            </span>
          </div>
        </div>
      )}

      {/* 段落细分 */}
      {stats.sectionStats.length > 0 && (
        <div className="pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 mb-2">段落</div>
          <ul className="space-y-1.5">
            {stats.sectionStats.map(s => (
              <li key={s.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-700 truncate max-w-[60%]">{s.title}</span>
                <span className="text-slate-400 tabular-nums">{s.lineCount}行 · {s.charCount}字</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
