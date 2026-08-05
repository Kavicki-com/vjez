import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Carregando } from '@/components/Estados';
import { Sahovnica } from '@/components/Sahovnica';
import { PortaoDeLogin } from '@/features/conta/PortaoDeLogin';
import { useSessao } from '@/features/conta/hooks';
import { fotoDaSessao, nomeDaSessao } from '@/features/conta/identidade';
import { useTrilha } from '@/features/licao/hooks';
import { useProgressoLocal } from '@/features/perfil/ProgressoLocal';
import {
  calcularConquistas,
  type Conquista,
} from '@/features/perfil/conquistas';
import { usePerfil, useProgressoLicoes } from '@/features/perfil/hooks';
import { montarTrilha } from '@/features/trilha/estado';
import {
  cores,
  espaco,
  familia,
  fonte,
  larguraMaximaConteudo,
  linha,
  raio,
  tracking,
} from '@/theme/tokens';
import type { Nivel, ProgressoLicao } from '@/types/schema';

const ROTULO_NIVEL: Record<Nivel, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export default function Perfil() {
  const { carregando, autenticado, sessao } = useSessao();
  const { data: perfil } = usePerfil();
  const { data: modulos } = useTrilha();
  const { data: progressoServidor } = useProgressoLicoes();
  const { notas } = useProgressoLocal();

  const trilha = useMemo(() => {
    if (!modulos) return [];
    const local: ProgressoLicao[] = Object.entries(notas).map(
      ([licaoId, nota]) => ({
        usuarioId: perfil?.id ?? 'convidado',
        licaoId,
        nota,
        concluida: true,
        data: '',
      }),
    );
    return montarTrilha(modulos, [...(progressoServidor ?? []), ...local]);
  }, [modulos, progressoServidor, notas, perfil?.id]);

  const licoesFeitas = trilha.reduce((n, m) => n + m.concluidas, 0);
  const modulosConcluidos = trilha.filter((m) => m.estado === 'concluido').length;
  const diasDeOfensiva = perfil?.ofensiva.diasSeguidos ?? 0;
  // O provedor é a fonte mais fresca: trocar a foto no Google reflete aqui.
  const nome = nomeDaSessao(sessao) ?? perfil?.nome;

  const conquistas = useMemo(
    () =>
      calcularConquistas({
        licoesConcluidas: licoesFeitas,
        modulosConcluidos,
        diasDeOfensiva,
        trilha,
      }),
    [licoesFeitas, modulosConcluidos, diasDeOfensiva, trilha],
  );

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
          <Sahovnica noTopo />
          <View style={styles.identidadeCorpo}>
            <View style={styles.avatarCaixa}>
              <Avatar fotoUrl={fotoDaSessao(sessao)} nome={nome} />
              <View style={styles.selo}>
                <Text style={styles.seloTexto}>{modulosConcluidos}</Text>
              </View>
            </View>
            <Text style={styles.nome}>{nome ?? 'Aprendiz'}</Text>
            <Text style={styles.nivel}>
              Nível {ROTULO_NIVEL[perfil?.nivel ?? 'basico']}
            </Text>
          </View>
        </View>

        <View style={styles.bento}>
          <Estatistica
            icone="flame"
            cor={cores.primaria}
            fundo={cores.primariaSuave}
            valor={String(diasDeOfensiva)}
            rotulo="dias de ofensiva"
          />
          <Estatistica
            icone="flash"
            cor={cores.secundaria}
            fundo={cores.secundariaSuave}
            valor={String(perfil?.xp ?? 0)}
            rotulo="XP total"
          />
          <Estatistica
            icone="checkmark-done"
            cor={cores.acerto}
            fundo={cores.acertoSuave}
            valor={String(licoesFeitas)}
            rotulo="lições feitas"
          />
          <Estatistica
            icone="map"
            cor={cores.terciaria}
            fundo={cores.sobreTerciariaContainer}
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
        <View style={styles.lista}>
          {conquistas.map((c) => (
            <CartaoConquista key={c.id} conquista={c} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Estatistica({
  icone,
  cor,
  fundo,
  valor,
  rotulo,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
  fundo: string;
  valor: string;
  rotulo: string;
}) {
  return (
    <View style={[styles.estatistica, { borderTopColor: cor }]}>
      <View style={[styles.estatisticaIcone, { backgroundColor: fundo }]}>
        <Ionicons name={icone} size={22} color={cor} />
      </View>
      <Text style={styles.estatisticaValor}>{valor}</Text>
      <Text style={styles.estatisticaRotulo}>{rotulo}</Text>
    </View>
  );
}

function CartaoConquista({ conquista }: { conquista: Conquista }) {
  const fracao = Math.min(conquista.atual / conquista.meta, 1);
  const cor = conquista.concluida ? cores.terciaria : cores.contorno;

  return (
    <View
      style={[styles.conquista, !conquista.concluida && styles.conquistaPendente]}
    >
      <View
        style={[
          styles.conquistaIcone,
          {
            backgroundColor: conquista.concluida
              ? cores.terciariaContainer
              : cores.superficieVariante,
          },
        ]}
      >
        <Ionicons
          name={conquista.icone}
          size={26}
          color={conquista.concluida ? cores.superficie : cores.contorno}
        />
      </View>

      <View style={styles.conquistaTexto}>
        <View style={styles.linhaTopo}>
          <Text style={styles.conquistaTitulo}>{conquista.titulo}</Text>
          <Text style={[styles.conquistaContagem, { color: cor }]}>
            {conquista.concluida
              ? 'conquistado'
              : `${conquista.atual}/${conquista.meta}`}
          </Text>
        </View>
        <Text style={styles.conquistaDescricao}>{conquista.descricao}</Text>
        <View style={styles.barra}>
          <View
            style={[
              styles.barraCheia,
              { width: `${fracao * 100}%`, backgroundColor: cor },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, alignItems: 'center' },
  coluna: { width: '100%', maxWidth: larguraMaximaConteudo, gap: espaco.md },

  identidade: {
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    overflow: 'hidden',
  },
  identidadeCorpo: { alignItems: 'center', gap: espaco.xs, padding: espaco.lg },
  avatarCaixa: { marginBottom: espaco.sm },
  selo: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    minWidth: 36,
    height: 36,
    paddingHorizontal: espaco.xs,
    borderRadius: raio.pill,
    backgroundColor: cores.secundaria,
    borderWidth: 3,
    borderColor: cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seloTexto: {
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.forte,
    color: cores.superficie,
  },
  nome: {
    fontSize: fonte.titulo,
    lineHeight: linha.titulo,
    letterSpacing: tracking.titulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  nivel: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },

  bento: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.md },
  estatistica: {
    flexGrow: 1,
    flexBasis: '44%',
    alignItems: 'center',
    gap: espaco.xs,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderTopWidth: 4,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  estatisticaIcone: {
    width: 44,
    height: 44,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.xs,
  },
  estatisticaValor: {
    fontSize: fonte.titulo,
    lineHeight: linha.titulo,
    fontFamily: familia.extraForte,
    color: cores.texto,
  },
  estatisticaRotulo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  secao: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: espaco.md,
  },
  lista: { gap: espaco.sm },

  linhaModulo: {
    gap: espaco.xs,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  moduloTema: {
    flex: 1,
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.texto,
  },
  moduloContagem: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },
  barra: {
    height: 8,
    borderRadius: raio.pill,
    backgroundColor: cores.superficieVariante,
    overflow: 'hidden',
  },
  barraCheia: { height: '100%', backgroundColor: cores.primaria },

  conquista: {
    flexDirection: 'row',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  conquistaPendente: { opacity: 0.75 },
  conquistaIcone: {
    width: 56,
    height: 56,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conquistaTexto: { flex: 1, gap: espaco.xs },
  conquistaTitulo: {
    flex: 1,
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  conquistaContagem: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
  },
  conquistaDescricao: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
});
