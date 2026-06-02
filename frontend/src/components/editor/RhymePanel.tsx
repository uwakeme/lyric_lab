/**
 * 押韵参考面板组件
 * 布局：头部固定 + 词语网格独立滚动 + 底部固定
 * 关键：此组件作为右侧面板的子区域，外层容器已有 overflow 控制，
 *       所以这里只用 flex 撑满，让内部的 scrollRef 独立滚动即可。
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { rhymeWordLibrary, yunmuCategories, getRhymeWords } from '../../services/rhymeLibrary';
import { getLastCharPinyin } from '../../utils/pinyin';
import { useToast } from '../common/Toast';
import { Sparkles, Plus, Check, Search, X } from 'lucide-react';
import type { RhymeWord } from '../../types';

export function RhymePanel() {
  const [selectedYunmu, setSelectedYunmu] = useState<string | null>(null);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentSong, selectedLineId, updateLineText } = useEditorStore();
  const { success } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedSection = currentSong?.lyrics.find(s =>
    s.lines.some(l => l.id === selectedLineId)
  );
  const selectedLine = selectedSection?.lines.find(l => l.id === selectedLineId);

  const currentYunmu = selectedLine
    ? getLastCharPinyin(selectedLine.text)?.yunmu
    : null;

  const handleInsertWord = (word: RhymeWord) => {
    if (!selectedLine || !selectedSection) return;
    const currentText = selectedLine.adaptedText ?? selectedLine.text;
    const newText = currentText.length > 0
      ? currentText.slice(0, -1) + word.word
      : word.word;
    updateLineText(selectedSection.id, selectedLine.id, newText, 'adapted');
    success(`已插入"${word.word}"`);
  };

  const handleCopyWord = async (word: RhymeWord) => {
    try {
      await navigator.clipboard.writeText(word.word);
      setCopiedWord(word.word);
      setTimeout(() => setCopiedWord(null), 1500);
    } catch { /* 剪贴板不可用 */ }
  };

  // 基础词列表（按韵母筛选）
  const baseWords = selectedYunmu
    ? getRhymeWords(selectedYunmu)
    : Object.values(rhymeWordLibrary).flat();

  // 搜索过滤
  const displayedWords = useMemo(() => {
    if (!searchQuery.trim()) return baseWords;
    const q = searchQuery.trim().toLowerCase();
    return baseWords.filter(w =>
      w.word.includes(q) || w.pinyin.toLowerCase().includes(q)
    );
  }, [baseWords, searchQuery]);

  // 切换韵母时滚回顶部 & 清空搜索
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setSearchQuery('');
  }, [selectedYunmu]);

  return (
    <div className="h-full flex flex-col">
      {/* ── 头部：标题 + 搜索 + 韵母标签（固定不滚）── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-slate-200/60 bg-white/60">
        {/* 标题行 */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-accent-500" />
          <h3 className="text-sm font-semibold text-slate-800">押韵词库</h3>
          <span className="ml-auto text-[11px] text-slate-400 tabular-nums">
            {displayedWords.length} 词
          </span>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索词语或拼音…"
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 bg-white/80 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 韵母标签 */}
        <div className="flex flex-wrap gap-1.5">
          {yunmuCategories.map(yunmu => {
            const count = rhymeWordLibrary[yunmu]?.length || 0;
            const isActive = selectedYunmu === yunmu;
            const isCurrent = currentYunmu === yunmu;
            return (
              <button
                key={yunmu}
                onClick={() => setSelectedYunmu(isActive ? null : yunmu)}
                className={`
                  px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/25'
                    : isCurrent
                      ? 'bg-accent-50 text-accent-700 ring-1 ring-accent-300/60'
                      : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200/80 hover:text-slate-700'
                  }
                `}
              >
                {yunmu}
                <span className={`ml-1 text-[10px] ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 词语网格（唯一滚动区域）── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 min-h-0"
      >
        {displayedWords.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {displayedWords.map((word, i) => {
              const isCopied = copiedWord === word.word;
              return (
                <div
                  key={`${word.word}-${i}`}
                  onClick={() => handleCopyWord(word)}
                  title="点击复制"
                  className={`
                    group relative flex items-center gap-1.5 px-3 py-2 rounded-xl
                    border transition-all duration-200 cursor-pointer
                    ${isCopied
                      ? 'border-success/40 bg-success/5'
                      : 'border-slate-200/70 bg-white hover:border-accent-300/60 hover:bg-accent-50/30 hover:shadow-sm hover:shadow-accent-500/5'
                    }
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm text-slate-800 font-medium truncate">
                      {word.word}
                    </span>
                    <span className="block text-[10px] text-slate-400 truncate">
                      {word.pinyin}
                    </span>
                  </div>
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInsertWord(word);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-accent-600 hover:bg-accent-100/80 transition-all duration-200 flex-shrink-0"
                      title="插入到当前行"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Search className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs">
              {searchQuery ? `未找到"${searchQuery}"相关词语` : '该韵母暂无押韵词'}
            </p>
          </div>
        )}
      </div>

      {/* ── 底部：当前行信息（固定不滚）── */}
      {selectedLine && currentYunmu && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-200/60 bg-white/40">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">当前行末字韵母</span>
            <span className="px-2 py-0.5 rounded-md bg-accent-100/80 text-accent-700 font-semibold text-xs">
              {currentYunmu}
            </span>
            <span className="text-[11px] text-slate-400">
              {rhymeWordLibrary[currentYunmu]?.length || 0} 词可用
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
