// Lyric editor component - Character-level editing with box layout
import { useEffect, useState, useRef, DragEvent } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { countChars } from '../../utils/charCount';
import { getRhymeTypeLabel } from '../../services/rhymeService';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Music
} from 'lucide-react';

interface CharBoxProps {
  char: string;
  isEditable: boolean;
  onChange: (value: string) => void;
  originalChar?: string;
  onDragStart?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
  isDragging?: boolean;
  dragOverIndex?: number;
  index: number;
}

function CharBox({ char, isEditable, onChange, originalChar, onDragStart, onDragOver, onDrop, isDragging, dragOverIndex, index }: CharBoxProps) {
  const [value, setValue] = useState(char);

  useEffect(() => {
    setValue(char);
  }, [char]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(-1);
    setValue(newValue);
    onChange(newValue);
  };

  const isHighlighted = dragOverIndex === index;
  const borderColor = isHighlighted
    ? 'border-primary-400 border-dashed'
    : originalChar && value !== originalChar
    ? 'border-accent-300'
    : originalChar
    ? 'border-slate-200'
    : 'border-slate-200';

  const bgColor = originalChar && value !== originalChar
    ? 'bg-accent-50'
    : originalChar
    ? 'bg-slate-50'
    : 'bg-white';

  return (
    <div
      draggable={isEditable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`
        w-10 h-10 flex items-center justify-center
        text-center text-lg font-medium
        border-2 rounded-lg
        transition-all duration-150 cursor-grab
        ${borderColor} ${bgColor}
        ${isDragging ? 'opacity-50' : ''}
        ${isEditable ? 'hover:border-primary-300' : 'cursor-default'}
      `}
    >
      <input
        type="text"
        value={value}
        onChange={handleChange}
        maxLength={1}
        className="
          w-full h-full text-center text-lg font-medium bg-transparent
          focus:outline-none
        "
        disabled={!isEditable}
      />
    </div>
  );
}

interface LineEditorProps {
  lineId: string;
  originalText: string;
  adaptedText: string;
  onAdaptedChange: (text: string) => void;
  charLimit: { min: number; max: number };
  rhymeStatus?: 'match' | 'mismatch' | 'unchecked';
}

function LineEditor({ originalText, adaptedText, onAdaptedChange, charLimit, rhymeStatus }: LineEditorProps) {
  const originalChars = originalText.split('');
  const adaptedChars = adaptedText ? adaptedText.split('') : [];

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => (e: DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index: number) => (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (dropIndex: number) => (e: DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    const newChars = [...adaptedChars];
    const [removed] = newChars.splice(dragIndex, 1);
    newChars.splice(dropIndex, 0, removed);
    onAdaptedChange(newChars.join(''));

    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleCharChange = (index: number, value: string) => {
    const newChars = [...adaptedChars];
    while (newChars.length <= index) {
      newChars.push('');
    }
    newChars[index] = value;
    onAdaptedChange(newChars.join(''));
  };

  const handleAddBox = () => {
    // Add an empty input box at the end (allows exceeding original word count)
    const newChars = [...adaptedChars];
    // Fill intermediate unfilled slots with original chars (gray), 
    // then append one empty slot at the very end (white)
    while (newChars.length < originalChars.length) {
      newChars.push(originalChars[newChars.length]);
    }
    newChars.push(' ');
    onAdaptedChange(newChars.join(''));
  };

  const handleRemoveBox = () => {
    if (adaptedChars.length > 0) {
      onAdaptedChange(adaptedChars.slice(0, -1).join(''));
    }
  };

  const adaptedCount = countChars(adaptedText);
  const originalCount = countChars(originalText);
  const isOverLimit = adaptedCount > charLimit.max;
  const isUnderLimit = adaptedCount < charLimit.min;

  // One-to-one mapping: same number of boxes as original chars, or more if adapted is longer
  const maxBoxes = Math.max(originalChars.length, adaptedChars.length);

  return (
    <div className="space-y-3">
      {/* Original lyrics (reference) */}
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

      {/* Adapted lyrics (editable) */}
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
              originalChar={originalChars[i]}
              onChange={(value) => handleCharChange(i, value)}
              onDragStart={handleDragStart(i)}
              onDragOver={handleDragOver(i)}
              onDrop={handleDrop(i)}
              isDragging={dragIndex === i}
              dragOverIndex={dragOverIndex ?? undefined}
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
      </div>

      {/* Char count indicator */}
      <div className="flex items-center justify-end pr-14">
        <span className={`text-xs tabular-nums ${
          isOverLimit ? 'text-error font-medium' : isUnderLimit ? 'text-warning' : 'text-slate-400'
        }`}>
          {adaptedCount}/{originalCount} 字
        </span>
      </div>
    </div>
  );
}

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

  const { autoSave } = useEditorStore();
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced autosave
  useEffect(() => {
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
  }, [currentSong, autoSave]);

  // Keyboard shortcuts
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
      {/* Header */}
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

      {/* Sections */}
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
            {/* Section Header */}
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

            {/* Lines */}
            <div className="space-y-6">
              {section.lines.map((line, lineIndex) => (
                <div
                  key={line.id}
                  className="group p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  {/* Line number */}
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

                  {/* Line editor */}
                  <LineEditor
                    lineId={line.id}
                    originalText={line.text}
                    adaptedText={line.adaptedText || ''}
                    onAdaptedChange={(text) => updateLineText(section.id, line.id, text, 'adapted')}
                    charLimit={charLimit}
                    rhymeStatus={line.rhymeStatus}
                  />
                </div>
              ))}

              {/* Add Line */}
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

        {/* Add Section */}
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