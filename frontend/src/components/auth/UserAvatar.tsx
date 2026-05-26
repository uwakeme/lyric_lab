// User avatar component - Refined
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Cloud, User, ChevronDown } from 'lucide-react';

interface UserAvatarProps {
  onLoginClick: () => void;
}

export function UserAvatar({ onLoginClick }: UserAvatarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = () => {
    if (!user?.email) return '?';
    return user.email[0].toUpperCase();
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium text-sm shadow-sm hover:shadow-md"
      >
        <User className="w-4 h-4" />
        <span>登录</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
          {getInitial()}
        </div>
        <span className="hidden sm:block text-sm text-slate-700 font-medium">
          {user?.email?.split('@')[0]}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-[60] animate-scale-in overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setShowMenu(false);
                // TODO: Show cloud versions
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Cloud className="w-4 h-4 text-slate-400" />
              云端版本
            </button>
            <button
              onClick={() => {
                logout();
                setShowMenu(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}