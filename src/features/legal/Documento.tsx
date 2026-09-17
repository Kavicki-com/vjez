import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  cores,
  espaco,
  familia,
  fonte,
  larguraMaximaConteudo,
  linha,
  raio,
} from '@/theme/tokens';

import { VIGENCIA, faltaPreencher } from './responsavel';

/**
 * A casca dos dois documentos legais (termos e privacidade).
 *
 * Existe para que os dois tenham a mesma tipografia e a mesma largura de
 * leitura: documento legal se lê em coluna estreita, com parágrafo de
 * verdade — não em cartão com bala, que é como estava e fazia o texto
 * parecer lista de recursos.
 */
export function Documento({
  titulo,
  resumo,
  children,
}: {
  titulo: string;
  resumo: string;
  children: React.ReactNode;
}) {
  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.coluna}>
        {faltaPreencher && (
          <View style={styles.aviso}>
            <Text style={styles.avisoTexto}>
              Antes de publicar nas lojas: preencher razão social, CNPJ e
              endereço em <Negrito>src/features/legal/responsavel.ts</Negrito> e
              passar os dois documentos por revisão jurídica.
            </Text>
          </View>
        )}

        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.resumo}>{resumo}</Text>
        <Text style={styles.vigencia}>Em vigor desde {VIGENCIA}.</Text>

        {children}
      </View>
    </ScrollView>
  );
}

/** Seção numerada. O número ajuda quem cita o documento por e-mail. */
export function Secao({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>
        {numero}. {titulo}
      </Text>
      <View style={styles.secaoCorpo}>{children}</View>
    </View>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragrafo}>{children}</Text>;
}

export function Item({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.item}>
      <View style={styles.marcador} />
      <Text style={styles.itemTexto}>{children}</Text>
    </View>
  );
}

export function Negrito({ children }: { children: React.ReactNode }) {
  return <Text style={styles.negrito}>{children}</Text>;
}

/**
 * O par do outro documento, no pé.
 *
 * Os dois moram em rotas separadas porque as lojas pedem uma URL para a
 * política de privacidade e outra para os termos; o link cruzado é o que
 * faz quem chegou por uma achar a outra.
 */
export function Rodape({ href, rotulo }: { href: Href; rotulo: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.navigate(href)}
      style={({ pressed }) => [styles.rodape, pressed && styles.rodapePressionado]}
    >
      <Text style={styles.rodapeTexto}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, paddingBottom: espaco.xl, alignItems: 'center' },
  coluna: { width: '100%', maxWidth: larguraMaximaConteudo, gap: espaco.sm },

  aviso: {
    padding: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.primariaSuave,
    borderWidth: 1,
    borderColor: cores.primaria,
    marginBottom: espaco.sm,
  },
  avisoTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.primaria,
  },

  titulo: {
    fontSize: fonte.titulo,
    lineHeight: linha.titulo,
    fontFamily: familia.extraForte,
    color: cores.texto,
  },
  resumo: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
  vigencia: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.contorno,
    marginBottom: espaco.sm,
  },

  secao: { gap: espaco.sm, marginTop: espaco.md },
  secaoTitulo: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  secaoCorpo: { gap: espaco.sm },

  paragrafo: {
    fontSize: fonte.corpo,
    lineHeight: 26,
    fontFamily: familia.normal,
    color: cores.texto,
  },
  item: { flexDirection: 'row', gap: espaco.sm },
  marcador: {
    width: 6,
    height: 6,
    borderRadius: raio.pill,
    backgroundColor: cores.primaria,
    marginTop: 9,
  },
  itemTexto: {
    flex: 1,
    fontSize: fonte.corpo,
    lineHeight: 26,
    fontFamily: familia.normal,
    color: cores.texto,
  },
  negrito: { fontFamily: familia.forte },

  rodape: {
    marginTop: espaco.lg,
    padding: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    alignItems: 'center',
  },
  rodapePressionado: { backgroundColor: cores.fundoSuave },
  rodapeTexto: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.forte,
    color: cores.primaria,
  },
});
