// Main App component - Refined UI
import { useState, useEffect } from 'react';
import { useEditorStore } from './store/editorStore';
import { useAuthStore } from './store/authStore';
import { ToastContainer, useToast } from './components/common/Toast';
import { Onboarding } from './components/common/Onboarding';
import { ImportPanel } from './components/import/ImportPanel';
import { ExportPanel } from './components/export/ExportPanel';
import { VersionPanel } from './components/version/VersionPanel';
import { LyricEditor, RhymePanel, EditorToolbar } from './components/editor/index';
import { Preview } from './components/preview/Preview';
import { UserAvatar } from './components/auth/UserAvatar';
import { AuthModal } from './components/auth/AuthModal';
import { loadAutoSave } from './services/versionService';
import { Menu, X, Music, History, Download, Sparkles, Eye } from 'lucide-react';

type LeftTab = 'import' | 'version' | 'export';
type RightTab = 'rhyme' | 'preview';

export default function App() {
  const [leftTab, setLeftTab] = useState<LeftTab>('import');
  const [rightTab, setRightTab] = useState<RightTab>('rhyme');
  const [showPreview, setShowPreview] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { currentSong, loadFromAutoSave } = useEditorStore();
  const { checkAuth } = useAuthStore();
  const { toasts, dismissToast, success } = useToast();

  useEffect(() => {
    checkAuth();

    // Check for auto-saved content
    const saved = loadAutoSave();
    if (saved) {
      loadFromAutoSave();
      success('已恢复上次编辑内容');
    }
  }, []);

  const tabConfig = {
    import: { icon: Music, label: '导入' },
    version: { icon: History, label: '版本' },
    export: { icon: Download, label: '导出' },
  };

  const rightTabConfig = {
    rhyme: { icon: Sparkles, label: '押韵' },
    preview: { icon: Eye, label: '预览' },
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Header - Floating Style */}
      <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 flex-shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
              <Music className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              LyricLab
            </h1>
          </div>
          <span className="hidden sm:inline text-sm text-slate-400">歌词改编工具</span>
        </div>

        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <UserAvatar onLoginClick={() => setShowAuthModal(true)} />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsLeftPanelOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="打开菜单"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Desktop */}
        <div
          className={`hidden md:flex w-72 flex-col border-r border-slate-200/80 bg-white/50 backdrop-blur-sm transition-all duration-300 flex-shrink-0`}
        >
          {/* Tabs */}
          <div className="p-4 pb-0">
            <div className="tabs">
              {(Object.keys(tabConfig) as LeftTab[]).map(tab => {
                const config = tabConfig[tab];
                const Icon = config.icon;
                return (
                  <button
                    key={tab}
                    onClick={() => setLeftTab(tab)}
                    className={`tab ${leftTab === tab ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="animate-fade-in">
              {leftTab === 'import' && <ImportPanel />}
              {leftTab === 'version' && <VersionPanel />}
              {leftTab === 'export' && <ExportPanel />}
            </div>
          </div>
        </div>

        {/* Mobile Left Panel Drawer */}
        {isLeftPanelOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsLeftPanelOpen(false)}
            />
            <div className="md:hidden fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-xl animate-slide-in overflow-hidden flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <Music className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-slate-900">LyricLab</span>
                </div>
                <button
                  onClick={() => setIsLeftPanelOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="p-4 pb-0">
                <div className="tabs">
                  {(Object.keys(tabConfig) as LeftTab[]).map(tab => {
                    const config = tabConfig[tab];
                    const Icon = config.icon;
                    return (
                      <button
                        key={tab}
                        onClick={() => setLeftTab(tab)}
                        className={`tab ${leftTab === tab ? 'active' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {leftTab === 'import' && <ImportPanel />}
                {leftTab === 'version' && <VersionPanel />}
                {leftTab === 'export' && <ExportPanel />}
              </div>
            </div>
          </>
        )}

        {/* Center - Editor */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          <EditorToolbar onPreview={() => setShowPreview(true)} />
          <LyricEditor />
        </div>

        {/* Right Panel - Desktop */}
        <div
          className={`hidden lg:flex w-80 flex-col border-l border-slate-200/80 bg-white/50 backdrop-blur-sm transition-all duration-300 flex-shrink-0`}
        >
          {/* Tabs */}
          <div className="p-4 pb-0">
            <div className="tabs">
              {(Object.keys(rightTabConfig) as RightTab[]).map(tab => {
                const config = rightTabConfig[tab];
                const Icon = config.icon;
                return (
                  <button
                    key={tab}
                    onClick={() => setRightTab(tab)}
                    className={`tab ${rightTab === tab ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="animate-fade-in">
              {rightTab === 'rhyme' && <RhymePanel />}
              {rightTab === 'preview' && currentSong && (
                <Preview onClose={() => setRightTab('rhyme')} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-around z-30 safe-area-bottom">
        <button
          onClick={() => setIsLeftPanelOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-600 active:text-primary-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs font-medium">菜单</span>
        </button>

        <button
          onClick={() => setShowPreview(true)}
          disabled={!currentSong}
          className="flex flex-col items-center gap-1 text-slate-600 disabled:opacity-40 active:text-primary-600 transition-colors"
        >
          <Eye className="w-5 h-5" />
          <span className="text-xs font-medium">预览</span>
        </button>

        <button
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className="flex flex-col items-center gap-1 text-slate-600 active:text-accent-600 transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-medium">押韵</span>
        </button>
      </nav>

      {/* Auth Modal - Rendered at root level with highest z-index */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Preview Modal */}
      {showPreview && <Preview onClose={() => setShowPreview(false)} />}

      {/* Onboarding */}
      <Onboarding onComplete={() => {}} />
    </div>
  );
}