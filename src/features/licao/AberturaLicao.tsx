import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { Imagem } from '@/components/Imagem';
import { Sahovnica } from '@/components/Sahovnica';
import { etiquetaDoCaso } from '@/lib/padez';
import {
  cores,
  espaco,
  familia,
  fonte,
  larguraMaximaConteudo,
  linha,
  raio,
  tracking,
} from '@/theme/tokens';
import type { Padez } from '@/types/schema';

type Props = {
  titulo: string;
  intro: string | null;
  ilustracao: string | null;
  padez: Padez | null;
  quantidadeDeExercicios: number;
  aoComecar: () => void;
};

/**
 * Primeira tela da lição: o que se aprende aqui, antes do primeiro exercício.
 *
 * O texto vem da curadoria (licoes.intro_pt); a ilustração é o glifo que ela
 * escolheu. Sem intro cadastrada a tela não aparece — quem decide é o
 * conteúdo, não o código.
 */
export function AberturaLicao({
  titulo,
  intro,
  ilustracao,
  padez,
  quantidadeDeExercicios,
  aoComecar,
}: Props) {
  // O campo aceita URL de ilustração ou nome de glifo: a curadoria troca de
  // um para o outro sem mexer no código.
  const eUrl = Boolean(ilustracao?.startsWith('http'));
  const [ilustracaoFalhou, setIlustracaoFalhou] = useState(false);
  const icone = (eUrl ? 'book' : (ilustracao ?? 'book')) as keyof typeof Ionicons.glyphMap;

  return (
    <View style={styles.tela}>
      <Sahovnica altura={6} />

      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coluna}>
          {eUrl && ilustracao && !ilustracaoFalhou ? (
            <Imagem
              url={ilustracao}
              altura={200}
              ajuste="contain"
              rotuloAcessivel={`Ilustração da lição ${titulo}`}
              aoFalhar={() => setIlustracaoFalhou(true)}
            />
          ) : (
            <View style={styles.ilustracao}>
              <Ionicons name={icone} size={72} color={cores.primaria} />
            </View>
          )}

          {padez && (
            <View style={styles.selo}>
              <Text style={styles.seloTexto}>{etiquetaDoCaso(padez)}</Text>
            </View>
          )}

          <Text style={styles.titulo}>{titulo}</Text>

          {intro && <Text style={styles.intro}>{intro}</Text>}

          <View style={styles.rodapeInfo}>
            <Ionicons
              name="list-outline"
              size={18}
              color={cores.textoSuave}
            />
            <Text style={styles.infoTexto}>
              {quantidadeDeExercicios} exercícios · vale 10 pontos
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.rodape}>
        <View style={styles.coluna}>
          <Botao rotulo="Começar" aoTocar={aoComecar} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: espaco.md,
    alignItems: 'center',
  },
  coluna: {
    width: '100%',
    maxWidth: larguraMaximaConteudo,
    gap: espaco.md,
    alignItems: 'center',
  },
  ilustracao: {
    width: 140,
    height: 140,
    borderRadius: raio.pill,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.sm,
  },
  selo: {
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.xs,
    borderRadius: raio.pill,
    backgroundColor: cores.secundariaSuave,
  },
  seloTexto: {
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.forte,
    color: cores.sobreSecundariaContainer,
    letterSpacing: tracking.rotulo,
  },
  titulo: {
    fontSize: fonte.tituloGrande,
    lineHeight: linha.tituloGrande,
    letterSpacing: tracking.titulo,
    fontFamily: familia.extraForte,
    color: cores.texto,
    textAlign: 'center',
  },
  intro: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    textAlign: 'center',
  },
  rodapeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    marginTop: espaco.sm,
  },
  infoTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },
  rodape: {
    padding: espaco.md,
    borderTopWidth: 2,
    borderTopColor: cores.borda,
    borderStyle: 'dashed',
    backgroundColor: cores.superficie,
    alignItems: 'center',
  },
});
