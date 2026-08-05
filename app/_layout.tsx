import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProvedorPreferencias } from '@/features/config/Preferencias';
import { ProvedorProgresso } from '@/features/perfil/ProgressoLocal';

// Segura a splash até a Nunito estar pronta: sem isso a tela pisca
// na fonte do sistema e depois salta para a da marca.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontesProntas] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });

  // Cache em memória: acelera a navegação e serve de base para o offline.
  const [cliente] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  useEffect(() => {
    if (fontesProntas) void SplashScreen.hideAsync();
  }, [fontesProntas]);

  if (!fontesProntas) return null;

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
