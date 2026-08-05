import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Carregando } from '@/components/Estados';
import { PortaoDeLogin } from '@/features/conta/PortaoDeLogin';
import { useSessao } from '@/features/conta/hooks';
import { useTrilha } from '@/features/licao/hooks';
import { useProgressoLocal } from '@/features/perfil/ProgressoLocal';
import { usePerfil, useProgressoLicoes } from '@/features/perfil/hooks';
import { montarTrilha } from '@/features/trilha/estado';
import {
  cores,
  espaco,
  fonte,
  larguraMaximaConteudo,
  peso,
  raio,
} from '@/theme/tokens';
import type { Nivel, ProgressoLicao } from '@/types/schema';

const ROTULO_NIVEL: Record<Nivel, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export default function Perfil() {
  const { carregando, autenticado } = useSessao();
  const { data: perfil } = usePerfil();
  const { data: modulos } = useTrilha();
  const { data: progressoServidor } = useProgressoLicoes();
  const { notas } = useProgressoLocal();

  const trilha = useMemo(() => {
    if (!modulos) return [];
    const local: ProgressoLicao[] = Object.entries(notas).map(([licaoId, nota]) => ({
      usuarioId: perfil?.id ?? 'convidado',
      licaoId,
      nota,
      concluida: true,
      data: '',
    }));
    return montarTrilha(modulos, [...(progressoServidor ?? []), ...local]);
  }, [modulos, progressoServidor, notas, perfil?.id]);

  const licoesFeitas = Object.keys(notas).length + (progressoServidor?.length ?? 0);
  const modulosConcluidos = trilha.filter((m) => m.estado === 'concluido').length;

  if (carregando) return <Carregando />;

  if (!autenticado) {
    return (
      <PortaoDeLogin
        titulo="Guarde seu progresso"
        explicacao="Entre para acompanhar XP, ofensiva e conquistas em qualquer aparelho."
      />
    );
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.coluna}>
        <View style={styles.identidade}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetra}>
              {(perfil?.nome ?? 'V').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.identidadeTexto}>
            <Text style={styles.nome}>{perfil?.nome ?? 'Aprendiz'}</Text>
            <Text style={styles.nivel}>
              Nível {ROTULO_NIVEL[perfil?.nivel ?? 'basico']}
            </Text>
          </View>
        </View>

        <View style={styles.grade}>
          <Estatistica
            icone="flame"
            cor={cores.destaque}
            valor={String(perfil?.ofensiva.diasSeguidos ?? 0)}
            rotulo="dias seguidos"
          />
          <Estatistica
            icone="flash"
            cor={cores.secundaria}
            valor={String(perfil?.xp ?? 0)}
            rotulo="XP"
          />
          <Estatistica
            icone="checkmark-done"
            cor={cores.acerto}
            valor={String(licoesFeitas)}
            rotulo="lições feitas"
          />
          <Estatistica
            icone="trophy"
            cor={cores.primaria}
            valor={String(modulosConcluidos)}
            rotulo="módulos"
          />
        </View>

        <Text style={styles.secao}>Progresso por módulo</Text>
        <View style={styles.lista}>
          {trilha.map((modulo) => {
            const fracao = modulo.total ? modulo.concluidas / modulo.total : 0;
            return (
              <View key={modulo.id} style={styles.linhaModulo}>
                <View style={styles.linhaTopo}>
                  <Text style={styles.moduloTema} numberOfLines={1}>
                    {modulo.tema_pt}
                  </Text>
                  <Text style={styles.moduloContagem}>
                    {modulo.total ? `${modulo.concluidas}/${modulo.total}` : '—'}
                  </Text>
                </View>
                <View style={styles.barra}>
                  <View
                    style={[styles.barraCheia, { width: `${fracao * 100}%` }]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.secao}>Conquistas</Text>
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>
            As conquistas chegam junto com os checkpoints de módulo.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Estatistica({
  icone,
  cor,
  valor,
  rotulo,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
  valor: string;
  rotulo: string;
}) {
  return (
    <View style={styles.estatistica}>
      <Ionicons name={icone} size={22} color={cor} />
      <Text style={styles.estatisticaValor}>{valor}</Text>
      <Text style={styles.estatisticaRotulo}>{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, alignItems: 'center' },
  coluna: { width: '100%', maxWidth: larguraMaximaConteudo, gap: espaco.md },

  identidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: raio.pill,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: {
    fontSize: fonte.titulo,
    fontWeight: peso.forte,
    color: cores.superficie,
  },
  identidadeTexto: { flex: 1, gap: 2 },
  nome: { fontSize: fonte.titulo, fontWeight: peso.forte, color: cores.texto },
  nivel: { fontSize: fonte.corpo, color: cores.textoSuave },

  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  estatistica: {
    flexGrow: 1,
    flexBasis: '45%',
    alignItems: 'center',
    gap: 2,
    padding: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  estatisticaValor: {
    fontSize: fonte.titulo,
    fontWeight: peso.forte,
    color: cores.texto,
  },
  estatisticaRotulo: { fontSize: fonte.pequena, color: cores.textoSuave },

  secao: {
    fontSize: fonte.pequena,
    fontWeight: peso.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: espaco.sm,
  },
  lista: { gap: espaco.sm },
  linhaModulo: {
    gap: espaco.xs,
    padding: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  moduloTema: { flex: 1, fontSize: fonte.corpo, color: cores.texto },
  moduloContagem: { fontSize: fonte.pequena, color: cores.textoSuave },
  barra: {
    height: 8,
    borderRadius: raio.pill,
    backgroundColor: cores.fundoSuave,
    overflow: 'hidden',
  },
  barraCheia: { height: '100%', backgroundColor: cores.primaria },

  vazio: {
    padding: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: cores.borda,
  },
  vazioTexto: { fontSize: fonte.pequena, color: cores.textoSuave },
});
