import React, { useRef, useEffect } from 'react';
import {
  User,
  Sun,
  Moon,
  LogOut,
  Users,
  GraduationCap,
  ShieldCheck,
  Check,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const {
    currentUser,
    isAuthenticated,
    theme,
    toggleTheme,
    setTheme,
    logout,
    registeredUsers,
    switchUser,
  } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-72 bg-[#272D35] border border-white/10 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.45)] z-50 p-3 text-xs overflow-hidden"
    >
      {/* User Info Header */}
      {currentUser ? (
        <div className="p-2 bg-[#1A1E23] border border-[#30363D] rounded-lg mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#22272E] border border-[#30363D] flex items-center justify-center font-mono text-xs font-semibold text-[#A9CBE5]">
              {currentUser.avatarInitials}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#E6EDF3] truncate">
                  {currentUser.name}
                </span>
                {currentUser.isVerifiedStudent && (
                  <span
                    className="p-0.5 rounded-[2px] bg-[#4A6B82]/20 text-[#A9CBE5]"
                    title="Student verification verified"
                  >
                    <ShieldCheck className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#8B949E] truncate">
                {currentUser.email}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#21262D] text-[10px] text-[#8B949E] space-y-0.5">
            <div className="truncate text-[#C2C7CD]">
              {currentUser.university}
            </div>
            <div className="truncate text-[#8B949E]">
              {currentUser.major}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#1A1E23] border border-[#30363D] rounded-lg mb-3 text-center">
          <p className="text-[#8B949E] text-xs mb-2">Not currently signed in.</p>
          <button
            onClick={() => {
              onClose();
              onOpenAuth('login');
            }}
            className="w-full py-1.5 rounded-[4px] bg-[#4A6B82] text-white text-xs font-medium"
          >
            Sign In / Sign Up
          </button>
        </div>
      )}

      {/* Theme Choice Section */}
      <div className="p-2 border-b border-[#30363D] pb-3 mb-2">
        <span className="block text-[10px] uppercase font-mono text-[#8B949E] mb-1.5">
          Appearance Theme:
        </span>
        <div className="grid grid-cols-2 gap-1.5 bg-[#161A1E] p-1 rounded-[4px] border border-[#30363D]">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-1.5 py-1 text-xs rounded-[3px] transition-colors ${
              theme === 'dark'
                ? 'bg-[#22272E] text-[#E6EDF3] font-medium shadow-xs'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-[#A9CBE5]" />
            <span>Dark</span>
            {theme === 'dark' && <Check className="w-3 h-3 text-[#A9CBE5]" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-1.5 py-1 text-xs rounded-[3px] transition-colors ${
              theme === 'light'
                ? 'bg-[#22272E] text-[#E6EDF3] font-medium shadow-xs'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-[#D2BA93]" />
            <span>Light</span>
            {theme === 'light' && <Check className="w-3 h-3 text-[#A9CBE5]" />}
          </button>
        </div>
      </div>

      {/* Switch Student Accounts */}
      {registeredUsers.length > 1 && (
        <div className="p-1 mb-2">
          <span className="block text-[10px] uppercase font-mono text-[#8B949E] mb-1 px-1">
            Switch Profile:
          </span>
          <div className="space-y-1">
            {registeredUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  switchUser(u.id);
                  onClose();
                }}
                className={`w-full px-2 py-1.5 rounded-[4px] flex items-center justify-between text-left transition-colors ${
                  currentUser?.id === u.id
                    ? 'bg-[#22272E] text-[#E6EDF3]'
                    : 'text-[#8B949E] hover:bg-[#1E232A] hover:text-[#E6EDF3]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-4 h-4 rounded-[2px] bg-[#161A1E] text-[9px] font-mono flex items-center justify-center text-[#A9CBE5]">
                    {u.avatarInitials}
                  </span>
                  <span className="text-xs truncate">{u.name}</span>
                </div>
                {currentUser?.id === u.id && (
                  <Check className="w-3.5 h-3.5 text-[#A9CBE5]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Account Actions */}
      <div className="pt-2 border-t border-[#30363D] space-y-1">
        <button
          onClick={() => {
            onClose();
            onOpenAuth('signup');
          }}
          className="w-full px-2 py-1.5 rounded-[4px] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1E232A] flex items-center gap-2 transition-colors text-left"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Another Account</span>
        </button>

        {currentUser && (
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full px-2 py-1.5 rounded-[4px] text-[#F87171] hover:bg-[#8C5353]/15 flex items-center gap-2 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
};
