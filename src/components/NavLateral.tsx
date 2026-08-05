import { Ionicons } from '@expo/vector-icons';
import { type Href, router, usePathname } from 'expo-router';
// O expo-router traz a própria cópia do drawer; importar do @react-navigation
// aqui gera dois tipos incompatíveis de DrawerContentComponentProps.
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from 'expo-router/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  cores,
  espaco,
  familia,
  fonte,
  raio,
} from '@/theme/tokens';

type Destino = {
  href: Href;
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  iconeAtivo: keyof typeof Ionicons.glyphMap;
};

/** As 3 abas. Em tela larga elas viram itens da lateral. */
const PRINCIPAIS: Destino[] = [
  { href: '/', rotulo: 'Início', icone: 'trail-sign-outline', iconeAtivo: 'trail-sign' },
  { href: '/dicionario', rotulo: 'Dicionário', icone: 'book-outline', iconeAtivo: 'book' },
  { href: '/perfil', rotulo: 'Perfil', icone: 'person-outline', iconeAtivo: 'person' },
];

const SECUNDARIOS: Destino[] = [
  { href: '/configuracoes', rotulo: 'Configurações', icone: 'settings-outline', iconeAtivo: 'settings' },
  { href: '/conta', rotulo: 'Conta', icone: 'person-circle-outline', iconeAtivo: 'person-circle' },
  { href: '/privacidade', rotulo: 'Privacidade e termos', icone: 'shield-checkmark-outline', iconeAtivo: 'shield-checkmark' },
];

function estaAtivo(pathname: string, href: Href): boolean {
  const alvo = String(href);
  return alvo === '/' ? pathname === '/' : pathname.startsWith(alvo);
}

function Item({ destino, ativo }: { destino: Destino; ativo: boolean }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: ativo }}
      onPress={() => router.navigate(destino.href)}
      style={({ pressed }) => [
        styles.item,
        ativo && styles.itemAtivo,
        pressed && !ativo && styles.itemPressionado,
      ]}
    >
      <Ionicons
        name={ativo ? destino.iconeAtivo : destino.icone}
        size={22}
        color={ativo ? cores.primaria : cores.textoSuave}
      />
      <Text
        numberOfLines={1}
        style={[styles.rotulo, ativo && styles.rotuloAtivo]}
      >
        {destino.rotulo}
      </Text>
    </Pressable>
  );
}

/** Conteúdo do drawer: gaveta no celular, lateral fixa em tela larga. */
export function NavLateral(props: DrawerContentComponentProps) {
  const pathname = usePathname();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.conteudo}
      style={styles.fundo}
    >
      <View style={styles.marca}>
        <Text style={styles.marcaTexto}>vjež</Text>
      </View>

      <View style={styles.grupo}>
        {PRINCIPAIS.map((d) => (
          <Item key={String(d.href)} destino={d} ativo={estaAtivo(pathname, d.href)} />
        ))}
      </View>

      <View style={styles.divisor} />

      <View style={styles.grupo}>
        {SECUNDARIOS.map((d) => (
          <Item key={String(d.href)} destino={d} ativo={estaAtivo(pathname, d.href)} />
        ))}
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  fundo: { backgroundColor: cores.superficie },
  conteudo: { paddingHorizontal: espaco.sm, paddingBottom: espaco.lg },
  marca: {
    paddingHorizontal: espaco.sm,
    paddingTop: espaco.sm,
    paddingBottom: espaco.lg,
  },
  marcaTexto: {
    fontSize: fonte.titulo,
    fontFamily: familia.forte,
    color: cores.primaria,
    letterSpacing: -0.5,
  },
  grupo: { gap: espaco.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    paddingVertical: espaco.sm + espaco.xs,
    paddingHorizontal: espaco.sm,
    borderRadius: raio.md,
  },
  itemAtivo: { backgroundColor: cores.primariaSuave },
  itemPressionado: { backgroundColor: cores.fundoSuave },
  rotulo: {
    fontSize: fonte.corpo,
    color: cores.textoSuave,
    fontFamily: familia.medio,
    flexShrink: 1,
  },
  rotuloAtivo: { color: cores.primaria },
  divisor: {
    height: 1,
    backgroundColor: cores.borda,
    marginVertical: espaco.md,
    marginHorizontal: espaco.sm,
  },
});
