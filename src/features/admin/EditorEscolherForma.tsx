import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
} from '@/theme/tokens';
import type { Padez } from '@/types/schema';

import { dadosDeEscolherForma, type ExercicioDoCms } from './api';
import { Campo } from './Campo';
import { useEscritaDeExercicio } from './hooks';

const CASOS: Padez[] = [
  'nominativ',
  'genitiv',
  'dativ',
  'akuzativ',
  'vokativ',
  'lokativ',
  'instrumental',
];

type Dados = {
  opcoes?: unknown;
  resposta?: unknown;
  falar_opcoes?: unknown;
};

/**
 * Editor do `escolher_forma` — o primeiro tipo ponta a ponta do CMS.
 *
 * Escolhido para abrir a série porque é o exercício com o `dados` mais
 * simples que ainda tem forma real (uma lista e uma escolha dentro dela):
 * exercita a validação, a edição de array e o vínculo entre dois campos,
 * que é o que os outros cinco tipos vão reaproveitar.
 *
 * O estado é LOCAL até salvar. Salvamento a cada tecla mandaria um exercício
 * meio escrito para a trilha — e a trilha é lida por aluno.
 */
export function EditorEscolherForma({
  exercicio,
  licaoId,
  aoFechar,
}: {
  exercicio: ExercicioDoCms;
  licaoId: string;
  aoFechar: () => void;
}) {
  const dados = (exercicio.dados ?? {}) as Dados;

  const [enunciado, setEnunciado] = useState(exercicio.enunciado_pt);
  const [dica, setDica] = useState(exercicio.dica_pt ?? '');
  const [peso, setPeso] = useState(String(exercicio.peso));
  const [padez, setPadez] = useState<Padez | null>(exercicio.padez);
  const [opcoes, setOpcoes] = useState<string[]>(
    Array.isArray(dados.opcoes) ? dados.opcoes.map(String) : ['', ''],
  );
  const [resposta, setResposta] = useState(
    typeof dados.resposta === 'string' ? dados.resposta : '',
  );
  const [falar, setFalar] = useState(Boolean(dados.falar_opcoes));
  const [erro, setErro] = useState<string | null>(null);

  const { salvar, apagar } = useEscritaDeExercicio(licaoId);

  const limpas = opcoes.map((o) => o.trim()).filter(Boolean);

  /**
   * A validação vive aqui E no banco (CHECK exercicios_dados_por_tipo).
   * A do banco é a que garante; esta é a que explica — erro de constraint
   * chega como texto de Postgres, que não ajuda quem está cadastrando.
   */
  const problema = (): string | null => {
    if (!enunciado.trim()) return 'O enunciado em português é obrigatório.';
    if (limpas.length < 2) return 'Precisa de pelo menos duas opções.';
    if (new Set(limpas).size !== limpas.length)
      return 'Há opções repetidas — o aluno veria a mesma resposta duas vezes.';
    if (!resposta.trim()) return 'Marque qual opção é a certa.';
    if (!limpas.includes(resposta.trim()))
      return 'A opção marcada como certa não está mais na lista.';
    const n = Number(peso.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) return 'O peso tem que ser maior que zero.';
    return null;
  };

  const gravar = () => {
    const ruim = problema();
    setErro(ruim);
    if (ruim) return;

    salvar.mutate(
      {
        id: exercicio.id,
        campos: {
          enunciado_pt: enunciado.trim(),
          dica_pt: dica.trim() || null,
          peso: Number(peso.replace(',', '.')),
          padez,
          dados: dadosDeEscolherForma(limpas, resposta.trim(), falar),
        },
      },
      {
        onSuccess: aoFechar,
        onError: (e) =>
          setErro(e instanceof Error ? e.message : 'Não deu para salvar.'),
      },
    );
  };

  const trocarOpcao = (i: number, valor: string) => {
    setOpcoes((atual) => atual.map((o, j) => (j === i ? valor : o)));
    // Renomear a opção certa não pode desmarcá-la: a resposta acompanha.
    if (opcoes[i].trim() && opcoes[i].trim() === resposta.trim()) {
      setResposta(valor);
    }
  };

  const removerOpcao = (i: number) => {
    const fora = opcoes[i];
    setOpcoes((atual) => atual.filter((_, j) => j !== i));
    if (fora.trim() === resposta.trim()) setResposta('');
  };

  return (
    <View style={styles.editor}>
      <Campo
        rotulo="Enunciado (PT)"
        valor={enunciado}
        aoMudar={setEnunciado}
        placeholder="Qual é a forma certa?"
        multilinha
      />

      <View style={styles.bloco}>
        <Text style={styles.rotulo}>Opções (HR)</Text>
        {opcoes.map((opcao, i) => {
          const certa = Boolean(opcao.trim()) && opcao.trim() === resposta.trim();
          return (
            <View key={i} style={styles.linhaOpcao}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: certa }}
                accessibilityLabel={`Marcar "${opcao || 'opção vazia'}" como certa`}
                onPress={() => opcao.trim() && setResposta(opcao)}
                style={[styles.marcar, certa && styles.marcarCerta]}
              >
                <Ionicons
                  name={certa ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={certa ? cores.acerto : cores.contorno}
                />
              </Pressable>

              <View style={styles.campoDaOpcao}>
                <Campo
                  rotulo={`Opção ${i + 1}`}
                  valor={opcao}
                  aoMudar={(v) => trocarOpcao(i, v)}
                  croata
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover opção ${i + 1}`}
                disabled={opcoes.length <= 2}
                onPress={() => removerOpcao(i)}
                style={[styles.remover, opcoes.length <= 2 && styles.inerte]}
              >
                <Ionicons name="trash-outline" size={20} color={cores.erro} />
              </Pressable>
            </View>
          );
        })}

        <Pressable
          accessibilityRole="button"
          onPress={() => setOpcoes((a) => [...a, ''])}
          style={styles.adicionar}
        >
          <Ionicons name="add" size={18} color={cores.primaria} />
          <Text style={styles.adicionarTexto}>Mais uma opção</Text>
        </Pressable>
        <Text style={styles.dica}>
          O círculo marca a resposta certa. As opções são embaralhadas? Não —
          aparecem na ordem cadastrada, então evite deixar a certa sempre na
          primeira.
        </Text>
      </View>

      <Campo
        rotulo="Dica (PT)"
        valor={dica}
        aoMudar={setDica}
        placeholder="Aparece no feedback quando o aluno erra"
        multilinha
      />

      <Campo
        rotulo="Peso"
        valor={peso}
        aoMudar={setPeso}
        numerico
        dica="Fração da nota /10. A soma dos pesos da lição deve fechar em 10."
      />

      <View style={styles.bloco}>
        <Text style={styles.rotulo}>Caso (padež)</Text>
        <View style={styles.chips}>
          <Chip
            rotulo="Nenhum"
            ativo={padez === null}
            aoTocar={() => setPadez(null)}
          />
          {CASOS.map((c) => (
            <Chip
              key={c}
              rotulo={c}
              ativo={padez === c}
              aoTocar={() => setPadez(c)}
            />
          ))}
        </View>
      </View>

      <View style={styles.interruptor}>
        <View style={styles.interruptorTexto}>
          <Text style={styles.interruptorTitulo}>Gerar áudio das opções</Text>
          <Text style={styles.dica}>
            Marca estas opções para virarem MP3 na próxima rodada de
            `supabase/audio/gerar.mjs`. Ligue quando as opções forem palavras
            ou formas de verdade; deixe desligado quando forem letras soltas
            ou pedaços sem som próprio.
          </Text>
        </View>
        <Switch
          value={falar}
          onValueChange={setFalar}
          trackColor={{ true: cores.primaria, false: cores.borda }}
          accessibilityLabel="Falar as opções ao tocar"
        />
      </View>

      {erro && <Text style={styles.erro}>{erro}</Text>}

      <View style={styles.acoes}>
        <Botao
          rotulo="Salvar"
          aoTocar={gravar}
          carregando={salvar.isPending}
        />
        <Botao rotulo="Cancelar" variante="secundaria" aoTocar={aoFechar} />
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            apagar.mutate(exercicio.id, {
              onSuccess: aoFechar,
              onError: (e) =>
                setErro(
                  e instanceof Error ? e.message : 'Não deu para apagar.',
                ),
            })
          }
          style={styles.apagar}
        >
          <Ionicons name="trash" size={16} color={cores.erro} />
          <Text style={styles.apagarTexto}>Apagar este exercício</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Chip({
  rotulo,
  ativo,
  aoTocar,
}: {
  rotulo: string;
  ativo: boolean;
  aoTocar: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      onPress={aoTocar}
      style={[styles.chip, ativo && styles.chipAtivo]}
    >
      <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
        {rotulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  editor: {
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.secundaria,
    backgroundColor: cores.fundoSuave,
  },
  bloco: { gap: espaco.sm },
  rotulo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  linhaOpcao: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.sm },
  campoDaOpcao: { flex: 1 },
  marcar: { paddingTop: espaco.lg },
  marcarCerta: {},
  remover: { paddingTop: espaco.lg },
  inerte: { opacity: 0.3 },
  adicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    alignSelf: 'flex-start',
    paddingVertical: espaco.xs,
  },
  adicionarTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.primaria,
  },
  dica: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.xs },
  chip: {
    paddingHorizontal: espaco.sm + espaco.xs,
    paddingVertical: espaco.xs,
    borderRadius: raio.pill,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  chipAtivo: {
    borderColor: cores.secundaria,
    backgroundColor: cores.secundariaSuave,
  },
  chipTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },
  chipTextoAtivo: {
    color: cores.sobreSecundariaContainer,
    fontFamily: familia.forte,
  },
  interruptor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
  },
  interruptorTexto: { flex: 1, gap: 2 },
  interruptorTitulo: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.texto,
  },
  erro: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.erro,
  },
  acoes: { gap: espaco.sm },
  apagar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.xs,
    paddingVertical: espaco.sm,
  },
  apagarTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.erro,
  },
});
