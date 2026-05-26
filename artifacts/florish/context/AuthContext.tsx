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

type AuthState = {
  user: UserProfile | null;
  onboardingComplete: boolean;
  paywallPassed: boolean;
  isLoading: boolean;
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

  return (
    <AuthContext.Provider
      value={{
        user,
        onboardingComplete,
        paywallPassed,
        isLoading,
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
