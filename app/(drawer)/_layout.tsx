import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

import { cores } from '@/theme/tokens';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: cores.primaria,
        drawerInactiveTintColor: cores.textoSuave,
        drawerActiveBackgroundColor: cores.primariaSuave,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Início',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="configuracoes"
        options={{
          headerShown: true,
          title: 'Configurações',
          drawerLabel: 'Configurações',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="conta"
        options={{
          headerShown: true,
          title: 'Conta',
          drawerLabel: 'Conta',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="privacidade"
        options={{
          headerShown: true,
          title: 'Privacidade e termos',
          drawerLabel: 'Privacidade e termos',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer>
  );
}
