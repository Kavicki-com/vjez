import { Ionicons } from '@expo/vector-icons';
import { type Href, router, usePathname } from 'expo-router';
// O expo-router traz a própria cópia do drawer; importar do @react-navigation
// aqui gera dois tipos incompatíveis de DrawerContentComponentProps.
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from 'expo-router/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useEhCurador } from '@/features/admin/hooks';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
  sombraSolida,
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

/**
 * Consulta. Não é aba: é material que o aluno abre no meio de uma lição
 * para conferir uma terminação e fecha em seguida. Fica no grupo de cima
 * porque é conteúdo, não ajuste do app.
 */
const CONSULTA: Destino[] = [
  { href: '/padezi', rotulo: 'Padeži', icone: 'grid-outline', iconeAtivo: 'grid' },
];

/**
 * A curadoria, para quem tem papel para isso.
 *
 * Aparece por último e separada: é ferramenta de trabalho, não parte do
 * aprender. Um aluno nunca vê este item — e mesmo que chegue em /admin
 * pela URL, a RLS do banco recusa cada gravação.
 */
const CURADORIA: Destino = {
  href: '/admin',
  rotulo: 'Curadoria',
  icone: 'construct-outline',
  iconeAtivo: 'construct',
};

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
        color={ativo ? cores.superficie : cores.secundariaSuave}
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
  const { ehCurador } = useEhCurador();

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
        {[...PRINCIPAIS, ...CONSULTA].map((d) => (
          <Item key={String(d.href)} destino={d} ativo={estaAtivo(pathname, d.href)} />
        ))}
      </View>

      <View style={styles.divisor} />

      <View style={styles.grupo}>
        {SECUNDARIOS.map((d) => (
          <Item key={String(d.href)} destino={d} ativo={estaAtivo(pathname, d.href)} />
        ))}
        {ehCurador && (
          <Item destino={CURADORIA} ativo={estaAtivo(pathname, CURADORIA.href)} />
        )}
      </View>
    </DrawerContentScrollView>
  );
}

/**
 * A lateral é um painel azul sólido, e tudo dentro dela é branco.
 * Como o fundo já é a cor de ênfase, o estado ativo não pode ser mais
 * azul: ele se separa por profundidade (pílula em azul escuro) e por
 * peso do texto — branco cheio no ativo, branco recuado no resto.
 */
const styles = StyleSheet.create({
  fundo: { backgroundColor: cores.secundaria },
  conteudo: {
    flexGrow: 1,
    backgroundColor: cores.secundaria,
    paddingHorizontal: espaco.sm,
    paddingBottom: espaco.lg,
  },
  marca: {
    paddingHorizontal: espaco.sm,
    paddingTop: espaco.sm,
    paddingBottom: espaco.lg,
  },
  marcaTexto: {
    fontSize: fonte.titulo, lineHeight: linha.titulo,
    fontFamily: familia.forte,
    color: cores.superficie,
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
  itemAtivo: { backgroundColor: cores.sobreSecundariaContainer },
  itemPressionado: { backgroundColor: sombraSolida.secundaria },
  rotulo: {
    fontSize: fonte.corpo, lineHeight: linha.corpo,
    color: cores.secundariaSuave,
    fontFamily: familia.medio,
    flexShrink: 1,
  },
  rotuloAtivo: { color: cores.superficie, fontFamily: familia.forte },
  divisor: {
    height: 1,
    backgroundColor: sombraSolida.secundaria,
    marginVertical: espaco.md,
    marginHorizontal: espaco.sm,
  },
});
