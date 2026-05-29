/**
 * 歌词编辑器组件 - 逐字符编辑的盒子布局
 */
import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { countChars } from '../../utils/charCount';
import { getRhymeTypeLabel } from '../../services/rhymeService';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Music, RotateCcw
} from 'lucide-react';

/**
 * CharBox 组件属性接口
 */
interface CharBoxProps {
  /** 单个字符 */
  char: string;
  /** 是否可编辑 */
  isEditable: boolean;
  /** 字符变化回调 */
  onChange: (value: string) => void;
  /** 输入完成回调 */
  onFilled?: () => void;
  /** 是否正在拖拽 */
  isDragging?: boolean;
  /** 拖拽经过的索引 */
  dragOverIndex?: number;
  /** 当前字符索引 */
  index: number;
  /** 输入框引用回调 */
  inputRef?: (el: HTMLInputElement | null) => void;
}

/**
 * CharBox 组件 - 单个字符输入框
 * 用于歌词编辑器中的逐字符编辑
 */
function CharBox({ char, isEditable, onChange, onFilled, isDragging, dragOverIndex, index, inputRef }: CharBoxProps) {
  /**
   * 处理输入框值变化
   * 只保留最后一个字符
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(-1);
    onChange(newValue);
    if (newValue && onFilled) {
      onFilled();
    }
  };

  /**
   * 处理输入框获得焦点
   * 全选文本以便直接替换
   */
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const isHighlighted = dragOverIndex === index;
  const borderColor = isHighlighted
    ? 'border-primary-400 border-dashed'
    : 'border-accent-300';

  const bgColor = 'bg-accent-50';

  return (
    <div
      className={`
        w-10 h-10 flex items-center justify-center
        text-center text-lg font-medium
        border-2 rounded-lg
        transition-colors duration-150
        ${borderColor} ${bgColor}
        ${isDragging ? 'opacity-50' : ''}
        ${isEditable ? 'hover:border-primary-300' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="text"
        value={char}
        onChange={handleChange}
        onFocus={handleFocus}
        maxLength={1}
        className="
          w-full h-full text-center text-lg font-medium bg-transparent
          focus:outline-none cursor-text
        "
        disabled={!isEditable}
      />
    </div>
  );
}

/**
 * LineEditor 组件属性接口
 */
interface LineEditorProps {
  /** 原始歌词文本（参考用） */
  originalText: string;
  /** 改编后的歌词文本 */
  adaptedText: string;
  /** 改编文本变化回调 */
  onAdaptedChange: (text: string) => void;
  /** 字符数限制 */
  charLimit: { min: number; max: number };
  /** 押韵状态 */
  rhymeStatus?: 'match' | 'mismatch' | 'unchecked';
}

/**
 * LineEditor 组件 - 单行歌词编辑器
 * 显示原词和改编词的逐字符编辑界面
 */
function LineEditor({ originalText, adaptedText, onAdaptedChange, charLimit, rhymeStatus }: LineEditorProps) {
  const originalChars = originalText.split('');
  const adaptedChars = adaptedText ? adaptedText.split('') : [];
  const [addedBoxes, setAddedBoxes] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * 当原词文本变化时，重置添加的字符框数量
   */
  useEffect(() => {
    setAddedBoxes(0);
  }, [originalText]);

  /**
   * 处理单个字符变化
   * @param index 字符索引
   * @param value 新的字符值
   */
  const handleCharChange = (index: number, value: string) => {
    const currentAdaptedChars = adaptedText ? adaptedText.split('') : [];
    const newChars = [...currentAdaptedChars];
    while (newChars.length <= index) {
      newChars.push('');
    }
    newChars[index] = value;
    onAdaptedChange(newChars.join(''));
  };

  /**
   * 添加新的字符框
   */
  const handleAddBox = () => {
    setAddedBoxes(prev => prev + 1);
  };

  /**
   * 删除最后一个字符框
   */
  const handleRemoveBox = () => {
    if (addedBoxes > 0) {
      setAddedBoxes(prev => prev - 1);
      // 如果改编文本超出原词长度，也同时裁剪
      if (adaptedChars.length > originalChars.length) {
        onAdaptedChange(adaptedChars.slice(0, -1).join(''));
      }
    }
  };

  /**
   * 重置当前行为空
   * 先取消所有输入框焦点，再清空状态
   */
  const handleReset = () => {
    // 先 blur 所有输入框，避免 DOM 重置时焦点问题
    inputRefs.current.forEach((ref) => { if (ref) ref.blur(); });
    setAddedBoxes(0);
    onAdaptedChange('');
  };

  const adaptedCount = countChars(adaptedText);
  const originalCount = countChars(originalText);
  const totalCount = originalCount + addedBoxes;
  const isOverLimit = adaptedCount > charLimit.max;
  const isUnderLimit = adaptedCount < charLimit.min;

  // 一对一映射：字符框数量等于原词字符数加上用户添加的框
  const maxBoxes = Math.max(originalChars.length + addedBoxes, adaptedChars.length);

  return (
    <div className="space-y-3">
      {/* 原词（参考） */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 w-12">原词</span>
        <div className="flex gap-1 flex-wrap">
          {originalChars.map((char, i) => (
            <div
              key={i}
              className="w-10 h-10 flex items-center justify-center text-lg font-medium text-slate-500 bg-slate-100 rounded-lg border-2 border-slate-200"
            >
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* 改编歌词（可编辑） */}
      <div className="flex items-center gap-2">
        <div className="w-12 flex items-center">
          {rhymeStatus === 'match' && <div className="w-2 h-2 rounded-full bg-success" title="押韵匹配" />}
          {rhymeStatus === 'mismatch' && <div className="w-2 h-2 rounded-full bg-error" title="押韵不匹配" />}
        </div>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: maxBoxes }).map((_, i) => (
            <CharBox
              key={i}
              index={i}
              char={adaptedChars[i] || ''}
              isEditable={true}
              onChange={(value) => handleCharChange(i, value)}
              onFilled={() => inputRefs.current[i + 1]?.focus()}
              inputRef={(el) => { inputRefs.current[i] = el; }}
            />
          ))}
        </div>
        <button
          onClick={handleAddBox}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="添加字框"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleRemoveBox}
          disabled={adaptedChars.length === 0}
          className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-error disabled:opacity-30 transition-colors"
          title="删除字框"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="重置"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 字符数指示器 */}
      <div className="flex items-center justify-end pr-14">
        <span className={`text-xs tabular-nums ${
          isOverLimit ? 'text-error font-medium' : isUnderLimit ? 'text-warning' : 'text-slate-400'
        }`}>
          {adaptedCount}/{totalCount} 字
        </span>
      </div>
    </div>
  );
}

/**
 * LyricEditor 组件 - 主歌词编辑器
 * 显示当前歌曲的所有段落和歌词行，提供编辑功能
 */
export function LyricEditor() {
  const {
    currentSong,
    selectedSectionId,
    rhymeRule,
    charLimit,
    updateLineText,
    addSection,
    deleteSection,
    moveSection,
    updateSectionTitle,
    addLine,
    deleteLine,
    moveLine,
  } = useEditorStore();

  const { autoSave, editVersion } = useEditorStore();
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 防抖自动保存
   * 当 editVersion 变化时触发（不可变更新）
   */
  useEffect(() => {
    if (editVersion === 0) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [editVersion, autoSave]);

  /**
   * 键盘快捷键处理
   * Ctrl/Cmd + Z: 撤销
   * Ctrl/Cmd + Y: 重做
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        useEditorStore.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 无歌曲时显示空状态
  if (!currentSong) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <Music className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无歌词</h3>
          <p className="text-sm text-slate-500">
            从左侧面板导入或搜索歌曲开始改编
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {currentSong.title}
            </h2>
            <span className="text-sm text-slate-400">—</span>
            <span className="text-sm text-slate-600">{currentSong.artist}</span>
          </div>
          <div className="flex items-center gap-2">
            {rhymeRule.type !== 'none' && (
              <span className="badge badge-accent">
                {getRhymeTypeLabel(rhymeRule)}
              </span>
            )}
            <span className="badge badge-primary">
              {charLimit.min}-{charLimit.max}字/句
            </span>
          </div>
        </div>
      </div>

      {/* 段落列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {currentSong.lyrics.map((section, sectionIndex) => (
          <div
            key={section.id}
            className={`card p-5 transition-all duration-200 ${
              selectedSectionId === section.id
                ? 'ring-2 ring-primary-300 shadow-md'
                : 'hover:shadow-md'
            }`}
          >
            {/* 段落标题栏 */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <input
                type="text"
                value={section.title}
                onChange={e => updateSectionTitle(section.id, e.target.value)}
                className="text-sm font-semibold text-primary-600 bg-transparent border-b border-transparent hover:border-primary-300 focus:border-primary-500 outline-none transition-colors py-0.5"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSection(section.id, 'up')}
                  disabled={sectionIndex === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="上移段落"
                >
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => moveSection(section.id, 'down')}
                  disabled={sectionIndex === currentSong.lyrics.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="下移段落"
                >
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => addSection(section.title || '新段落')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-500 transition-colors"
                  title="复制段落"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (currentSong.lyrics.length > 1) {
                      deleteSection(section.id);
                    }
                  }}
                  disabled={currentSong.lyrics.length <= 1}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-error disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="删除段落"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 歌词行列表 */}
            <div className="space-y-6">
              {section.lines.map((line, lineIndex) => (
                <div
                  key={line.id}
                  className="group p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  {/* 行号和操作按钮 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-400 w-6">#{lineIndex + 1}</span>
                    <div className="flex-1 h-px bg-slate-100" />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveLine(section.id, line.id, 'up')}
                        disabled={lineIndex === 0}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                      <button
                        onClick={() => moveLine(section.id, line.id, 'down')}
                        disabled={lineIndex === section.lines.length - 1}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                      <button
                        onClick={() => deleteLine(section.id, line.id)}
                        disabled={section.lines.length <= 1}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-error disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 歌词行编辑器 */}
                  <LineEditor
                    originalText={line.text}
                    adaptedText={line.adaptedText || ''}
                    onAdaptedChange={(text) => updateLineText(section.id, line.id, text, 'adapted')}
                    charLimit={charLimit}
                    rhymeStatus={line.rhymeStatus}
                  />
                </div>
              ))}

              {/* 添加歌词行按钮 */}
              <button
                onClick={() => addLine(section.id)}
                className="flex items-center justify-center gap-2 w-full p-3 text-sm text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-colors border-2 border-dashed border-slate-200 hover:border-primary-300"
              >
                <Plus className="w-4 h-4" />
                <span>添加句子</span>
              </button>
            </div>
          </div>
        ))}

        {/* 添加段落按钮 */}
        <button
          onClick={() => addSection('新段落')}
          className="w-full p-5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50/50 transition-all flex flex-col items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">添加段落</span>
        </button>
      </div>
    </div>
  );
}