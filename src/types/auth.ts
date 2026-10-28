export interface UserAccount {
  id: string;
  name: string;
  email: string;
  university: string;
  major: string;
  avatarInitials: string;
  themePreference: 'dark' | 'light';
  isVerifiedStudent?: boolean;
}

export interface AuthState {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
}
