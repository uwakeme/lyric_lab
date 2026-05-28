// Song import panel component - Refined
import { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { searchSongs, getHotSongs, getSongById, importSongFromText, getFallbackSongs } from '../../services/songService';
import { useToast } from '../common/Toast';
import { Search, Upload, TrendingUp, RefreshCw } from 'lucide-react';
import type { Song } from '../../types';

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
      setSearchResults(getFallbackSongs().slice(0, 5));
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadHot = async () => {
    setIsLoadingHot(true);
    try {
      const songs = await getHotSongs();
      setHotSongs(songs);
    } catch {
      setHotSongs(getFallbackSongs().slice(0, 5));
    } finally {
      setIsLoadingHot(false);
    }
  };

  const handleSelectSong = async (song: Song) => {
    // If song already has lyrics (from fallback), use it directly
    if (song.lyrics && song.lyrics.length > 0) {
      setCurrentSong(song);
      success(`已加载《${song.title}》`);
      return;
    }

    // Otherwise fetch full song with lyrics from API
    try {
      const fullSong = await getSongById(song.id);
      if (fullSong) {
        setCurrentSong(fullSong);
        success(`已加载《${song.title}》`);
      } else {
        error('获取歌曲详情失败');
      }
    } catch {
      error('获取歌曲详情失败');
    }
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
              <button
                key={song.id}
                onClick={() => handleSelectSong(song)}
                className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-primary-300 hover:bg-primary-50/50 transition-all"
              >
                <div className="font-medium text-slate-800 text-sm">{song.title}</div>
                <div className="text-xs text-slate-500">{song.artist}</div>
              </button>
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
                <button
                  key={song.id}
                  onClick={() => handleSelectSong(song)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-primary-300 hover:bg-primary-50/50 transition-all"
                >
                  <div className="font-medium text-slate-800 text-sm">{song.title}</div>
                  <div className="text-xs text-slate-500">{song.artist}</div>
                </button>
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