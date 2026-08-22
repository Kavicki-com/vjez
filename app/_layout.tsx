import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProvedorPreferencias } from '@/features/config/Preferencias';
import { MigracaoDeProgresso } from '@/features/conta/migracao';
import { ProvedorProgresso } from '@/features/perfil/ProgressoLocal';
import { useFontesDaMarca } from '@/theme/fontes';

// Segura a splash até a Nunito Sans estar pronta: sem isso a tela pisca
// na fonte do sistema e depois salta para a da marca.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Na web isto já nasce pronto: a fonte é webfont declarada no <head>
  // (app/+html.tsx) e baixa em paralelo com o bundle. No nativo, é o
  // expo-font carregando as TTF. Ver @/theme/fontes.
  const fontesProntas = useFontesDaMarca();

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

  // Enquanto a fonte não vem, só o <head>: o export estático renderiza este
  // componente com as fontes ainda carregando, e nada que venha depois de um
  // `return null` chega ao HTML — era por isso que a aba saía sem nome.
  if (!fontesProntas) return <Cabeca />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={cliente}>
        <ProvedorPreferencias>
          <ProvedorProgresso>
            <SafeAreaProvider>
              <StatusBar style="dark" />
              {/* Fica na raiz: o login pode acontecer em qualquer tela. */}
              <MigracaoDeProgresso />
              <Cabeca />
              <Stack screenOptions={{ headerShown: false, title: 'Vjež' }} />
            </SafeAreaProvider>
          </ProvedorProgresso>
        </ProvedorPreferencias>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

/** Título e descrição da página no web. No nativo, o <Head> é inócuo. */
function Cabeca() {
  return (
    <Head>
      <title>Vjež</title>
      <meta
        name="description"
        content="Croata do zero para falantes de português: os sete casos, áudio e uma lição por dia."
      />
    </Head>
  );
}
