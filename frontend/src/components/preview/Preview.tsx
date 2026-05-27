// Lyric preview component - Refined
import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { X } from 'lucide-react';

interface PreviewProps {
  onClose: () => void;
}

const themes = [
  { id: 'dark', name: '暗夜', bg: 'bg-slate-900', text: 'text-white', secondary: 'text-slate-300' },
  { id: 'light', name: '清新', bg: 'bg-gradient-to-br from-pink-50 to-purple-50', text: 'text-slate-800', secondary: 'text-slate-500' },
  { id: 'warm', name: '暖阳', bg: 'bg-gradient-to-br from-amber-100 to-orange-100', text: 'text-amber-900', secondary: 'text-amber-700' },
];

export function Preview({ onClose }: PreviewProps) {
  const [theme, setTheme] = useState('dark');
  const { currentSong } = useEditorStore();

  if (!currentSong) return null;

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-8 p-4 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md">
        {/* Theme Selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  theme === t.id
                    ? 'bg-white text-slate-800 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Card */}
        <div className={`${currentTheme.bg} rounded-2xl p-8 shadow-2xl`}>
          {/* Song Info */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold ${currentTheme.text}`}>
              {currentSong.title}
            </h2>
            <p className={`text-sm ${currentTheme.secondary} mt-1`}>
              {currentSong.artist}
            </p>
          </div>

          {/* Lyrics */}
          <div className={`${currentTheme.text} space-y-6`}>
            {currentSong.lyrics.map(section => (
              <div key={section.id}>
                <h3 className={`text-xs font-medium ${currentTheme.secondary} mb-3 text-center uppercase tracking-wider`}>
                  {section.title}
                </h3>
                <div className="space-y-2 text-center">
                  {section.lines.map(line => (
                    <p
                      key={line.id}
                      className="text-center leading-relaxed"
                      style={{ fontSize: '1.0625rem', lineHeight: 1.8 }}
                    >
                      {line.text || <span className="opacity-30">(空行)</span>}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center mt-10">
            <p className={`text-xs ${currentTheme.secondary} opacity-40`}>
              由 LyricLab 生成
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}