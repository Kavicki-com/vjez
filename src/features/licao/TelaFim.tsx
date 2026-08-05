import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { Confete } from '@/components/Confete';
import { Sahovnica } from '@/components/Sahovnica';
import {
  CHECKPOINT_NOTA_MINIMA,
  NOTA_MAXIMA_LICAO,
  XP_POR_PONTO,
} from '@/lib/regras';
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

type Props = {
  titulo: string;
  nota: number;
  acertos: number;
  total: number;
  aoSair: () => void;
};

/**
 * Comemoração de fim de lição, no formato bento dos mockups.
 * O confete só cai quando a lição foi bem — comemorar um resultado ruim
 * soa deboche.
 */
export function TelaFim({ titulo, nota, acertos, total, aoSair }: Props) {
  const fracao = nota / NOTA_MAXIMA_LICAO;
  const foiBem = fracao >= CHECKPOINT_NOTA_MINIMA;
  const xp = Math.round(nota * XP_POR_PONTO);

  return (
    <View style={styles.tela}>
      {foiBem && <Confete />}

      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coluna}>
          <View style={styles.medalhaCaixa}>
            <View style={[styles.medalha, !foiBem && styles.medalhaNeutra]}>
              <Ionicons
                name={foiBem ? 'trophy' : 'flag'}
                size={64}
                color={cores.superficie}
              />
            </View>
          </View>

          <Text style={styles.titulo}>
            {foiBem ? 'Lição concluída!' : 'Lição encerrada'}
          </Text>
          <Text style={styles.subtitulo}>{titulo}</Text>

          <View style={styles.bento}>
            <View style={[styles.celula, styles.celulaNota]}>
              <Sahovnica altura={6} noTopo />
              <View style={styles.celulaCorpo}>
                <View style={[styles.selo, styles.seloPrimario]}>
                  <Ionicons name="school" size={22} color={cores.superficie} />
                </View>
                <Text style={styles.celulaValor}>
                  {nota.toFixed(1).replace('.', ',')}
                </Text>
                <Text style={styles.celulaRotulo}>
                  de {NOTA_MAXIMA_LICAO} pontos
                </Text>
              </View>
            </View>

            <View style={styles.celula}>
              <View style={styles.celulaCorpo}>
                <View style={[styles.selo, styles.seloSecundario]}>
                  <Ionicons name="flash" size={22} color={cores.superficie} />
                </View>
                <Text style={styles.celulaValor}>+{xp}</Text>
                <Text style={styles.celulaRotulo}>XP ganho</Text>
              </View>
            </View>
          </View>

          <View style={styles.barraCaixa}>
            <View style={styles.barra}>
              <View
                style={[
                  styles.barraCheia,
                  { width: `${Math.max(fracao * 100, 3)}%` },
                  !foiBem && styles.barraCheiaNeutra,
                ]}
              />
            </View>
            <Text style={styles.barraLegenda}>
              {acertos} de {total} exercícios certos.{' '}
              {foiBem
                ? 'Bom o bastante para seguir em frente.'
                : 'Errar não trava a trilha — dá para refazer quando quiser.'}
            </Text>
          </View>

          <Botao rotulo="Voltar para a trilha" aoTocar={aoSair} />
        </View>
      </ScrollView>
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

  medalhaCaixa: { padding: espaco.sm },
  medalha: {
    width: 128,
    height: 128,
    borderRadius: raio.pill,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalhaNeutra: { backgroundColor: cores.contorno },

  titulo: {
    fontSize: fonte.gigante,
    lineHeight: linha.gigante,
    letterSpacing: tracking.titulo,
    fontFamily: familia.extraForte,
    color: cores.primaria,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    textAlign: 'center',
  },

  bento: {
    flexDirection: 'row',
    gap: espaco.md,
    width: '100%',
    marginTop: espaco.sm,
  },
  celula: {
    flex: 1,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    overflow: 'hidden',
  },
  celulaNota: { borderColor: cores.primaria },
  celulaCorpo: { alignItems: 'center', gap: espaco.xs, padding: espaco.md },
  selo: {
    width: 44,
    height: 44,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.xs,
  },
  seloPrimario: { backgroundColor: cores.primaria },
  seloSecundario: { backgroundColor: cores.secundaria },
  celulaValor: {
    fontSize: fonte.tituloGrande,
    lineHeight: linha.tituloGrande,
    letterSpacing: tracking.titulo,
    fontFamily: familia.extraForte,
    color: cores.texto,
  },
  celulaRotulo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
    textAlign: 'center',
  },

  barraCaixa: { width: '100%', gap: espaco.sm, marginVertical: espaco.sm },
  barra: {
    height: 10,
    borderRadius: raio.pill,
    backgroundColor: cores.superficieVariante,
    overflow: 'hidden',
  },
  barraCheia: { height: '100%', backgroundColor: cores.primaria },
  barraCheiaNeutra: { backgroundColor: cores.contorno },
  barraLegenda: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    textAlign: 'center',
  },
});
