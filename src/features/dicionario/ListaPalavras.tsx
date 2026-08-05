import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { CampoBusca } from '@/components/CampoBusca';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import {
  cores,
  espaco,
  familia,
  fonte,
  raio,
} from '@/theme/tokens';
import type { LexItem } from '@/types/schema';

import { agruparPorCategoria } from './api';
import { usePalavras } from './hooks';

/** Rótulo em PT-BR do gênero gramatical croata. */
const GENERO_PT: Record<NonNullable<LexItem['genero']>, string> = {
  m: 'masculino',
  f: 'feminino',
  n: 'neutro',
};

export function ListaPalavras() {
  const [termo, setTermo] = useState('');
  const { data, isPending, isError } = usePalavras(termo);

  const secoes = useMemo(
    () =>
      agruparPorCategoria(data ?? []).map((g) => ({
        title: g.categoria,
        data: g.itens,
      })),
    [data],
  );

  return (
    <View style={styles.container}>
      <View style={styles.busca}>
        <CampoBusca
          valor={termo}
          aoMudar={setTermo}
          placeholder="Buscar em português ou croata"
        />
      </View>

      {isPending ? (
        <Carregando />
      ) : isError ? (
        <Erro />
      ) : secoes.length === 0 ? (
        <Vazio texto={`Nenhuma palavra encontrada para "${termo.trim()}".`} />
      ) : (
        <SectionList
          sections={secoes}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <Text style={styles.categoria}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <View style={styles.linha}>
              <View style={styles.cabecalhoLinha}>
                <Text style={styles.hr}>{item.hr}</Text>
                {item.genero && (
                  <Text style={styles.genero}>{GENERO_PT[item.genero]}</Text>
                )}
              </View>
              <Text style={styles.pt}>{item.pt}</Text>
              {item.nota_pt && <Text style={styles.nota}>{item.nota_pt}</Text>}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  busca: { paddingTop: espaco.md },
  lista: { paddingVertical: espaco.md, gap: espaco.sm },
  categoria: {
    fontSize: fonte.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: espaco.md,
    marginBottom: espaco.xs,
  },
  linha: {
    padding: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: 2,
  },
  cabecalhoLinha: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: espaco.sm,
    flexWrap: 'wrap',
  },
  hr: {
    fontSize: fonte.subtitulo,
    fontFamily: familia.forte,
    color: cores.primaria,
  },
  genero: { fontSize: fonte.pequena, fontFamily: familia.normal, color: cores.textoSuave },
  pt: { fontSize: fonte.corpo, fontFamily: familia.normal, color: cores.texto },
  nota: {
    fontSize: fonte.pequena, fontFamily: familia.normal,
    color: cores.textoSuave,
    marginTop: espaco.xs,
  },
});
