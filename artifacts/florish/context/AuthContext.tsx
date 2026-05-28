import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  UserProfile,
  getUserProfile,
  saveUserProfile,
  isOnboardingComplete,
  setOnboardingComplete,
  isPaywallPassed,
  setPaywallPassed,
} from "@/lib/storage";

const ADMIN_EMAIL = "6ixbelowna@gmail.com";
const AUTH_TOKEN_KEY = "auth_session_token";

// SecureStore doesn't work in web iframes (localStorage is blocked).
// Fall back to AsyncStorage on web.
async function storeToken(token: string): Promise<void> {
  if (Platform.OS !== "web") {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } else {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

async function loadToken(): Promise<string | null> {
  if (Platform.OS !== "web") {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  }
  return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

async function clearToken(): Promise<void> {
  if (Platform.OS !== "web") {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } else {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

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

function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_DOMAIN) {
    return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  }
  return "";
}

interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

type AuthState = {
  user: UserProfile | null;
  authUser: AuthUser | null;
  onboardingComplete: boolean;
  paywallPassed: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean;
  updateUser: (profile: UserProfile) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completePaywall: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, firstName?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboardingComplete, setOnboardingState] = useState(false);
  const [paywallPassed, setPaywallState] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const isAdmin = authUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const fetchAuthUser = useCallback(async () => {
    try {
      const token = await loadToken();
      if (!token) {
        setAuthUser(null);
        return;
      }
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user) {
        setAuthUser(data.user);
      } else {
        await clearToken();
        setAuthUser(null);
      }
    } catch {
      setAuthUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthUser();
  }, [fetchAuthUser]);

  const load = useCallback(async () => {
    setProfileLoading(true);
    try {
      if (!authUser) {
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
  }, [authUser, isAdmin]);

  useEffect(() => {
    if (!isAuthLoading) {
      load();
    }
  }, [authUser, isAuthLoading, load]);

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Login failed" };
      }
      await storeToken(data.token);
      setAuthUser(data.user);
      return {};
    } catch {
      return { error: "Network error. Please try again." };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, firstName?: string): Promise<{ error?: string }> => {
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Registration failed" };
      }
      await storeToken(data.token);
      setAuthUser(data.user);
      return {};
    } catch {
      return { error: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = await loadToken();
      if (token) {
        const apiBase = getApiBaseUrl();
        await fetch(`${apiBase}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {}
    await clearToken();
    setAuthUser(null);
    setUser(null);
    setOnboardingState(false);
    setPaywallState(false);
  }, []);

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

  const isAuthenticated = !!authUser;
  const isLoading = isAuthLoading || profileLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
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
        register,
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
