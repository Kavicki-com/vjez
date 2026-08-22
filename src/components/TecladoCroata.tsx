import { useRef, useState } from 'react';
import type { NativeSyntheticEvent, TextInputSelectionChangeEventData } from 'react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { cores, espaco, familia, fonte, raio, sombra } from '@/theme/tokens';

/**
 * As letras do croata que o teclado brasileiro não escreve.
 *
 * O caron (ˇ) não existe no ABNT — nem como tecla morta —, então `č`, `š` e
 * `ž` não têm caminho no desktop, e `đ` não tem em lugar nenhum. No celular
 * dá para chegar nelas segurando a tecla, mas isso é conhecimento escondido:
 * quem está aprendendo não sabe que existe letra ali embaixo.
 *
 * Em ordem alfabética croata, de propósito: é a ordem que faz o dicionário
 * funcionar, e vê-la sempre na mesma sequência ensina de graça.
 */
const SIMPLES = ['č', 'ć', 'đ', 'š', 'ž'];

/**
 * Os três dígrafos.
 *
 * Estas o teclado escreve — entram por outro motivo: em croata cada uma é
 * UMA letra, com som próprio e lugar próprio no alfabeto (`ljubav` vem
 * depois de `luk`, não antes). Estarem numa fileira separada é o recado:
 * são letras, mas de outra natureza.
 *
 * `dž` também resolve um par que confunde todo iniciante — `đak` (aluno) e
 * `džep` (bolso) não começam com o mesmo som.
 */
const DIGRAFOS = ['dž', 'lj', 'nj'];

type PropsTeclado = { aoInserir: (letra: string) => void };

/**
 * Barra de letras croatas, em duas fileiras.
 *
 * Duas e não uma porque não cabe: oito teclas com alvo de toque decente
 * passam de 390px, e dígrafo ocupa duas letras no botão. A divisão em
 * simples / dígrafos é a que o conteúdo pedia de qualquer jeito.
 *
 * Sem shift: maiúscula de dígrafo tem TRÊS formas (`lj`, `Lj`, `LJ`, e a do
 * meio é a de nome próprio), e o aluno quase só escreve maiúscula no começo
 * de frase da produção livre, onde raramente cai uma destas. O teclado do
 * sistema continua dando conta desse caso.
 */
export function TecladoCroata({ aoInserir }: PropsTeclado) {
  return (
    <View style={styles.barra}>
      <View style={styles.fileira}>
        {SIMPLES.map((letra) => (
          <Tecla key={letra} letra={letra} aoInserir={aoInserir} />
        ))}
      </View>
      {/* A fileira de baixo é mais estreita para a tecla ficar do mesmo
          tamanho da de cima: três teclas em 60% da largura, não esticadas. */}
      <View style={[styles.fileira, styles.fileiraCurta]}>
        {DIGRAFOS.map((letra) => (
          <Tecla key={letra} letra={letra} aoInserir={aoInserir} />
        ))}
      </View>
    </View>
  );
}

function Tecla({ letra, aoInserir }: { letra: string } & PropsTeclado) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Inserir ${letra}`}
      onPress={() => aoInserir(letra)}
      style={({ pressed }) => [
        styles.tecla,
        sombra.elevada,
        pressed && [styles.teclaPressionada, sombra.pressionada],
      ]}
    >
      <Text style={styles.letra}>{letra}</Text>
    </Pressable>
  );
}

type Cursor = { start: number; end: number };

/**
 * Liga a barra a um campo de texto, inserindo na posição do cursor.
 *
 * Devolve as props para espalhar no `TextInput` e a barra já ligada — os
 * dois campos que digitam croata (resposta curta e produção livre) têm
 * layout diferente, então compartilham o comportamento e não a caixa.
 *
 * Inserir no cursor, e não no fim, é o que permite consertar a letra no meio
 * da palavra: quem escreveu `kuca` e quer `kuća` só clica entre o `u` e o
 * `a`. Na web o cursor chega por `onSelectionChange` porque o React dispara
 * `onSelect` também em movimento de cursor, não só em seleção de texto.
 */
export function useTecladoCroata({
  valor,
  aoMudar,
  ativo,
}: {
  valor: string;
  aoMudar: (valor: string) => void;
  /** Depois de verificar a resposta o campo trava, e a barra some junto. */
  ativo: boolean;
}) {
  const campo = useRef<TextInput>(null);
  const cursor = useRef<Cursor>({ start: valor.length, end: valor.length });

  /**
   * Só existe no instante seguinte a uma inserção.
   *
   * Manter `selection` controlado o tempo todo faz o cursor pular para o fim
   * quando se digita rápido — o estado chega atrasado e sobrescreve onde o
   * dedo estava. Então ele é ditado por uma tecla nossa e devolvido ao
   * navegador na mudança seguinte.
   */
  const [selecao, setSelecao] = useState<Cursor | undefined>();

  const aoMudarSelecao = (
    evento: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    cursor.current = evento.nativeEvent.selection;
    if (selecao) setSelecao(undefined);
  };

  const inserir = (letra: string) => {
    // O cursor pode estar velho se o valor encolheu por fora (troca de
    // exercício, por exemplo); cortar no tamanho atual evita inserir no vazio.
    const inicio = Math.min(cursor.current.start, valor.length);
    const fim = Math.min(Math.max(cursor.current.end, inicio), valor.length);

    aoMudar(valor.slice(0, inicio) + letra + valor.slice(fim));

    const depois = inicio + letra.length;
    cursor.current = { start: depois, end: depois };
    setSelecao({ start: depois, end: depois });
    // Sem isto o teclado do sistema fecha a cada letra da barra no celular,
    // e na web o campo perde o foco para o botão.
    campo.current?.focus();
  };

  return {
    propsDoCampo: {
      ref: campo,
      selection: selecao,
      onSelectionChange: aoMudarSelecao,
    },
    teclado: ativo ? <TecladoCroata aoInserir={inserir} /> : null,
  };
}

const styles = StyleSheet.create({
  barra: { gap: espaco.sm },
  fileira: { flexDirection: 'row', gap: espaco.sm },
  fileiraCurta: { width: '62%' },
  tecla: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raio.md,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  teclaPressionada: {
    backgroundColor: cores.secundariaSuave,
    transform: [{ translateY: 1 }],
  },
  letra: {
    fontSize: fonte.subtitulo,
    fontFamily: familia.medio,
    color: cores.texto,
  },
});
