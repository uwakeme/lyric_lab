// Export panel component - Refined
import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { exportSong } from '../../services/exportService';
import { useToast } from '../common/Toast';
import { Download, FileText, Music, Code, File } from 'lucide-react';
import type { ExportFormat } from '../../types';

export function ExportPanel() {
  const [showFormats, setShowFormats] = useState(false);
  const { currentSong } = useEditorStore();
  const { success, warning } = useToast();

  const formats: { id: ExportFormat; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'txt',
      name: 'TXT 文本',
      desc: '纯文本格式，段落间空行',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'lrc',
      name: 'LRC 歌词',
      desc: '带时间戳的歌词文件',
      icon: <Music className="w-5 h-5" />,
    },
    {
      id: 'lrc-simple',
      name: 'LRC 纯歌词',
      desc: '不含时间戳的LRC格式',
      icon: <Music className="w-5 h-5" />,
    },
    {
      id: 'html',
      name: 'HTML 页面',
      desc: '可浏览器查看的独立页面',
      icon: <Code className="w-5 h-5" />,
    },
  ];

  const handleExport = (format: ExportFormat) => {
    if (!currentSong) {
      warning('请先加载或导入歌词');
      return;
    }

    try {
      exportSong(currentSong, format);
      success(`已导出为 ${formats.find(f => f.id === format)?.name}`);
      setShowFormats(false);
    } catch {
      warning('导出失败');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <button
          onClick={() => setShowFormats(!showFormats)}
          disabled={!currentSong}
          className="btn btn-primary w-full justify-center disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          导出歌词
        </button>

        {showFormats && currentSong && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowFormats(false)} />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-20 animate-scale-in overflow-hidden">
              <div className="p-2">
                {formats.map(format => (
                  <button
                    key={format.id}
                    onClick={() => handleExport(format.id)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      {format.icon}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{format.name}</div>
                      <div className="text-xs text-slate-500">{format.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {!currentSong && (
        <p className="text-xs text-slate-400 text-center py-2">
          加载歌曲后可导出
        </p>
      )}

      {/* Export Tips */}
      <div className="p-3 bg-slate-50 rounded-xl">
        <p className="text-xs text-slate-500">
          <File className="w-3 h-3 inline mr-1" />
          导出文件命名格式：歌曲名_日期.格式
        </p>
      </div>
    </div>
  );
}