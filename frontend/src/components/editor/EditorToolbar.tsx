// Editor toolbar with refined styling
import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { yunmuCategories } from '../../services/rhymeLibrary';
import { calculateRhymeSuccessRate } from '../../services/rhymeService';
import { useToast } from '../common/Toast';
import {
  Undo2, Redo2, CheckCircle, Settings2, Eye, Save
} from 'lucide-react';
import type { RhymeRule } from '../../types';

interface EditorToolbarProps {
  onPreview: () => void;
}

export function EditorToolbar({ onPreview }: EditorToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const {
    currentSong,
    rhymeRule,
    charLimit,
    undoStack,
    redoStack,
    setRhymeRule,
    setCharLimit,
    checkAllRhymes,
    undo,
    redo,
  } = useEditorStore();
  const { success, warning } = useToast();

  const handleRhymeTypeChange = (type: RhymeRule['type']) => {
    if (type === 'none') {
      setRhymeRule({ type: 'none' });
    } else if (type === 'yunmu') {
      setRhymeRule({ type: 'yunmu', value: 'ang' });
    } else if (type === 'ping') {
      setRhymeRule({ type: 'ping' });
    } else if (type === 'ze') {
      setRhymeRule({ type: 'ze' });
    }
  };

  const handleYunmuChange = (value: string) => {
    setRhymeRule({ type: 'yunmu', value });
  };

  const handleCheckAll = () => {
    if (!currentSong) {
      warning('请先加载歌词');
      return;
    }
    checkAllRhymes();

    const allLines = currentSong.lyrics.flatMap(s => s.lines);
    const results = allLines.map(line => ({
      lineId: line.id,
      status: line.rhymeStatus || 'unchecked',
    }));
    const stats = calculateRhymeSuccessRate(results);

    if (stats.total === 0) {
      warning('未检测到需要押韵的句子');
    } else {
      success(`押韵检测完成：${stats.matched}/${stats.total} 匹配`);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
      {/* Left side - Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="撤销 (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="重做 (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4 text-slate-600" />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-2" />

        <button
          onClick={handleCheckAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm text-slate-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="hidden sm:inline">检查全文</span>
        </button>
      </div>

      {/* Center - Settings */}
      <div className="relative">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-sm text-slate-600 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">设置</span>
        </button>

        {showSettings && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowSettings(false)}
            />
            {/* Dropdown */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden">
              <div className="p-4 space-y-5">
                {/* Rhyme Settings */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    押韵规则
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['none', 'ping', 'ze'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => handleRhymeTypeChange(type)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          rhymeRule.type === type
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {type === 'none' ? '无押韵' : type === 'ping' ? '平声尾' : '仄声尾'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Yunmu Selector */}
                {rhymeRule.type === 'yunmu' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      指定韵母
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {yunmuCategories.map(yunmu => (
                        <button
                          key={yunmu}
                          onClick={() => handleYunmuChange(yunmu)}
                          className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-all ${
                            rhymeRule.value === yunmu
                              ? 'bg-accent-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {yunmu}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Char Limit */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    字数限制
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={charLimit.min}
                      onChange={e => setCharLimit(parseInt(e.target.value) || 1, charLimit.max)}
                      className="w-16 px-2 py-1.5 text-center text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                    <span className="text-slate-400">—</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={charLimit.max}
                      onChange={e => setCharLimit(charLimit.min, parseInt(e.target.value) || 10)}
                      className="w-16 px-2 py-1.5 text-center text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                    <span className="text-sm text-slate-500 ml-1">字/句</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right side - Preview */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPreview}
          disabled={!currentSong}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">预览</span>
        </button>
      </div>
    </div>
  );
}