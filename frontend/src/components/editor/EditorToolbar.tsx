/**
 * 编辑器工具栏组件
 * 提供撤销/重做、押韵检查、设置和预览功能
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditorStore } from '../../store/editorStore';
import { yunmuCategories } from '../../services/rhymeLibrary';
import { calculateRhymeSuccessRate } from '../../services/rhymeService';
import { useToast } from '../common/Toast';
import {
  Undo2, Redo2, CheckCircle, Settings2, Eye
} from 'lucide-react';
import type { RhymeRule } from '../../types';

interface EditorToolbarProps {
  /** 预览按钮回调 */
  onPreview: () => void;
}

/**
 * EditorToolbar 组件 - 编辑器工具栏
 * 包含撤销/重做、押韵检查、设置和预览按钮
 */
export function EditorToolbar({ onPreview }: EditorToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
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

  useEffect(() => {
    if (!showSettings || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
  }, [showSettings]);

  /**
   * 处理押韵类型变化
   * @param type 押韵规则类型
   */
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

  /**
   * 处理韵母选择变化
   * @param value 韵母值
   */
  const handleYunmuChange = (value: string) => {
    setRhymeRule({ type: 'yunmu', value });
  };

  /**
   * 处理全篇押韵检查
   * 检查所有歌词行的押韵情况并显示统计结果
   */
  const handleCheckAll = () => {
    if (!currentSong) {
      warning('请先加载歌词');
      return;
    }
    checkAllRhymes();

    // 检查完成后重新读取歌曲数据
    const updatedSong = useEditorStore.getState().currentSong;
    if (!updatedSong) return;

    const allLines = updatedSong.lyrics.flatMap(s => s.lines);
    const results = allLines.map(line => ({
      lineId: line.id,
      status: (line.rhymeStatus || 'unchecked') as 'match' | 'mismatch' | 'unchecked',
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
      {/* 左侧 - 撤销/重做 */}
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

      {/* 中间 - 设置 */}
      <div className="relative" ref={buttonRef}>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-sm text-slate-600 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">设置</span>
        </button>

        {showSettings && menuPos && createPortal(
          <>
            {/* 遮罩层 */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSettings(false)}
            />
            {/* 下拉菜单 */}
            <div
              className="fixed w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
              style={{ top: menuPos.top, left: menuPos.left, transform: 'translateX(-50%)' }}
            >
              <div className="p-4 space-y-5">
                {/* 押韵设置 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    押韵规则
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['none', 'ping', 'ze', 'yunmu'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => handleRhymeTypeChange(type)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          rhymeRule.type === type
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {type === 'none' ? '无押韵' : type === 'ping' ? '平声尾' : type === 'ze' ? '仄声尾' : '指定韵母'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 韵母选择器 */}
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

                {/* 字数限制 */}
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
          </>,
          document.body
        )}
      </div>

      {/* 右侧 - 预览 */}
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