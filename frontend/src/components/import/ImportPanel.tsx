// Song import panel component - Refined
import { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { searchSongs, getHotSongs, getSongById, importSongFromText } from '../../services/songService';
import { useToast } from '../common/Toast';
import { Search, Upload, TrendingUp, RefreshCw } from 'lucide-react';
import type { Song } from '../../types';

/** 歌曲是否带有可编辑的歌词内容 */
function hasLyricContent(song: Song): boolean {
  return !!song.lyrics?.some(sec => sec.lines.length > 0);
}

/**
 * 歌曲列表项（搜索结果 / 热门歌曲共用）
 */
function SongItem({ song, onSelect }: { song: Song; onSelect: (song: Song) => void }) {
  return (
    <button
      onClick={() => onSelect(song)}
      className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-primary-300 hover:bg-primary-50/50 transition-all"
    >
      <div className="font-medium text-slate-800 text-sm">
        {song.title}
        {song.category && (
          <span className="ml-1.5 text-[10px] font-normal px-1.5 py-0.5 rounded bg-accent-50 text-accent-600">
            {song.category}
          </span>
        )}
      </div>
      <div className="text-xs text-slate-500">{song.artist}</div>
    </button>
  );
}

export function ImportPanel() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showManualImport, setShowManualImport] = useState(false);
  const [manualText, setManualText] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [hotSongs, setHotSongs] = useState<Song[]>([]);
  const [isLoadingHot, setIsLoadingHot] = useState(false);

  const { setCurrentSong } = useEditorStore();
  const { success, error, warning } = useToast();

  // Load hot songs on mount
  useEffect(() => {
    handleLoadHot();
  }, []);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchSongs(searchKeyword);
      setSearchResults(results);
      if (results.length === 0) {
        warning('未找到匹配的歌曲');
      }
    } catch {
      error('搜索失败，使用本地数据');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadHot = async () => {
    setIsLoadingHot(true);
    try {
      const songs = await getHotSongs();
      setHotSongs(songs);
    } finally {
      setIsLoadingHot(false);
    }
  };

  const handleSelectSong = async (song: Song) => {
    // If song already has lyrics (from fallback), use it directly
    if (hasLyricContent(song)) {
      setCurrentSong(song);
      success(`已加载《${song.title}》`);
      return;
    }

    // Otherwise fetch full song with lyrics from API
    try {
      const fullSong = await getSongById(song.id);
      if (fullSong && hasLyricContent(fullSong)) {
        setCurrentSong(fullSong);
        success(`已加载《${song.title}》`);
        return;
      }
    } catch {
      // 接口不可用时继续走本地加载
    }

    // 内置曲库歌曲不随代码分发歌词：仍然加载，提示用户手动导入
    setCurrentSong(song);
    warning(`《${song.title}》暂无内置歌词，可在下方"手动导入歌词"中粘贴`);
  };

  const handleManualImport = async () => {
    if (!manualText.trim()) {
      error('请输入歌词内容');
      return;
    }

    try {
      const song = await importSongFromText(manualTitle || '手动导入', manualText);
      setCurrentSong(song);
      success('歌词导入成功');
      setShowManualImport(false);
      setManualText('');
      setManualTitle('');
    } catch {
      error('导入失败');
    }
  };

  return (
    <div className="space-y-5">
      {/* Search Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          搜索歌曲
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="输入歌曲名或歌手..."
            className="input flex-1"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="btn btn-primary shrink-0"
          >
            {isSearching ? '...' : '搜索'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide">搜索结果</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {searchResults.map(song => (
              <SongItem key={song.id} song={song} onSelect={handleSelectSong} />
            ))}
          </div>
        </div>
      )}

      {/* Hot Songs */}
      {!searchResults.length && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              热门歌曲
            </h4>
            <button
              onClick={handleLoadHot}
              disabled={isLoadingHot}
              className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingHot ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
          {hotSongs.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {hotSongs.map(song => (
                <SongItem key={song.id} song={song} onSelect={handleSelectSong} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-3">
              {isLoadingHot ? '加载中...' : '暂无热门歌曲'}
            </p>
          )}
        </div>
      )}

      {/* Manual Import */}
      <div className="border-t border-slate-100 pt-4">
        <button
          onClick={() => setShowManualImport(!showManualImport)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary-500 transition-colors w-full"
        >
          <Upload className="w-4 h-4" />
          手动导入歌词
        </button>

        {showManualImport && (
          <div className="mt-3 space-y-3 animate-fade-in">
            <input
              type="text"
              value={manualTitle}
              onChange={e => setManualTitle(e.target.value)}
              placeholder="歌曲名（可选）"
              className="input"
            />
            <textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="粘贴歌词文本，每行一句。用 [主歌]、[副歌] 等标记段落..."
              className="input min-h-[120px] resize-none"
            />
            <button
              onClick={handleManualImport}
              className="btn btn-primary w-full"
            >
              导入歌词
            </button>
          </div>
        )}
      </div>
    </div>
  );
}