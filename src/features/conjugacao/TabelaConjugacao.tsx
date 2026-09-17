import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Carregando, Erro } from '@/components/Estados';
import { BotaoAudio } from '@/features/audio/BotaoAudio';
import { useAudioDeTexto } from '@/features/audio/useAudioDeTexto';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
} from '@/theme/tokens';
import type { Lice, PessoaVerbal, TempoVerbal, VerboModelo } from '@/types/schema';

import { useConjugacao } from './hooks';

/**
 * Os três tempos, na ordem em que se aprende. O nome croata fica à vista
 * como nos Padeži — é assim que o aluno vai ver em livro e em aula — com a
 * tradução em PT logo abaixo, que é a regra 1.
 */
const TEMPOS: { valor: TempoVerbal; hr: string; pt: string; dica_pt: string }[] = [
  {
    valor: 'prezent',
    hr: 'Prezent',
    pt: 'presente',
    dica_pt: 'A terminação sozinha já diz quem fala — por isso o pronome some.',
  },
  {
    valor: 'perfekt',
    hr: 'Perfekt',
    pt: 'passado',
    dica_pt:
      'Duas palavras: o verbo biti + o particípio. E o particípio concorda com o GÊNERO de quem fala.',
  },
  {
    valor: 'futur',
    hr: 'Futur',
    pt: 'futuro',
    dica_pt: 'O mais fácil dos três: não muda por gênero, só por pessoa.',
  },
];

/**
 * Quadro das pessoas e dos tempos. É consulta, não exercício: fica sanfonado
 * pelo mesmo motivo do Padeži — as seis pessoas × três tempos × quatro
 * verbos não cabem numa tela de 390px sem virar tabela rolante.
 *
 * Aberto por PESSOA, e não por tempo, porque a pergunta que traz o aluno
 * aqui é "como eu digo *eu* trabalhei?" — ele chega sabendo a pessoa e vem
 * buscar a forma.
 */
export function TabelaConjugacao() {
  const { data, isPending, isError } = useConjugacao();
  // Uma aberta por vez: com duas abertas o aluno perde a referência de onde
  // está na lista ao rolar.
  const [aberta, setAberta] = useState<Lice | null>(null);

  if (isPending) return <Carregando />;
  if (isError) return <Erro />;

  return (
    <FlatList
      data={data.pessoas}
      keyExtractor={(pessoa) => pessoa.id}
      contentContainerStyle={styles.lista}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Text style={styles.ajuda}>
          Toque numa pessoa para ver como ela conjuga nos três tempos. Toque
          numa forma croata para ouvir.
        </Text>
      }
      renderItem={({ item }) => (
        <CartaoDaPessoa
          pessoa={item}
          verbos={data.verbos}
          aberta={item.lice === aberta}
          aoAlternar={() =>
            setAberta((atual) => (atual === item.lice ? null : item.lice))
          }
        />
      )}
    />
  );
}

function CartaoDaPessoa({
  pessoa,
  verbos,
  aberta,
  aoAlternar,
}: {
  pessoa: PessoaVerbal;
  verbos: VerboModelo[];
  aberta: boolean;
  aoAlternar: () => void;
}) {
  const { data: audios } = useAudioDeTexto();
  const audioDoExemplo = audios?.get(pessoa.exemplo_hr);

  return (
    <View style={[styles.cartao, aberta && styles.cartaoAberto]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: aberta }}
        onPress={aoAlternar}
        style={({ pressed }) => [
          styles.cabecalho,
          pressed && styles.cabecalhoPressionado,
        ]}
      >
        <View style={styles.selo}>
          <Text style={styles.numero}>{pessoa.numero}</Text>
        </View>
        <View style={styles.tituloTexto}>
          {/* O pronome croata é o título; a tradução vem embaixo, como no
              Padeži o nome do caso vem antes da pergunta em PT. */}
          <Text style={styles.nome}>{pessoa.pronomes_hr.join(' / ')}</Text>
          <Text style={styles.pergunta}>{pessoa.pronome_pt}</Text>
        </View>
        <Ionicons
          name={aberta ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={cores.contorno}
        />
      </Pressable>

      {aberta && (
        <View style={styles.corpo}>
          <Text style={styles.uso}>{pessoa.uso_pt}</Text>

          {TEMPOS.map((tempo) => (
            <BlocoDoTempo
              key={tempo.valor}
              tempo={tempo}
              verbos={verbos}
              formaDe={(infinitivo) =>
                pessoa.formas.find(
                  (f) => f.tempo === tempo.valor && f.infinitivo_hr === infinitivo,
                )?.formas_hr
              }
              urlDe={(forma) => audios?.get(forma)}
            />
          ))}

          <View style={styles.exemplo}>
            <View style={styles.exemploTexto}>
              <Text style={styles.exemploHr}>{pessoa.exemplo_hr}</Text>
              <Text style={styles.exemploPt}>{pessoa.exemplo_pt}</Text>
            </View>
            {audioDoExemplo && (
              <BotaoAudio url={audioDoExemplo} rotulo={pessoa.exemplo_hr} />
            )}
          </View>

          {pessoa.nota_pt && <Text style={styles.nota}>{pessoa.nota_pt}</Text>}
        </View>
      )}
    </View>
  );
}

