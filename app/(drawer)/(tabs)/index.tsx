import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Carregando, Erro } from '@/components/Estados';
import { useTrilha } from '@/features/licao/hooks';
import { useProgressoLocal } from '@/features/perfil/ProgressoLocal';
import { usePerfil, useProgressoLicoes } from '@/features/perfil/hooks';
import { CabecalhoTrilha } from '@/features/trilha/CabecalhoTrilha';
import { NoDoModulo } from '@/features/trilha/NoDoModulo';
import { montarTrilha } from '@/features/trilha/estado';
import { cores, espaco, larguraMaximaConteudo } from '@/theme/tokens';
import type { ProgressoLicao } from '@/types/schema';

/** Serpenteado do caminho: desloca cada nó por uma onda suave. */
function desvioDoNo(indice: number): number {
  return Math.round(Math.sin(indice * 0.9) * 46);
}

export default function Inicio() {
  const { data: modulos, isPending, isError } = useTrilha();
  const { data: perfil } = usePerfil();
  const { data: progressoServidor } = useProgressoLicoes();
  const { notas } = useProgressoLocal();

  const trilha = useMemo(() => {
    if (!modulos) return [];
    // O progresso da sessão entra junto com o do servidor, então a trilha
    // reage assim que a lição termina — sem esperar refetch.
    const local: ProgressoLicao[] = Object.entries(notas).map(([licaoId, nota]) => ({
      usuarioId: perfil?.id ?? 'convidado',
      licaoId,
      nota,
      concluida: true,
      data: '',
    }));
    return montarTrilha(modulos, [...(progressoServidor ?? []), ...local]);
  }, [modulos, progressoServidor, notas, perfil?.id]);

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
              aoTocar={() => {
                if (modulo.proximaLicaoId) {
                  router.push(`/licao/${modulo.proximaLicaoId}`);
                }
              }}
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
