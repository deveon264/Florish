import React, { createContext, useContext, useEffect, useState } from "react";
import {
  UserProfile,
  getUserProfile,
  saveUserProfile,
  isOnboardingComplete,
  setOnboardingComplete,
  isPaywallPassed,
  setPaywallPassed,
} from "@/lib/storage";
import { useReplitAuth } from "@/lib/replit-auth";

const ADMIN_EMAIL = "6ixbelowna@gmail.com";

const DEV_ADMIN_PROFILE: UserProfile = {
  name: "Ndili",
  email: ADMIN_EMAIL,
  fitnessGoal: "general_fitness",
  age: 28,
  weightKg: 65,
  heightCm: 170,
  dailyWaterGoalMl: 2500,
  dailyCalorieGoal: 1800,
  createdAt: new Date().toISOString(),
};

type AuthState = {
  user: UserProfile | null;
  onboardingComplete: boolean;
  paywallPassed: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean;
  updateUser: (profile: UserProfile) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completePaywall: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: replitUser, isLoading: authLoading, login, logout: replitLogout } = useReplitAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboardingComplete, setOnboardingState] = useState(false);
  const [paywallPassed, setPaywallState] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const isAdmin = replitUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const load = async () => {
    setProfileLoading(true);
    try {
      if (!replitUser) {
        setUser(null);
        setOnboardingState(false);
        setPaywallState(false);
        const p = await getUserProfile();
        setHasProfile(!!p);
        return;
      }

      if (isAdmin) {
        await saveUserProfile(DEV_ADMIN_PROFILE);
        setUser(DEV_ADMIN_PROFILE);
        setOnboardingState(true);
        setPaywallState(true);
        setHasProfile(true);
        return;
      }

      const [profile, onb, paywall] = await Promise.all([
        getUserProfile(),
        isOnboardingComplete(),
        isPaywallPassed(),
      ]);
      setHasProfile(!!profile);
      setUser(profile);
      setOnboardingState(onb);
      setPaywallState(paywall);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      load();
    }
  }, [replitUser, authLoading]);

  const updateUser = async (profile: UserProfile) => {
    await saveUserProfile(profile);
    setUser(profile);
    setHasProfile(true);
  };

  const completeOnboarding = async () => {
    await setOnboardingComplete();
    setOnboardingState(true);
  };

  const completePaywall = async () => {
    await setPaywallPassed();
    setPaywallState(true);
  };

  const logout = async () => {
    setUser(null);
    setOnboardingState(false);
    setPaywallState(false);
    await replitLogout();
  };

  const isAuthenticated = !!replitUser;
  const isLoading = authLoading || profileLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        onboardingComplete,
        paywallPassed,
        isLoading,
        isAdmin,
        isAuthenticated,
        hasProfile,
        updateUser,
        completeOnboarding,
        completePaywall,
        login,
        logout,
        reload: load,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
