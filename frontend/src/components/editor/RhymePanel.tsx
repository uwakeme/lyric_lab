/**
 * 押韵参考面板组件
 * 提供押韵词库浏览、插入和复制功能
 */
import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { rhymeWordLibrary, yunmuCategories, getRhymeWords } from '../../services/rhymeLibrary';
import { getLastCharPinyin } from '../../utils/pinyin';
import { useToast } from '../common/Toast';
import { Sparkles, Copy, Check } from 'lucide-react';
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

  // 获取当前选中的段落
  const selectedSection = currentSong?.lyrics.find(s =>
    s.lines.some(l => l.id === selectedLineId)
  );
  // 获取当前选中的歌词行
  const selectedLine = selectedSection?.lines.find(l => l.id === selectedLineId);

  // 获取当前行末字的韵母
  const currentYunmu = selectedLine
    ? getLastCharPinyin(selectedLine.text)?.yunmu
    : null;

  /**
   * 插入押韵词到当前选中行
   * 将选中的押韵词添加到当前行的末尾
   * @param word 要插入的押韵词
   */
  const handleInsertWord = (word: RhymeWord) => {
    if (!selectedLine || !selectedSection) return;

    const text = selectedLine.text.trim();
    const lastSpaceIndex = text.lastIndexOf(' ');
    let newText: string;

    if (lastSpaceIndex !== -1) {
      newText = text.slice(0, lastSpaceIndex + 1) + word.word;
    } else {
      newText = word.word;
    }

    updateLineText(selectedSection.id, selectedLine.id, newText, 'adapted');
    success(`已插入"${word.word}"`);
  };

  /**
   * 复制押韵词到剪贴板
   * @param word 要复制的词语
   */
  const handleCopyWord = async (word: string) => {
    try {
      await navigator.clipboard.writeText(word);
      setCopiedWord(word);
      setTimeout(() => setCopiedWord(null), 1500);
    } catch {
      // 剪贴板不可用
    }
  };

  // 根据选择的韵母筛选押韵词，或显示全部
  const displayedWords = selectedYunmu
    ? getRhymeWords(selectedYunmu)
    : Object.values(rhymeWordLibrary).flat().slice(0, 30);

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-accent-500" />
          押韵词库
        </h3>

        {/* 韵母标签页 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {yunmuCategories.map(yunmu => (
            <button
              key={yunmu}
              onClick={() => setSelectedYunmu(selectedYunmu === yunmu ? null : yunmu)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedYunmu === yunmu
                  ? 'bg-accent-500 text-white shadow-sm'
                  : currentYunmu === yunmu
                  ? 'bg-accent-100 text-accent-700 border border-accent-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {yunmu}
            </button>
          ))}
        </div>
      </div>

      {/* 词语列表 */}
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {displayedWords.map((word, i) => (
          <div
            key={`${word.word}-${i}`}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 group transition-colors"
          >
            <span className="text-sm text-slate-700 font-medium">{word.word}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleInsertWord(word)}
                className="p-1.5 rounded-lg hover:bg-accent-50 text-slate-400 hover:text-accent-600 transition-colors"
                title="插入到当前行"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copiedWord === word.word ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <button
                  onClick={() => handleCopyWord(word.word)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                  title="复制"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 当前行信息 */}
      {selectedLine && currentYunmu && (
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2">当前行末字韵母</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-accent-100 text-accent-700 font-semibold text-sm">
              {currentYunmu}
            </span>
            <span className="text-xs text-slate-400">
              {rhymeWordLibrary[currentYunmu]?.length || 0} 个押韵词可用
            </span>
          </div>
        </div>
      )}
    </div>
  );
}