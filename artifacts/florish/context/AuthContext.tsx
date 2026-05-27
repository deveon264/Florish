import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  UserProfile,
  getUserProfile,
  saveUserProfile,
  isOnboardingComplete,
  setOnboardingComplete,
  isPaywallPassed,
  setPaywallPassed,
  isSessionActive,
  setSessionActive,
  clearSession,
} from "@/lib/storage";

const ADMIN_EMAIL = "6ixbelowna@gmail.com";
const SESSION_KEY = "florish_session_active";

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
  hasProfile: boolean;
  updateUser: (profile: UserProfile) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completePaywall: () => Promise<void>;
  signIn: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboardingComplete, setOnboardingState] = useState(false);
  const [paywallPassed, setPaywallState] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      if (__DEV__) {
        // In dev mode, auto-login admin UNLESS the user explicitly logged out
        const sessionVal = await AsyncStorage.getItem(SESSION_KEY);
        if (sessionVal === "false") {
          // User logged out — show sign-in screen, but flag that profile exists
          setUser(null);
          setOnboardingState(false);
          setPaywallState(false);
          setHasProfile(true);
          return;
        }
        // First launch or session not cleared — auto-login admin
        await saveUserProfile(DEV_ADMIN_PROFILE);
        await setOnboardingComplete();
        await setPaywallPassed();
        await setSessionActive(true);
        setUser(DEV_ADMIN_PROFILE);
        setOnboardingState(true);
        setPaywallState(true);
        setHasProfile(true);
        return;
      }

      // Production: require active session
      const [profile, onb, paywall, session] = await Promise.all([
        getUserProfile(),
        isOnboardingComplete(),
        isPaywallPassed(),
        isSessionActive(),
      ]);
      setHasProfile(!!profile);
      if (!session) {
        setUser(null);
        setOnboardingState(false);
        setPaywallState(false);
        return;
      }
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
    await setSessionActive(true);
    setOnboardingState(true);
  };

  const completePaywall = async () => {
    await setPaywallPassed();
    setPaywallState(true);
  };

  const signIn = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const profile = await getUserProfile();
    if (!profile) {
      return { success: false, error: "No account found. Please create an account first." };
    }
    if (profile.email.toLowerCase() !== email.trim().toLowerCase()) {
      return { success: false, error: "No account found with that email address." };
    }
    const [onb, paywall] = await Promise.all([isOnboardingComplete(), isPaywallPassed()]);
    await setSessionActive(true);
    setUser(profile);
    setOnboardingState(onb);
    setPaywallState(paywall);
    return { success: true };
  };

  const logout = async () => {
    // Keep profile + fitness data; only clear the session so users can sign back in
    await clearSession();
    setUser(null);
    setOnboardingState(false);
    setPaywallState(false);
    // hasProfile stays true — profile still exists in storage for sign-in
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
        hasProfile,
        updateUser,
        completeOnboarding,
        completePaywall,
        signIn,
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
