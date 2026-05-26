import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="water" />
    </Stack>
  );
}
