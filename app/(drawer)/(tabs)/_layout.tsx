import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
// A partir do SDK 56 o expo-router não fala mais com @react-navigation:
// tudo que é de drawer sai daqui.
import { DrawerToggleButton } from 'expo-router/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores, espaco, fonte, peso } from '@/theme/tokens';
import { useLayout } from '@/theme/useLayout';

/**
 * Altura da barra sem contar a safe area do aparelho.
 * Precisa caber ícone (24) + rótulo (17) + respiros sem espremer a caixa
 * do texto — quando falta folga, o flex encolhe o rótulo e corta os acentos.
 */
const ALTURA_BARRA = 68;

export default function TabsLayout() {
  const { largo } = useLayout();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      // Em tela larga a navegação vive na lateral permanente; sem barra inferior.
      tabBar={largo ? () => null : undefined}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: cores.superficie },
        headerShadowVisible: false,
        headerTintColor: cores.texto,
        headerTitleStyle: { fontSize: fonte.subtitulo, fontWeight: peso.forte },
        // A lateral já dá acesso a tudo; o botão de menu só existe quando ela é gaveta.
        headerLeft: largo
          ? undefined
          : () => (
              <DrawerToggleButton
                tintColor={cores.texto}
                accessibilityLabel="Abrir menu"
              />
            ),
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarStyle: {
          backgroundColor: cores.superficie,
          borderTopColor: cores.borda,
          height: ALTURA_BARRA + insets.bottom,
          paddingTop: espaco.sm,
          paddingBottom: insets.bottom + espaco.sm,
        },
        tabBarItemStyle: { paddingVertical: 0 },
        // Sem lineHeight explícito a caixa do rótulo fica menor que o glifo
        // e corta acentos e descidas de "Início"/"Dicionário".
        tabBarLabelStyle: {
          fontSize: fonte.pequena,
          lineHeight: fonte.pequena + 4,
          fontWeight: peso.medio,
        },
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'trail-sign' : 'trail-sign-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dicionario"
        options={{
          title: 'Dicionário',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
