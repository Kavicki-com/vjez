import { Drawer } from 'expo-router/drawer';

import { NavLateral } from '@/components/NavLateral';
import {
  cores,
  familia,
  fonte,
  larguraNavLateral,
} from '@/theme/tokens';
import { useLayout } from '@/theme/useLayout';

export default function DrawerLayout() {
  const { largo } = useLayout();

  return (
    <Drawer
      drawerContent={NavLateral}
      screenOptions={{
        headerShown: false,
        // Tela larga: lateral sempre visível. Estreita: gaveta por cima.
        drawerType: largo ? 'permanent' : 'front',
        drawerStyle: {
          width: larguraNavLateral,
          backgroundColor: cores.superficie,
          borderRightColor: cores.borda,
          borderRightWidth: largo ? 1 : 0,
        },
        overlayColor: 'rgba(30, 30, 30, 0.35)',
        sceneStyle: { backgroundColor: cores.fundo },
        headerStyle: { backgroundColor: cores.superficie },
        headerShadowVisible: false,
        headerTintColor: cores.texto,
        headerTitleStyle: { fontSize: fonte.subtitulo, fontFamily: familia.forte },
      }}
    >
      {/* As abas trazem o próprio cabeçalho; as telas do menu usam o do drawer. */}
      <Drawer.Screen name="(tabs)" />
      <Drawer.Screen
        name="configuracoes"
        options={{ headerShown: true, title: 'Configurações' }}
      />
      <Drawer.Screen
        name="conta"
        options={{ headerShown: true, title: 'Conta' }}
      />
      <Drawer.Screen
        name="privacidade"
        options={{ headerShown: true, title: 'Privacidade e termos' }}
      />
    </Drawer>
  );
}
