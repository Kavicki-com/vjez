import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Carregando, Erro } from '@/components/Estados';
import { BotaoAudio } from '@/features/audio/BotaoAudio';
import { useAudioDeTexto } from '@/features/audio/useAudioDeTexto';
import { nomeDoCaso } from '@/lib/padez';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
} from '@/theme/tokens';
import type { CasoPadez, Padez, TerminacaoPadez } from '@/types/schema';

import { usePadezi } from './hooks';

/** Linhas da grade, na ordem em que a gramática croata apresenta. */
const GENEROS = [
  { valor: 'm', rotulo: 'Masculino' },
  { valor: 'f', rotulo: 'Feminino' },
  { valor: 'n', rotulo: 'Neutro' },
] as const;

/**
 * Quadro dos 7 casos. É consulta, não exercício: fica sanfonado porque a
 * grade inteira dos sete não cabe numa tela de 390px sem virar tabela
 * rolante — e tabela rolante no celular ninguém lê.
 */
export function TabelaPadezi() {
  const { data, isPending, isError } = usePadezi();
  // Um aberto por vez: com dois abertos o aluno perde a referência de onde
  // está na lista ao rolar.
  const [aberto, setAberto] = useState<Padez | null>(null);

  if (isPending) return <Carregando />;
  if (isError) return <Erro />;

  return (
    <FlatList
      data={data}
      keyExtractor={(caso) => caso.id}
      contentContainerStyle={styles.lista}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Text style={styles.ajuda}>
          Toque num caso para ver as terminações e um exemplo.
        </Text>
      }
      renderItem={({ item }) => (
        <CartaoDoCaso
          caso={item}
          aberto={item.padez === aberto}
          aoAlternar={() =>
            setAberto((atual) => (atual === item.padez ? null : item.padez))
          }
        />
      )}
    />
  );
}

