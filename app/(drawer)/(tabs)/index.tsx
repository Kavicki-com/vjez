import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Carregando, Erro } from '@/components/Estados';
import { usePerfil } from '@/features/perfil/hooks';
import { CabecalhoTrilha } from '@/features/trilha/CabecalhoTrilha';
import { NoDoModulo } from '@/features/trilha/NoDoModulo';
import { useTrilhaMontada } from '@/features/trilha/useTrilhaMontada';
import { cores, espaco, larguraMaximaConteudo } from '@/theme/tokens';

/** Serpenteado do caminho: desloca cada nó por uma onda suave. */
function desvioDoNo(indice: number): number {
  return Math.round(Math.sin(indice * 0.9) * 46);
}

export default function Inicio() {
  const { trilha, isPending, isError } = useTrilhaMontada();
  const { data: perfil } = usePerfil();

  if (isPending) return <Carregando />;
  if (isError) return <Erro />;

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.coluna}>
        <CabecalhoTrilha
          nome={perfil?.nome?.split(' ')[0]}
          diasDeOfensiva={perfil?.ofensiva.diasSeguidos ?? 0}
        />

        <View style={styles.caminho}>
          {trilha.map((modulo, i) => (
            <NoDoModulo
              key={modulo.id}
              modulo={modulo}
              desvio={desvioDoNo(i)}
              // O nó abre a unidade, não a lição: é lá que se vê progresso,
              // nota e a opção de refazer.
              aoTocar={() => router.push(`/modulo/${modulo.id}`)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, alignItems: 'center' },
  coluna: {
    width: '100%',
    maxWidth: larguraMaximaConteudo,
    gap: espaco.xl,
  },
  caminho: { alignItems: 'center', gap: espaco.xl, paddingBottom: espaco.xxl },
});
