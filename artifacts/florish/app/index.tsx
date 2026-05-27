import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function EntryScreen() {
  const { user, onboardingComplete, paywallPassed, isLoading, hasProfile } = useAuth();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Not logged in — route to sign-in if they have an account, otherwise full onboarding
  if (!user || !onboardingComplete) {
    if (hasProfile) {
      return <Redirect href="/onboarding/signin" />;
    }
    return <Redirect href="/onboarding/welcome" />;
  }

  if (!paywallPassed) {
    return <Redirect href="/paywall" />;
  }

  return <Redirect href="/(tabs)" />;
}
