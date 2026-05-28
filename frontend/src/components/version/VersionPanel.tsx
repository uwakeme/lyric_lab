// Version history panel component - Refined
import { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import {
  saveVersion,
  getAllVersions,
  deleteVersion,
  saveTempBackup,
} from '../../services/versionService';
import { useToast } from '../common/Toast';
import { History, RotateCcw, Trash2, Clock, Tag, Save } from 'lucide-react';
import type { Version } from '../../types';

interface VersionItemProps {
  version: Version;
  onRestore: (version: Version) => void;
  onDelete: (id: string) => void;
}

function VersionItem({ version, onRestore, onDelete }: VersionItemProps) {
  const date = new Date(version.timestamp);
  const formattedDate = date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Tag className="w-3 h-3 text-accent-500 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-800 truncate">
            {version.label}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          {formattedDate}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onRestore(version)}
          className="p-2 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors"
          title="恢复此版本"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(version.id)}
          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-error transition-colors"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function VersionPanel() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [label, setLabel] = useState('');

  const { currentSong, setCurrentSong } = useEditorStore();
  const { success, warning } = useToast();

  const loadVersions = () => {
    setVersions(getAllVersions());
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const handleSaveVersion = () => {
    if (!currentSong) {
      warning('请先加载或导入歌词');
      return;
    }

    if (!label.trim()) {
      setShowLabelInput(true);
      return;
    }

    saveTempBackup(currentSong);
    saveVersion(currentSong, label);
    success('版本已保存');
    setLabel('');
    setShowLabelInput(false);
    loadVersions();
  };

  const handleRestore = (version: Version) => {
    if (!currentSong) return;
    saveTempBackup(currentSong);
    setCurrentSong(version.content);
    success('已恢复到选定版本');
  };

  const handleDelete = (id: string) => {
    deleteVersion(id);
    loadVersions();
    success('版本已删除');
  };

  return (
    <div className="space-y-4">
      {/* Save Version */}
      <div className="space-y-3">
        {showLabelInput ? (
          <div className="flex gap-2 animate-fade-in">
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="版本标签..."
              className="input flex-1"
              onKeyDown={e => e.key === 'Enter' && handleSaveVersion()}
            />
            <button onClick={handleSaveVersion} className="btn btn-primary shrink-0">
              <Save className="w-4 h-4" />
            </button>
            <button onClick={() => setShowLabelInput(false)} className="btn btn-secondary shrink-0">
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={handleSaveVersion}
            disabled={!currentSong}
            className="btn btn-primary w-full justify-center disabled:opacity-50"
          >
            <History className="w-4 h-4" />
            保存版本
          </button>
        )}
      </div>

      {/* Version List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">暂无保存的版本</p>
          </div>
        ) : (
          versions.map(version => (
            <VersionItem
              key={version.id}
              version={version}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
