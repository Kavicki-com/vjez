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

import type { ExercicioDoCms } from './api';
import { Campo } from './Campo';
import { useEscritaDeExercicio } from './hooks';
import { comoDados, comoJson, TIPOS } from './tiposDeExercicio';

const CASOS: Padez[] = [
  'nominativ',
  'genitiv',
  'dativ',
  'akuzativ',
  'vokativ',
  'lokativ',
  'instrumental',
];

/**
 * O editor de um exercício, qualquer que seja o tipo.
 *
 * O que é igual em todos mora aqui — enunciado, dica, peso, caso,
 * publicação, salvar e apagar. O que muda vem de `TIPOS[tipo].Corpo`, que
 * mexe só no `dados`. Foi assim que os seis tipos couberam sem seis
 * editores: o formulário do croata é sempre o mesmo formulário com um
 * miolo diferente.
 *
 * O estado é LOCAL até salvar. Salvar a cada tecla mandaria um exercício
 * meio escrito para a trilha — e a trilha é lida por aluno.
 */
export function EditorDeExercicio({
  exercicio,
  licaoId,
  aoFechar,
}: {
  exercicio: ExercicioDoCms;
  licaoId: string;
  aoFechar: () => void;
}) {
  const tipo = TIPOS[exercicio.tipo];

  const [enunciado, setEnunciado] = useState(exercicio.enunciado_pt);
  const [dica, setDica] = useState(exercicio.dica_pt ?? '');
  const [peso, setPeso] = useState(String(exercicio.peso));
  const [padez, setPadez] = useState<Padez | null>(exercicio.padez);
  const [dados, setDados] = useState(() => comoDados(exercicio.dados));
  const [publicado, setPublicado] = useState(exercicio.publicado);
  const [erro, setErro] = useState<string | null>(null);

  const { salvar, apagar } = useEscritaDeExercicio(licaoId);

  /**
   * A validação vive aqui E no banco (CHECK exercicios_dados_por_tipo).
   * A do banco é a que garante; esta é a que explica — erro de constraint
   * chega como texto de Postgres, que não ajuda quem está cadastrando.
   *
   * Só morde ao PUBLICAR. Rascunho existe justamente para poder ficar pela
   * metade: cadastrar um exercício bom é ir e voltar, e um editor que só
   * deixa salvar o trabalho pronto obriga a manter o meio do caminho na
   * cabeça.
   */
  const problema = (): string | null => {
    if (!enunciado.trim()) return 'O enunciado em português é obrigatório.';
    const n = Number(peso.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) return 'O peso tem que ser maior que zero.';
    if (n > 10) return 'O peso não passa de 10 — é a nota inteira da lição.';
    return tipo.validar(dados);
  };

  const gravar = () => {
    const ruim = publicado ? problema() : null;
    setErro(ruim);
    if (ruim) return;

    const pesoLimpo = Number(peso.replace(',', '.'));

    salvar.mutate(
      {
        id: exercicio.id,
        campos: {
          enunciado_pt: enunciado.trim() || 'Sem enunciado',
          dica_pt: dica.trim() || null,
          // Rascunho pode estar com o peso em branco; o banco recusa zero,
          // então o mínimo entra até alguém decidir.
          peso: Number.isFinite(pesoLimpo) && pesoLimpo > 0 ? pesoLimpo : 0.01,
          padez,
          publicado,
          dados: comoJson(dados),
        },
      },
      {
        onSuccess: aoFechar,
        onError: (e) =>
          setErro(e instanceof Error ? e.message : 'Não deu para salvar.'),
      },
    );
  };

  return (
    <View style={styles.editor}>
      <Text style={styles.resumo}>{tipo.resumo}</Text>

      <Campo
        rotulo="Enunciado (PT)"
        valor={enunciado}
        aoMudar={setEnunciado}
        placeholder="A instrução que o aluno lê"
        multilinha
        dica="Sempre em português — é instrução, não conteúdo."
      />

      <tipo.Corpo dados={dados} aoMudar={setDados} />

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
        dica="Fração da nota /10. A soma dos pesos publicados da lição deve fechar em 10."
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
        <Text style={styles.dica}>
          Marcado, o feedback diz “Este exercício pede o caso X”.
        </Text>
      </View>

      <View style={[styles.publicacao, publicado && styles.publicacaoNoAr]}>
        <Ionicons
          name={publicado ? 'eye' : 'eye-off'}
          size={22}
          color={publicado ? cores.acerto : cores.textoSuave}
        />
        <View style={styles.interruptorTexto}>
          <Text style={styles.interruptorTitulo}>
            {publicado ? 'No ar para o aluno' : 'Rascunho'}
          </Text>
          <Text style={styles.dica}>
            {publicado
              ? 'Some da lição se você desligar — o progresso de quem já respondeu não é afetado.'
              : 'Só a curadoria enxerga. Dá para salvar pela metade e voltar depois; ao publicar, os campos passam a ser cobrados.'}
          </Text>
        </View>
        <Switch
          value={publicado}
          onValueChange={setPublicado}
          trackColor={{ true: cores.acerto, false: cores.borda }}
          accessibilityLabel="Publicado para o aluno"
        />
      </View>

      {erro && <Text style={styles.erro}>{erro}</Text>}

      <View style={styles.acoes}>
        <Botao rotulo="Salvar" aoTocar={gravar} carregando={salvar.isPending} />
        <Botao rotulo="Cancelar" variante="secundaria" aoTocar={aoFechar} />
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            apagar.mutate(exercicio.id, {
              onSuccess: aoFechar,
              onError: (e) =>
                setErro(e instanceof Error ? e.message : 'Não deu para apagar.'),
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
  resumo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.sobreSecundariaContainer,
    backgroundColor: cores.secundariaSuave,
    padding: espaco.sm,
    borderRadius: raio.md,
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
  interruptorTexto: { flex: 1, gap: 2 },
  interruptorTitulo: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.texto,
  },
  publicacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.sm + espaco.xs,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  publicacaoNoAr: {
    borderColor: cores.acerto,
    backgroundColor: cores.acertoSuave,
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
