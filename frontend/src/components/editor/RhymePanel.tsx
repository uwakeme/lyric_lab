/**
 * 押韵参考面板组件
 * 提供押韵词库浏览、插入和复制功能
 */
import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { rhymeWordLibrary, yunmuCategories, getRhymeWords } from '../../services/rhymeLibrary';
import { getLastCharPinyin } from '../../utils/pinyin';
import { useToast } from '../common/Toast';
import { Sparkles, Plus, Check } from 'lucide-react';
import type { RhymeWord } from '../../types';

/**
 * RhymePanel 组件 - 押韵词库面板
 * 显示押韵词列表，支持按韵母筛选和插入到歌词
 */
export function RhymePanel() {
  const [selectedYunmu, setSelectedYunmu] = useState<string | null>(null);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const { currentSong, selectedLineId, updateLineText } = useEditorStore();
  const { success } = useToast();

  const selectedSection = currentSong?.lyrics.find(s =>
    s.lines.some(l => l.id === selectedLineId)
  );
  const selectedLine = selectedSection?.lines.find(l => l.id === selectedLineId);

  const currentYunmu = selectedLine
    ? getLastCharPinyin(selectedLine.text)?.yunmu
    : null;

  const handleInsertWord = (word: RhymeWord) => {
    if (!selectedLine || !selectedSection) return;

    // Replace the last character of the adapted text (or original if no adaptation yet)
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
    } catch {
      // 剪贴板不可用
    }
  };

  const displayedWords = selectedYunmu
    ? getRhymeWords(selectedYunmu)
    : Object.values(rhymeWordLibrary).flat();

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* 滚动容器 —— 内部含 sticky 头 + 词语网格 */}
      <div className="flex-1 min-h-0 overflow-y-auto -mt-4 pt-4">
        <div className="sticky top-0 z-10 -mt-4 pt-4 pb-3 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent-500" />
            押韵词库
            <span className="text-xs text-slate-400 font-normal ml-auto">
              {displayedWords.length} 词
            </span>
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {yunmuCategories.map(yunmu => {
              const count = rhymeWordLibrary[yunmu]?.length || 0;
              return (
                <button
                  key={yunmu}
                  onClick={() => setSelectedYunmu(selectedYunmu === yunmu ? null : yunmu)}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
                    selectedYunmu === yunmu
                      ? 'bg-accent-500 text-white shadow-sm'
                      : currentYunmu === yunmu
                      ? 'bg-accent-100 text-accent-700 border border-accent-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {yunmu}
                  <span className={`ml-1 text-[10px] ${
                    selectedYunmu === yunmu ? 'text-white/80' : 'text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-3">
          {displayedWords.map((word, i) => {
            const isCopied = copiedWord === word.word;
            return (
              <div
                key={`${word.word}-${i}`}
                className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-white hover:border-accent-300 hover:bg-accent-50/40 transition-colors cursor-pointer"
                onClick={() => handleCopyWord(word)}
                title="点击复制"
              >
                <span className="flex-1 text-sm text-slate-800 font-medium truncate">
                  {word.word}
                </span>
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInsertWord(word);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-accent-600 hover:bg-accent-100 transition-all flex-shrink-0"
                    title="插入到当前行"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {displayedWords.length === 0 && (
          <div className="text-center text-xs text-slate-400 py-8">
            该韵母暂无押韵词
          </div>
        )}
      </div>

      {/* 当前行信息 */}
      {selectedLine && currentYunmu && (
        <div className="pt-3 mt-2 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">当前行末字韵母</span>
            <span className="px-2 py-0.5 rounded-md bg-accent-100 text-accent-700 font-semibold text-xs">
              {currentYunmu}
            </span>
            <span className="text-xs text-slate-400">
              {rhymeWordLibrary[currentYunmu]?.length || 0} 词可用
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