function CartaoDoCaso({
  caso,
  aberto,
  aoAlternar,
}: {
  caso: CasoPadez;
  aberto: boolean;
  aoAlternar: () => void;
}) {
  const { data: audios } = useAudioDeTexto();
  const audioDoExemplo = audios?.get(caso.exemplo_hr);

  return (
    <View style={[styles.cartao, aberto && styles.cartaoAberto]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        onPress={aoAlternar}
        style={({ pressed }) => [
          styles.cabecalho,
          pressed && styles.cabecalhoPressionado,
        ]}
      >
        <View style={styles.selo}>
          <Text style={styles.numero}>{caso.numero}</Text>
        </View>
        <View style={styles.tituloTexto}>
          <Text style={styles.nome}>{nomeDoCaso(caso.padez)}</Text>
          <Text style={styles.pergunta}>{caso.pergunta_hr}</Text>
        </View>
        <Ionicons
          name={aberto ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={cores.contorno}
        />
      </Pressable>

      {aberto && (
        <View style={styles.corpo}>
          <Text style={styles.perguntaPt}>{caso.pergunta_pt}</Text>
          <Text style={styles.uso}>{caso.uso_pt}</Text>

          {caso.preposicoes_hr.length > 0 && (
            <View style={styles.preposicoes}>
              <Text style={styles.rotuloBloco}>Preposições</Text>
              <View style={styles.chips}>
                {caso.preposicoes_hr.map((prep) => (
                  <View key={prep} style={styles.chip}>
                    <Text style={styles.chipTexto}>{prep}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Grade
            terminacoes={caso.terminacoes}
            urlDe={(forma) => audios?.get(forma)}
          />

          <View style={styles.exemplo}>
            <View style={styles.exemploTexto}>
              <Text style={styles.exemploHr}>{caso.exemplo_hr}</Text>
              <Text style={styles.exemploPt}>{caso.exemplo_pt}</Text>
            </View>
            {audioDoExemplo && (
              <BotaoAudio url={audioDoExemplo} rotulo={caso.exemplo_hr} />
            )}
          </View>

          {caso.nota_pt && <Text style={styles.nota}>{caso.nota_pt}</Text>}
        </View>
      )}
    </View>
  );
}

type PropsAudio = {
  /** Sem URL, a forma não fala e não mostra o alto-falante. */
  urlDe: (forma: string) => string | undefined;
};

/** Terminações em gênero × número, com a palavra-modelo já flexionada. */
function Grade({
  terminacoes,
  urlDe,
}: { terminacoes: TerminacaoPadez[] } & PropsAudio) {
  const achar = (genero: string, plural: boolean) =>
    terminacoes.find((t) => t.genero === genero && t.plural === plural);

  return (
    <View style={styles.grade}>
      <View style={styles.gradeLinha}>
        <Text style={[styles.gradeRotulo, styles.gradeTituloColuna]} />
        <Text style={[styles.gradeCelula, styles.gradeTituloColuna]}>
          Singular
        </Text>
        <Text style={[styles.gradeCelula, styles.gradeTituloColuna]}>
          Plural
        </Text>
      </View>

      {GENEROS.map(({ valor, rotulo }) => (
        <View key={valor} style={[styles.gradeLinha, styles.gradeLinhaDado]}>
          <Text style={styles.gradeRotulo}>{rotulo}</Text>
          <Celula terminacao={achar(valor, false)} urlDe={urlDe} />
          <Celula terminacao={achar(valor, true)} urlDe={urlDe} />
        </View>
      ))}
    </View>
  );
}

/**
 * A célula toca ao toque na própria palavra, sem botão: com até 48 formas
 * abertas, um botão por forma viraria uma parede de ícones.
 */
function Celula({
  terminacao,
  urlDe,
}: { terminacao?: TerminacaoPadez } & PropsAudio) {
  if (!terminacao) return <View style={styles.gradeCelula} />;

  return (
    <View style={styles.gradeCelula}>
      <Text style={styles.terminacao}>{terminacao.terminacao}</Text>
      {/* Duas formas quando a terminação alterna: cada uma fala a sua, e
          ouvir "grad" sem "prijatelja" atrás é o ponto. */}
      {terminacao.exemplos_hr.map((forma) => (
        <Forma key={forma} forma={forma} url={urlDe(forma)} />
      ))}
    </View>
  );
}

/**
 * Uma forma da grade, com o próprio player.
 *
 * Player por forma, e não um compartilhado para a grade inteira trocando de
 * faixa. A versão anterior fazia isso — `replace()` seguido de `play()` — e
 * perdia a corrida: `replace()` destrói o elemento de áudio e chama `pause()`
 * nele, e se o `play()` anterior ainda não tinha resolvido o navegador rejeita
 * a promessa com `AbortError` e nada toca. As formas daqui são curtas
 * (`gradu`, `ženom`, `polju`), meio segundo cada, que é justamente onde essa
 * corrida se perde sempre.
 *
 * São até 48 players num cartão aberto, e um por vez fica aberto. É o mesmo
 * desenho do `EscolherForma`, pelo mesmo motivo.
 */
function Forma({ forma, url }: { forma: string; url?: string }) {
  const player = useAudioPlayer(url ? { uri: url } : null);

  return (
    <Pressable
      accessibilityRole={url ? 'button' : 'text'}
      accessibilityLabel={url ? `Ouvir ${forma}` : forma}
      disabled={!url}
      onPress={() => {
        if (!url) return;
        player.seekTo(0);
        player.play();
      }}
      style={({ pressed }) => [
        styles.formaCelula,
        pressed && url && styles.formaPressionada,
      ]}
    >
      <Text style={styles.exemploCelula}>{forma}</Text>
      {url && <Ionicons name="volume-low" size={13} color={cores.contorno} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lista: { gap: espaco.sm, paddingVertical: espaco.md },
  ajuda: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    marginBottom: espaco.sm,
  },

  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  cartaoAberto: { borderColor: cores.primariaSuave },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
  },
  cabecalhoPressionado: { backgroundColor: cores.fundoSuave },
  selo: {
    width: 36,
    height: 36,
    borderRadius: raio.pill,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.forte,
    color: cores.primaria,
  },
  tituloTexto: { flex: 1, gap: 2 },
  nome: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  pergunta: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    fontStyle: 'italic',
  },

  corpo: {
    gap: espaco.md,
    paddingHorizontal: espaco.md,
    paddingBottom: espaco.md,
  },
  perguntaPt: {
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },
  uso: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.texto,
  },

  preposicoes: { gap: espaco.sm },
  rotuloBloco: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.contorno,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  chip: {
    paddingHorizontal: espaco.sm,
    paddingVertical: 2,
    borderRadius: raio.sm,
    backgroundColor: cores.superficieAlta,
  },
  chipTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },

  grade: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.md,
    overflow: 'hidden',
  },
  gradeLinha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaco.sm,
    paddingHorizontal: espaco.sm,
    paddingVertical: espaco.sm,
    backgroundColor: cores.fundoSuave,
  },
  gradeLinhaDado: {
    backgroundColor: cores.superficie,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  gradeTituloColuna: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.contorno,
  },
  // Colunas por proporção, não por px: em 390px a grade é apertada e em
  // tablet ela abre junto com o cartão.
  gradeRotulo: {
    flex: 1.1,
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },
  gradeCelula: { flex: 1.4, gap: 2 },
  terminacao: {
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.forte,
    color: cores.primaria,
  },
  formaCelula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
  },
  formaPressionada: { opacity: 0.6 },
  exemploCelula: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    flexShrink: 1,
  },

  exemplo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.fundoSuave,
  },
  exemploTexto: { flex: 1, gap: 2 },
  exemploHr: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  exemploPt: {
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    fontStyle: 'italic',
  },

  nota: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
});
