import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  GraduationCap,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signup, registeredUsers, switchUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('University of California, Berkeley');
  const [major, setMajor] = useState('Computer Science');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg('Please enter an account email.');
      return;
    }

    const res = login(email, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Login failed.');
    } else {
      onClose();
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email are required.');
      return;
    }

    const res = signup(name, email, university, major, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Signup failed.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-[#272D35] border border-white/10 rounded-xl w-full max-w-md shadow-[0_8px_24px_rgba(0,0,0,0.45)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[4px] bg-[#1A1E23] border border-[#30363D] flex items-center justify-center text-[#A9CBE5]">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#E6EDF3] tracking-tight">
                {mode === 'login' ? 'Sign In to Ledger Account' : 'Create Student Account'}
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Utilitarian Slate Budget • Secure Local Session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#323538] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-2 gap-1 bg-[#161A1E] p-1 rounded-[4px] border border-[#30363D]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-1.5 text-xs font-medium rounded-[3px] transition-colors ${
                mode === 'login'
                  ? 'bg-[#22272E] text-[#E6EDF3] shadow-xs'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`py-1.5 text-xs font-medium rounded-[3px] transition-colors ${
                mode === 'signup'
                  ? 'bg-[#22272E] text-[#E6EDF3] shadow-xs'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-5 mt-3 p-2.5 bg-[#8C5353]/15 border border-[#8C5353]/30 rounded-[4px] flex items-center gap-2 text-xs text-[#FFB4AB]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-5 space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                Student Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-xs pl-9 pr-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                Password / Passkey
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-xs pl-9 pr-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
                />
              </div>
            </div>

            {/* Quick Demo Accounts Switcher */}
            <div className="pt-2 border-t border-[#30363D]">
              <span className="block text-[10px] font-mono uppercase text-[#6E7681] mb-2">
                1-Click Quick Accounts:
              </span>
              <div className="space-y-1.5">
                {registeredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      switchUser(u.id);
                      onClose();
                    }}
                    className="w-full px-2.5 py-1.5 rounded-[4px] bg-[#161A1E] hover:bg-[#22272E] border border-[#30363D] flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-[2px] bg-[#22272E] text-[#A9CBE5] font-mono text-[10px] flex items-center justify-center font-semibold">
                        {u.avatarInitials}
                      </span>
                      <div>
                        <span className="text-xs font-medium text-[#E6EDF3] block">
                          {u.name}
                        </span>
                        <span className="text-[10px] text-[#8B949E]">
                          {u.email}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#A9CBE5] font-mono flex items-center gap-1">
                      Sign in <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#30363D] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-[4px] bg-transparent text-[#E6EDF3] border border-[#30363D] hover:bg-[#22272E] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[4px] bg-[#4A6B82] text-white hover:bg-[#5A7E98] text-xs font-medium"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="p-5 space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                Full Legal / Student Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Michelle Lubna"
                  className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-xs pl-9 pr-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                Student Email (.edu or personal) *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="michelle@university.edu"
                  className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-xs pl-9 pr-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                  University / College
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]" />
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="UC Berkeley"
                    className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-xs pl-9 pr-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                  Major / Standing
                </label>
                <div className="relative">
                  <GraduationCap className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]" />
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-xs pl-9 pr-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                Password (Optional)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-xs pl-9 pr-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#30363D] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-[4px] bg-transparent text-[#E6EDF3] border border-[#30363D] hover:bg-[#22272E] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[4px] bg-[#4A6B82] text-white hover:bg-[#5A7E98] text-xs font-medium"
              >
                Create Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
