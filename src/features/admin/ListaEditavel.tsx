import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
} from '@/theme/tokens';

import { Campo } from './Campo';

/**
 * Lista de textos que cresce e encolhe.
 *
 * Serve às opções do `escolher_forma`, às peças do `montar_frase` e às
 * respostas aceitas da `traducao` — três coisas que na tela do aluno não se
 * parecem em nada, mas que para quem cadastra são o mesmo gesto: escrever
 * várias linhas curtas, às vezes marcando uma delas.
 */
export function ListaEditavel({
  rotulo,
  nomeDoItem,
  itens,
  aoMudar,
  croata,
  minimo = 2,
  textoAdicionar,
  marcada,
  aoMarcar,
  dica,
}: {
  rotulo: string;
  /** Como cada linha se chama: "Opção 1", "Peça 2"… */
  nomeDoItem: string;
  itens: string[];
  aoMudar: (itens: string[]) => void;
  croata?: boolean;
  minimo?: number;
  textoAdicionar: string;
  /** Presente só onde uma das linhas é a certa (escolher_forma). */
  marcada?: string;
  aoMarcar?: (valor: string) => void;
  dica?: string;
}) {
  const trocar = (i: number, valor: string) => {
    // Renomear a linha marcada não pode desmarcá-la: a marca acompanha.
    if (aoMarcar && itens[i].trim() && itens[i].trim() === marcada?.trim()) {
      aoMarcar(valor);
    }
    aoMudar(itens.map((o, j) => (j === i ? valor : o)));
  };

  const remover = (i: number) => {
    if (aoMarcar && itens[i].trim() === marcada?.trim()) aoMarcar('');
    aoMudar(itens.filter((_, j) => j !== i));
  };

  return (
    <View style={styles.bloco}>
      <Text style={styles.rotulo}>{rotulo}</Text>

      {itens.map((item, i) => {
        const certa = Boolean(item.trim()) && item.trim() === marcada?.trim();
        return (
          <View key={i} style={styles.linha}>
            {aoMarcar && (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: certa }}
                accessibilityLabel={`Marcar "${item || 'linha vazia'}" como certa`}
                onPress={() => item.trim() && aoMarcar(item)}
                style={styles.lateral}
              >
                <Ionicons
                  name={certa ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={certa ? cores.acerto : cores.contorno}
                />
              </Pressable>
            )}

            <View style={styles.campo}>
              <Campo
                rotulo={`${nomeDoItem} ${i + 1}`}
                valor={item}
                aoMudar={(v) => trocar(i, v)}
                croata={croata}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remover ${nomeDoItem.toLowerCase()} ${i + 1}`}
              disabled={itens.length <= minimo}
              onPress={() => remover(i)}
              style={[styles.lateral, itens.length <= minimo && styles.inerte]}
            >
              <Ionicons name="trash-outline" size={20} color={cores.erro} />
            </Pressable>
          </View>
        );
      })}

      <Pressable
        accessibilityRole="button"
        onPress={() => aoMudar([...itens, ''])}
        style={styles.adicionar}
      >
        <Ionicons name="add" size={18} color={cores.primaria} />
        <Text style={styles.adicionarTexto}>{textoAdicionar}</Text>
      </Pressable>

      {dica && <Text style={styles.dica}>{dica}</Text>}
    </View>
  );
}

/**
 * Os pares do `ligar_pares`, lado a lado.
 *
 * O teclado croata está nos DOIS lados de propósito: o lado direito é
 * português na maioria dos exercícios, mas nos de transformação ele é
 * croata flexionado (`brat` → `brata`). O editor não tem como saber qual
 * dos dois é, então oferece as letras sempre.
 */
export function ListaDePares({
  pares,
  aoMudar,
}: {
  pares: { hr: string; pt: string }[];
  aoMudar: (pares: { hr: string; pt: string }[]) => void;
}) {
  const trocar = (i: number, lado: 'hr' | 'pt', valor: string) =>
    aoMudar(pares.map((p, j) => (j === i ? { ...p, [lado]: valor } : p)));

  return (
    <View style={styles.bloco}>
      <Text style={styles.rotulo}>Pares</Text>

      {pares.map((par, i) => (
        <View key={i} style={styles.par}>
          <View style={styles.parCampos}>
            <View style={styles.campo}>
              <Campo
                rotulo={`Croata ${i + 1}`}
                valor={par.hr}
                aoMudar={(v) => trocar(i, 'hr', v)}
                croata
              />
            </View>
            <View style={styles.campo}>
              <Campo
                rotulo={`Par ${i + 1}`}
                valor={par.pt}
                aoMudar={(v) => trocar(i, 'pt', v)}
                croata
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remover par ${i + 1}`}
            disabled={pares.length <= 2}
            onPress={() => aoMudar(pares.filter((_, j) => j !== i))}
            style={[styles.lateral, pares.length <= 2 && styles.inerte]}
          >
            <Ionicons name="trash-outline" size={20} color={cores.erro} />
          </Pressable>
        </View>
      ))}

      <Pressable
        accessibilityRole="button"
        onPress={() => aoMudar([...pares, { hr: '', pt: '' }])}
        style={styles.adicionar}
      >
        <Ionicons name="add" size={18} color={cores.primaria} />
        <Text style={styles.adicionarTexto}>Mais um par</Text>
      </Pressable>

      <Text style={styles.dica}>
        O lado esquerdo é sempre o croata — é ele que ganha cor e que fala.
        O direito costuma ser o português, mas nos exercícios de transformação
        é a forma flexionada.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { gap: espaco.sm },
  rotulo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  linha: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.sm },
  par: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.sm },
  parCampos: { flex: 1, gap: espaco.sm },
  campo: { flex: 1 },
  // Alinha o ícone com o campo, não com o rótulo acima dele.
  lateral: { paddingTop: espaco.lg },
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
});