/**
 * Um tempo verbal: o rótulo, o que ele tem de diferente, e uma linha por
 * verbo-modelo.
 *
 * Linha por verbo, e não uma grade de quatro colunas: em 390px quatro
 * colunas de "radila sam" viram quebra de linha em toda célula. Empilhado,
 * cada verbo fica legível e o padrão (-am, -im, -em) aparece na vertical,
 * que é como se compara.
 */
function BlocoDoTempo({
  tempo,
  verbos,
  formaDe,
  urlDe,
}: {
  tempo: (typeof TEMPOS)[number];
  verbos: VerboModelo[];
  formaDe: (infinitivo: string) => string[] | undefined;
  urlDe: (forma: string) => string | undefined;
}) {
  return (
    <View style={styles.tempo}>
      <View style={styles.tempoCabecalho}>
        <Text style={styles.tempoHr}>{tempo.hr}</Text>
        <Text style={styles.tempoPt}>{tempo.pt}</Text>
      </View>
      <Text style={styles.tempoDica}>{tempo.dica_pt}</Text>

      <View style={styles.grade}>
        {verbos.map((verbo, i) => {
          const formas = formaDe(verbo.infinitivo_hr);
          return (
            <View
              key={verbo.id}
              style={[styles.gradeLinha, i > 0 && styles.gradeLinhaSeguinte]}
            >
              <View style={styles.gradeRotulo}>
                <Text style={styles.verboInfinitivo}>{verbo.infinitivo_hr}</Text>
                <Text style={styles.verboTraducao}>{verbo.traducao_pt}</Text>
              </View>
              <View style={styles.gradeCelula}>
                {formas?.length ? (
                  formas.map((forma) => (
                    <Forma key={forma} forma={forma} url={urlDe(forma)} />
                  ))
                ) : (
                  <Text style={styles.semForma}>—</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Uma forma, com o próprio player.
 *
 * Player por forma, e não um compartilhado trocando de faixa: `replace()`
 * destrói o elemento de áudio e chama `pause()` nele, e se o `play()`
 * anterior ainda não tinha resolvido o navegador rejeita a promessa com
 * `AbortError` e nada toca. Estas formas têm meio segundo, que é onde essa
 * corrida se perde sempre. Mesmo desenho do `EscolherForma`.
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
      <Text style={styles.formaTexto}>{forma}</Text>
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
  uso: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.texto,
  },

  tempo: { gap: espaco.xs },
  tempoCabecalho: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: espaco.sm,
  },
  tempoHr: {
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.forte,
    color: cores.primaria,
  },
  tempoPt: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.contorno,
  },
  tempoDica: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    marginBottom: espaco.xs,
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
    backgroundColor: cores.superficie,
  },
  gradeLinhaSeguinte: {
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  // Colunas por proporção, não por px: em 390px a grade é apertada e em
  // tablet ela abre junto com o cartão.
  gradeRotulo: { flex: 1, gap: 2 },
  verboInfinitivo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },
  verboTraducao: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.contorno,
  },
  gradeCelula: { flex: 1.4, gap: espaco.xs },
  formaCelula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
  },
  formaPressionada: { opacity: 0.6 },
  formaTexto: {
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.medio,
    color: cores.texto,
    flexShrink: 1,
  },
  semForma: {
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.normal,
    color: cores.contorno,
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
