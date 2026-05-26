import React, { createContext, useContext, useEffect, useState } from "react";
import {
  UserProfile,
  getUserProfile,
  saveUserProfile,
  isOnboardingComplete,
  setOnboardingComplete,
  isPaywallPassed,
  setPaywallPassed,
  clearAll,
} from "@/lib/storage";

const ADMIN_EMAIL = "6ixbelowna@gmail.com";

const DEV_ADMIN_PROFILE: UserProfile = {
  name: "Dillish",
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
  updateUser: (profile: UserProfile) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completePaywall: () => Promise<void>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboardingComplete, setOnboardingState] = useState(false);
  const [paywallPassed, setPaywallState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      if (__DEV__) {
        await saveUserProfile(DEV_ADMIN_PROFILE);
        await setOnboardingComplete();
        await setPaywallPassed();
        setUser(DEV_ADMIN_PROFILE);
        setOnboardingState(true);
        setPaywallState(true);
        return;
      }
      const [profile, onb, paywall] = await Promise.all([
        getUserProfile(),
        isOnboardingComplete(),
        isPaywallPassed(),
      ]);
      setUser(profile);
      setOnboardingState(onb);
      setPaywallState(paywall);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateUser = async (profile: UserProfile) => {
    await saveUserProfile(profile);
    setUser(profile);
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
    await clearAll();
    setUser(null);
    setOnboardingState(false);
    setPaywallState(false);
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        onboardingComplete,
        paywallPassed,
        isLoading,
        isAdmin,
        updateUser,
        completeOnboarding,
        completePaywall,
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
