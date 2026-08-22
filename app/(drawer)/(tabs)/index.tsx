import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Carregando, Erro } from '@/components/Estados';
import { avaliarOfensiva } from '@/features/ofensiva/regras';
import { usePerfil } from '@/features/perfil/hooks';
import { ConviteDeInstalacao } from '@/features/pwa/ConviteDeInstalacao';
import { CabecalhoTrilha } from '@/features/trilha/CabecalhoTrilha';
import { NoDoModulo } from '@/features/trilha/NoDoModulo';
import { useTrilhaMontada } from '@/features/trilha/useTrilhaMontada';
import { cores, espaco, larguraMaximaConteudo } from '@/theme/tokens';

/** Serpenteado do caminho: desloca cada nó por uma onda suave. */
function desvioDoNo(indice: number): number {
  return Math.round(Math.sin(indice * 0.9) * 46);
}

export default function Inicio() {
  const [conviteNoRodape, setConviteNoRodape] = useState(false);
  const { trilha, isPending, isError } = useTrilhaMontada();
  const { data: perfil } = usePerfil();
  // Avaliado na leitura: zerar por inatividade acontece com o tempo, então
  // o valor gravado envelhece sozinho.
  const ofensiva = avaliarOfensiva(perfil?.ofensiva);

  if (isPending) return <Carregando />;
  if (isError) return <Erro />;

  return (
    <View style={styles.tela}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coluna}>
          <CabecalhoTrilha
            nome={perfil?.nome?.split(' ')[0]}
            diasDeOfensiva={ofensiva.dias}
            statusDaOfensiva={ofensiva.status}
          />

          <View
            style={[styles.caminho, conviteNoRodape && styles.caminhoComConvite]}
          >
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

      {/* Flutua sobre a trilha, e só no navegador com o app ainda não
          instalado. Fica AQUI, e não na casca do app, porque a tela inicial
          é onde o aluno chega — e onde o convite não interrompe nada. */}
      <ConviteDeInstalacao aoMudarVisibilidade={setConviteNoRodape} />
    </View>
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
  // Folga extra só enquanto o convite de instalação está no rodapé.
  caminhoComConvite: { paddingBottom: espaco.xxl + espaco.xxl },
});
