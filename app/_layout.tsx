import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProvedorPreferencias } from '@/features/config/Preferencias';
import { ProvedorProgresso } from '@/features/perfil/ProgressoLocal';

export default function RootLayout() {
  // Cache em memória: acelera a navegação e serve de base para o offline.
  const [cliente] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={cliente}>
        <ProvedorPreferencias>
          <ProvedorProgresso>
            <SafeAreaProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }} />
            </SafeAreaProvider>
          </ProvedorProgresso>
        </ProvedorPreferencias>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
