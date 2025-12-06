import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import React from "react";
import { Spinner, View } from "tamagui"; // Agregué View por si acaso

export default function Layout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <Spinner size="large" color="$purple9" />;
  }

  return (
    <Stack>
      <Stack.Protected guard={isSignedIn}>
        {/* CORRECCIÓN: Aquí apuntamos a la carpeta (app) */}
        <Stack.Screen name="(app)" options={{ headerShown: false }} />

        <Stack.Screen name="new-entry" options={{ headerShown: false }} />
        <Stack.Screen name="edit-entry/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="entry/[id]" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen 
          name="sign-in" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="sign-up" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="alert-modal" 
          options={{ 
            headerShown: false, 
            presentation: "modal" 
          }} 
        />
      </Stack.Protected>
    </Stack>
  );
}
// Cambio para forzar actualizacion