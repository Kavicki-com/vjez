import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { CampoBusca } from '@/components/CampoBusca';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { Sahovnica } from '@/components/Sahovnica';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
  tracking,
} from '@/theme/tokens';
import type { LexItem } from '@/types/schema';

import { usePalavras } from './hooks';

/** Rótulo em PT-BR do gênero gramatical croata. */
const GENERO_PT: Record<NonNullable<LexItem['genero']>, string> = {
  m: 'masculino',
  f: 'feminino',
  n: 'neutro',
};

/**
 * Cor da barra lateral, escolhida pela categoria.
 * Derivada do nome para a mesma categoria manter sempre a mesma cor,
 * inclusive nas categorias que a curadoria criar depois.
 */
const PALETA = [cores.secundaria, cores.terciaria, cores.primaria];
function corDaCategoria(categoria: string): string {
  const soma = [...categoria].reduce((n, c) => n + c.charCodeAt(0), 0);
  return PALETA[soma % PALETA.length];
}

const TODAS = '__todas__';

export function ListaPalavras() {
  const [termo, setTermo] = useState('');
  const [categoria, setCategoria] = useState<string>(TODAS);
  const { data, isPending, isError } = usePalavras(termo);

  const categorias = useMemo(() => {
    const vistas = new Set((data ?? []).map((i) => i.categoria));
    return [...vistas].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [data]);

  const itens = useMemo(() => {
    const lista = data ?? [];
    return categoria === TODAS
      ? lista
      : lista.filter((i) => i.categoria === categoria);
  }, [data, categoria]);

  const [destaque, ...resto] = itens;

  return (
    <View style={styles.container}>
      <View style={styles.busca}>
        <CampoBusca
          valor={termo}
          aoMudar={setTermo}
          placeholder="Buscar em português ou croata"
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.trilhoChips}
        contentContainerStyle={styles.chips}
        data={[TODAS, ...categorias]}
        keyExtractor={(c) => c}
        renderItem={({ item }) => {
          const ativo = item === categoria;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: ativo }}
              onPress={() => setCategoria(item)}
              style={[styles.chip, ativo && styles.chipAtivo]}
            >
              <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                {item === TODAS ? 'Tudo' : item}
              </Text>
            </Pressable>
          );
        }}
      />

      {isPending ? (
        <Carregando />
      ) : isError ? (
        <Erro />
      ) : itens.length === 0 ? (
        <Vazio
          texto={
            termo.trim()
              ? `Nenhuma palavra encontrada para "${termo.trim()}".`
              : 'Nenhuma palavra nesta categoria ainda.'
          }
        />
      ) : (
        <FlatList
          data={resto}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            destaque ? <CartaoDestaque item={destaque} /> : null
          }
          renderItem={({ item }) => <LinhaPalavra item={item} />}
        />
      )}
    </View>
  );
}

/** Primeiro resultado em cartão grande, com a faixa da bandeira. */
function CartaoDestaque({ item }: { item: LexItem }) {
  return (
    <View style={styles.destaque}>
      <Sahovnica altura={6} noTopo />
      <View style={styles.destaqueCorpo}>
        <View style={styles.destaqueTexto}>
          <View style={styles.destaqueTopo}>
            <Text style={styles.destaqueHr}>{item.hr}</Text>
            <View style={styles.etiqueta}>
              <Text style={styles.etiquetaTexto}>{item.categoria}</Text>
            </View>
          </View>
          <Text style={styles.destaquePt}>{item.pt}</Text>
          {item.genero && (
            <Text style={styles.genero}>{GENERO_PT[item.genero]}</Text>
          )}
          {item.nota_pt && <Text style={styles.nota}>{item.nota_pt}</Text>}
        </View>

        {/* O botão de áudio só existe quando há MP3 — ele aparece sozinho
            quando a curadoria subir o arquivo (item 12 do escopo). */}
        {item.audioUrl && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ouvir ${item.hr}`}
            style={styles.botaoAudio}
          >
            <Ionicons name="volume-high" size={22} color={cores.secundaria} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function LinhaPalavra({ item }: { item: LexItem }) {
  return (
    <View style={styles.linha}>
      <View
        style={[
          styles.barraLateral,
          { backgroundColor: corDaCategoria(item.categoria) },
        ]}
      />
      <View style={styles.linhaTexto}>
        <View style={styles.linhaTopo}>
          <Text style={styles.hr}>{item.hr}</Text>
          {item.genero && (
            <Text style={styles.genero}>{GENERO_PT[item.genero]}</Text>
          )}
        </View>
        <Text style={styles.pt}>{item.pt}</Text>
        {item.nota_pt && <Text style={styles.nota}>{item.nota_pt}</Text>}
      </View>
      {item.audioUrl && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ouvir ${item.hr}`}
          style={styles.botaoAudioPequeno}
        >
          <Ionicons name="play-circle" size={26} color={cores.contorno} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  busca: { paddingTop: espaco.md },

  trilhoChips: { flexGrow: 0, flexShrink: 0 },
  chips: { gap: espaco.sm, paddingVertical: espaco.md },
  chip: {
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.md,
    borderRadius: raio.pill,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlta,
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto: {
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.forte,
    color: cores.textoSuave,
  },
  chipTextoAtivo: { color: cores.superficie },

  lista: { paddingBottom: espaco.lg, gap: espaco.sm },

  destaque: {
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    overflow: 'hidden',
    marginBottom: espaco.sm,
  },
  destaqueCorpo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
  },
  destaqueTexto: { flex: 1, gap: espaco.xs },
  destaqueTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    flexWrap: 'wrap',
  },
  destaqueHr: {
    fontSize: fonte.titulo,
    lineHeight: linha.titulo,
    letterSpacing: tracking.titulo,
    fontFamily: familia.forte,
    color: cores.primaria,
  },
  destaquePt: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    fontStyle: 'italic',
  },
  etiqueta: {
    paddingHorizontal: espaco.sm,
    paddingVertical: 2,
    borderRadius: raio.sm,
    backgroundColor: cores.secundariaSuave,
  },
  etiquetaTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.sobreSecundariaContainer,
  },
  botaoAudio: {
    width: 48,
    height: 48,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficieVariante,
  },
  botaoAudioPequeno: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  barraLateral: { width: 4, alignSelf: 'stretch', borderRadius: raio.pill },
  linhaTexto: { flex: 1, gap: 2 },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: espaco.sm,
    flexWrap: 'wrap',
  },
  hr: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  pt: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
  genero: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.contorno,
  },
  nota: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    marginTop: espaco.xs,
  },
});
