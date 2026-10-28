import React, { useState } from 'react';
import {
  Plus,
  Users,
  Download,
  RotateCcw,
  SlidersHorizontal,
  Calendar,
  Wallet,
  Grid3X3,
  CheckCircle2,
  Sun,
  Moon,
  User,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { WorkspaceConfig } from '../types/budget';
import { useAuth } from '../context/AuthContext';
import { AccountMenu } from './AccountMenu';

interface HeaderProps {
  workspace: WorkspaceConfig;
  currentView: 'dashboard' | 'budgets' | 'splits' | 'recurring';
  onViewChange: (view: 'dashboard' | 'budgets' | 'splits' | 'recurring') => void;
  onOpenNewTx: () => void;
  onOpenSplitBill: () => void;
  onExportCSV: () => void;
  onResetDemo: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  daysRemaining: number;
  dailyAllowance: number;
}

export const Header: React.FC<HeaderProps> = ({
  workspace,
  currentView,
  onViewChange,
  onOpenNewTx,
  onOpenSplitBill,
  onExportCSV,
  onResetDemo,
  onOpenAuth,
  daysRemaining,
  dailyAllowance,
}) => {
  const { currentUser, isAuthenticated, theme, toggleTheme } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  return (
    <header className="border-b border-[#30363D] bg-[#111417] sticky top-0 z-30 transition-colors">
      {/* Top utility strip */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#21262D]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4A6B82]" />
            <span className="font-medium tracking-tight text-[#E6EDF3]">
              {workspace.name}
            </span>
          </div>
          <span className="text-[#30363D]">|</span>
          <span className="text-[#8B949E]">
            {workspace.semester} • Oct 2026
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded-[4px] bg-[#1A1E23] text-[#8B949E] border border-[#30363D] font-mono text-[10px]">
            tnum: active
          </span>
        </div>

        {/* Realtime Pacing, Theme Toggle, Account controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[#8B949E]">
            <span>Cycle Pace:</span>
            <span className="tabular-nums font-mono font-medium text-[#E6EDF3]">
              ${dailyAllowance.toFixed(2)}/day
            </span>
            <span className="text-[#6E7681]">({daysRemaining}d left)</span>
          </div>

          <span className="hidden sm:inline text-[#30363D]">|</span>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] text-xs text-[#8B949E] hover:text-[#E6EDF3] bg-[#1A1E23] border border-[#30363D] hover:border-[#4A6B82] transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#D2BA93]" />
                <span className="text-[11px] font-medium hidden md:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#A9CBE5]" />
                <span className="text-[11px] font-medium hidden md:inline">Dark</span>
              </>
            )}
          </button>

          {/* Account Profile / Login Button */}
          <div className="relative">
            {isAuthenticated && currentUser ? (
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-[4px] bg-[#1A1E23] hover:bg-[#22272E] border border-[#30363D] hover:border-[#4A6B82] transition-colors"
                title="Account Settings & Profile"
              >
                <span className="w-4 h-4 rounded-[2px] bg-[#22272E] text-[#A9CBE5] font-mono text-[9px] flex items-center justify-center font-bold">
                  {currentUser.avatarInitials}
                </span>
                <span className="text-xs font-medium text-[#E6EDF3] hidden sm:inline max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.isVerifiedStudent && (
                  <ShieldCheck className="w-3 h-3 text-[#A9CBE5]" />
                )}
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#4A6B82]/20 hover:bg-[#4A6B82]/30 text-[#A9CBE5] border border-[#4A6B82]/40 text-xs font-medium transition-colors"
              >
                <LogIn className="w-3 h-3" />
                <span>Log In / Sign Up</span>
              </button>
            )}

            <AccountMenu
              isOpen={isAccountMenuOpen}
              onClose={() => setIsAccountMenuOpen(false)}
              onOpenAuth={onOpenAuth}
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onExportCSV}
              title="Export Ledger as CSV"
              className="p-1.5 rounded-[4px] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1A1E23] border border-transparent hover:border-[#30363D] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Reset local financial ledger to student demo state?')) {
                  onResetDemo();
                }
              }}
              title="Reset to Student Preset"
              className="p-1.5 rounded-[4px] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1A1E23] border border-transparent hover:border-[#30363D] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation & action bar */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[4px] bg-[#1A1E23] border border-[#30363D] flex items-center justify-center text-[#A9CBE5]">
              <Grid3X3 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-[#E6EDF3] uppercase">
                Utilitarian Slate Budget
              </h1>
              <p className="text-[11px] text-[#8B949E] tracking-normal font-normal">
                Discreet financial architecture for students
              </p>
            </div>
          </div>

          {/* Navigation segmented buttons */}
          <nav className="flex items-center bg-[#161A1E] p-0.5 rounded-[4px] border border-[#30363D] overflow-x-auto">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`px-3 py-1 text-xs font-medium rounded-[3px] transition-colors whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'bg-[#22272E] text-[#E6EDF3] shadow-xs'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              Dashboard (3-Col)
            </button>
            <button
              onClick={() => onViewChange('budgets')}
              className={`px-3 py-1 text-xs font-medium rounded-[3px] transition-colors whitespace-nowrap ${
                currentView === 'budgets'
                  ? 'bg-[#22272E] text-[#E6EDF3] shadow-xs'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              Envelopes & Velocity
            </button>
            <button
              onClick={() => onViewChange('splits')}
              className={`px-3 py-1 text-xs font-medium rounded-[3px] transition-colors whitespace-nowrap ${
                currentView === 'splits'
                  ? 'bg-[#22272E] text-[#E6EDF3] shadow-xs'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              Roommate Splits
            </button>
            <button
              onClick={() => onViewChange('recurring')}
              className={`px-3 py-1 text-xs font-medium rounded-[3px] transition-colors whitespace-nowrap ${
                currentView === 'recurring'
                  ? 'bg-[#22272E] text-[#E6EDF3] shadow-xs'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              Commitments
            </button>
          </nav>
        </div>

        {/* Action Affordances */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSplitBill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] bg-transparent text-[#E6EDF3] border border-[#30363D] hover:bg-[#22272E] transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>Split Bill</span>
          </button>

          <button
            onClick={onOpenNewTx}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-[4px] bg-[#4A6B82] text-white hover:bg-[#5A7E98] focus:outline-none focus:ring-2 focus:ring-[#4A6B82] focus:ring-offset-2 focus:ring-offset-[#111417] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Transaction</span>
            <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 bg-[#3A566A] rounded-[2px] text-[10px] font-mono opacity-80">
              N
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
