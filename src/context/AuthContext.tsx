import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount } from '../types/auth';

interface AuthContextType {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  signup: (
    name: string,
    email: string,
    university: string,
    major: string,
    password?: string
  ) => { success: boolean; error?: string };
  logout: () => void;
  registeredUsers: UserAccount[];
  switchUser: (userId: string) => void;
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-michelle',
    name: 'Michelle Lubna',
    email: 'michellelubna7@gmail.com',
    university: 'University of California, Berkeley',
    major: 'Computer Science (Graduate TA)',
    avatarInitials: 'ML',
    themePreference: 'dark',
    isVerifiedStudent: true,
  },
  {
    id: 'user-alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@berkeley.edu',
    university: 'University of California, Berkeley',
    major: 'Mechanical Engineering (Senior)',
    avatarInitials: 'AR',
    themePreference: 'dark',
    isVerifiedStudent: true,
  },
];

const STORAGE_KEY_AUTH = 'utilitarian_budget_auth_user_v1';
const STORAGE_KEY_USERS = 'utilitarian_budget_all_users_v1';
const STORAGE_KEY_THEME = 'utilitarian_budget_theme_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) return JSON.parse(saved);
      return DEFAULT_USERS[0]; // Start logged in with user email
    } catch {
      return DEFAULT_USERS[0];
    }
  });

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'light' || saved === 'dark') return saved;
      return currentUser?.themePreference || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.documentElement.classList.add('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Save users & current session
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users:', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch (e) {
      console.warn('Failed to save auth state:', e);
    }
  }, [currentUser]);

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    if (currentUser) {
      const updated = { ...currentUser, themePreference: newTheme };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, error: 'No account found with this email. Please sign up.' };
    }
    setCurrentUser(found);
    if (found.themePreference) {
      setThemeState(found.themePreference);
    }
    return { success: true };
  };

  const signup = (
    name: string,
    email: string,
    university: string,
    major: string,
    password?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const initials = name
      .trim()
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'ST';

    const newUser: UserAccount = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      university: university.trim() || 'University Campus',
      major: major.trim() || 'Student',
      avatarInitials: initials,
      themePreference: theme,
      isVerifiedStudent: cleanEmail.includes('.edu') || cleanEmail.includes('ac.uk'),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      if (target.themePreference) {
        setThemeState(target.themePreference);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        theme,
        toggleTheme,
        setTheme,
        login,
        signup,
        logout,
        registeredUsers: users,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
