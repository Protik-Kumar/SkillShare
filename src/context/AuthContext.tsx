import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testConnection } from '../lib/firebase';
import { AppMode, Profile, User } from '../types';
import { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_PROFILES, SEED_USERS } from '../data/seedData';
import { calculateProfileCompletion } from '../utils/formatters';

interface AuthContextType {
  currentUser: User | null;
  currentProfile: Profile | null;
  loading: boolean;
  currentMode: AppMode;
  isAdmin: boolean;
  switchMode: (mode: AppMode) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, roleMode: 'freelancer' | 'client') => Promise<void>;
  loginAsDemo: (type: 'admin' | 'freelancer' | 'client') => void;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'skillshare_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setCurrentProfile(null);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      return;
    }
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));

    // Try finding profile from seed or localStorage
    const savedProfiles = localStorage.getItem('skillshare_profiles');
    let list: Profile[] = SEED_PROFILES;
    if (savedProfiles) {
      try {
        list = JSON.parse(savedProfiles);
      } catch (e) {
        list = SEED_PROFILES;
      }
    }

    const found = list.find((p) => p.uid === currentUser.uid);
    if (found) {
      setCurrentProfile(found);
    } else {
      // Default initial profile
      const newProf: Profile = {
        uid: currentUser.uid,
        name: currentUser.displayName || 'New Member',
        headline: currentUser.currentMode === 'freelancer' ? 'Skill Provider' : 'Client & Hirer',
        bio: 'Welcome to my SkillShare profile!',
        location: 'Dhaka, Bangladesh',
        skills: ['Web Development', 'Design'],
        skillLevel: 'Intermediate',
        hourlyRate: 1200,
        education: [],
        experience: [],
        portfolio: [],
        availability: 'Available',
        rating: 5.0,
        reviewCount: 0,
        completedJobs: 0,
        completionPercentage: 55,
      };
      setCurrentProfile(newProf);
    }
  }, [currentUser]);

  // Firebase auth state listener & connection verification
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const isAdminUser =
          fbUser.email === SEED_ADMIN_EMAIL ||
          fbUser.email === 'protikkumarsaha29@gmail.com';

        const userObj: User = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          role: isAdminUser ? 'admin' : 'user',
          currentMode: isAdminUser ? 'admin' : 'freelancer',
          isSuspended: false,
          isVerified: true,
          walletBalance: 10000,
          pendingEscrowBalance: 0,
          totalEarned: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
        };

        // Try reading Firestore user
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as User;
            setCurrentUser(data);
          } else {
            setCurrentUser(userObj);
            try {
              await setDoc(doc(db, 'users', fbUser.uid), userObj);
            } catch (err) {
              // Ignore if offline
            }
          }
        } catch {
          setCurrentUser(userObj);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchMode = (mode: AppMode) => {
    if (!currentUser) return;
    const updated = { ...currentUser, currentMode: mode };
    setCurrentUser(updated);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const isAdminUser =
        fbUser.email === SEED_ADMIN_EMAIL ||
        fbUser.email === 'protikkumarsaha29@gmail.com';

      const userObj: User = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Google User',
        photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        role: isAdminUser ? 'admin' : 'user',
        currentMode: isAdminUser ? 'admin' : 'freelancer',
        isSuspended: false,
        isVerified: true,
        walletBalance: 15000,
        pendingEscrowBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(userObj);
    } catch (err) {
      console.warn('Google sign in error:', err);
      // Fallback demo user if popups are blocked in dev preview
      loginAsDemo('freelancer');
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    // Check demo admin
    if (email.toLowerCase() === SEED_ADMIN_EMAIL.toLowerCase()) {
      if (pass === SEED_ADMIN_PASSWORD) {
        const adminUser = SEED_USERS.find((u) => u.email === SEED_ADMIN_EMAIL)!;
        setCurrentUser(adminUser);
        return;
      }
    }

    // Check demo users
    const matchedSeed = SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matchedSeed) {
      setCurrentUser(matchedSeed);
      return;
    }

    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = res.user;
      const userObj: User = {
        uid: fbUser.uid,
        email: fbUser.email || email,
        displayName: fbUser.displayName || email.split('@')[0],
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        role: 'user',
        currentMode: 'freelancer',
        isSuspended: false,
        isVerified: true,
        walletBalance: 12000,
        pendingEscrowBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(userObj);
    } catch (err) {
      // Create user session if firebase auth not enabled on project
      const dummyUser: User = {
        uid: `usr-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        role: 'user',
        currentMode: 'freelancer',
        isSuspended: false,
        isVerified: true,
        walletBalance: 10000,
        pendingEscrowBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(dummyUser);
    }
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    pass: string,
    roleMode: 'freelancer' | 'client'
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = res.user;
      const userObj: User = {
        uid: fbUser.uid,
        email: fbUser.email || email,
        displayName: name,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        role: 'user',
        currentMode: roleMode,
        isSuspended: false,
        isVerified: true,
        walletBalance: 5000,
        pendingEscrowBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(userObj);
    } catch (err) {
      // Local account creation
      const newUser: User = {
        uid: `usr-${Date.now()}`,
        email,
        displayName: name,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        role: 'user',
        currentMode: roleMode,
        isSuspended: false,
        isVerified: true,
        walletBalance: 5000,
        pendingEscrowBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(newUser);
    }
  };

  const loginAsDemo = (type: 'admin' | 'freelancer' | 'client') => {
    if (type === 'admin') {
      const admin = SEED_USERS.find((u) => u.role === 'admin')!;
      setCurrentUser(admin);
    } else if (type === 'freelancer') {
      const free = SEED_USERS.find((u) => u.uid === 'freelancer-001')!;
      setCurrentUser(free);
    } else {
      const cli = SEED_USERS.find((u) => u.uid === 'client-001')!;
      setCurrentUser(cli);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore
    }
    setCurrentUser(null);
    setCurrentProfile(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const updateProfile = async (updated: Partial<Profile>) => {
    if (!currentProfile) return;
    const merged = { ...currentProfile, ...updated };
    merged.completionPercentage = calculateProfileCompletion(merged);
    setCurrentProfile(merged);

    // Save to localStorage
    const savedProfiles = localStorage.getItem('skillshare_profiles');
    let list: Profile[] = SEED_PROFILES;
    if (savedProfiles) {
      try {
        list = JSON.parse(savedProfiles);
      } catch {
        list = SEED_PROFILES;
      }
    }
    const idx = list.findIndex((p) => p.uid === merged.uid);
    if (idx >= 0) {
      list[idx] = merged;
    } else {
      list.push(merged);
    }
    localStorage.setItem('skillshare_profiles', JSON.stringify(list));

    // Try firestore update
    try {
      await setDoc(doc(db, 'profiles', merged.uid), merged, { merge: true });
    } catch {
      // Fallback
    }
  };

  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email === SEED_ADMIN_EMAIL ||
    currentUser?.email === 'protikkumarsaha29@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentProfile,
        loading,
        currentMode: currentUser?.currentMode || 'freelancer',
        isAdmin,
        switchMode,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
