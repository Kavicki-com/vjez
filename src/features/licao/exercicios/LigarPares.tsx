import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAudioDeTexto } from '@/features/audio/useAudioDeTexto';
import {
  associacao,
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
  sombra,
} from '@/theme/tokens';
import type { ExLigarPares } from '@/types/schema';

import type { PropsExercicio } from './tipos';

type Cor = (typeof associacao)[number];

/**
 * Toca no croata, depois no português. Ligar de novo troca o par.
 * Embaralha o lado PT com uma ordem estável — sem isso a resposta
 * seria só "ligar linha por linha".
 *
 * Cada palavra croata tem uma COR fixa, tirada da ordem em que ela aparece
 * no exercício. É a mesma cor nos dois lados: ligar pinta a ficha
 * portuguesa com a cor da croata, e a tela passa a mostrar de relance o
 * que foi ligado com o quê — que é a informação que o aluno precisa para
 * revisar antes de verificar. Ver `associacao` em @/theme/tokens.
 */
export function LigarPares({
  exercicio,
  resposta,
  aoResponder,
  travado,
}: PropsExercicio<ExLigarPares>) {
  const [hrAtivo, setHrAtivo] = useState<string | null>(null);
  const ligacoes = resposta?.tipo === 'pares' ? resposta.valor : {};
  const { data: audios } = useAudioDeTexto();

  const ladoPt = useMemo(() => {
    // Ordem derivada do id do exercício: estável entre renders e entre
    // aparelhos, mas diferente da ordem do lado croata.
    const semente = exercicio.id;
    return [...exercicio.pares]
      .map((par, i) => ({
        pt: par.pt,
        chave: `${semente.charCodeAt(i % semente.length)}-${par.pt}`,
      }))
      .sort((a, b) => a.chave.localeCompare(b.chave))
      .map((x) => x.pt);
  }, [exercicio.id, exercicio.pares]);

  // A cor vem da posição no lado croata — que é a ordem cadastrada, não a
  // embaralhada. Assim a mesma ficha tem a mesma cor a cada render.
  const corDoHr = useMemo(() => {
    const mapa = new Map<string, Cor>();
    exercicio.pares.forEach((par, i) => {
      mapa.set(par.hr, associacao[i % associacao.length]);
    });
    return mapa;
  }, [exercicio.pares]);

  const ptJaUsado = (pt: string) => Object.values(ligacoes).includes(pt);
  const ptLigadoA = (pt: string) =>
    Object.keys(ligacoes).find((hr) => ligacoes[hr] === pt);

  const tocarHr = (hr: string) => {
    if (travado) return;
    setHrAtivo((atual) => (atual === hr ? null : hr));
  };

  const tocarPt = (pt: string) => {
    if (travado || !hrAtivo) return;
    const novo = { ...ligacoes };
    // Um PT só serve a um HR: solta o dono anterior.
    for (const hr of Object.keys(novo)) {
      if (novo[hr] === pt) delete novo[hr];
    }
    novo[hrAtivo] = pt;
    aoResponder({ tipo: 'pares', valor: novo });
    setHrAtivo(null);
  };

  return (
    <View style={styles.colunas}>
      <View style={styles.coluna}>
        {exercicio.pares.map((par) => {
          const ligado = Boolean(ligacoes[par.hr]);
          const ativo = hrAtivo === par.hr;
          const certo = travado && ligacoes[par.hr] === par.pt;
          const errado = travado && ligado && ligacoes[par.hr] !== par.pt;
          return (
            <FichaHr
              key={par.hr}
              hr={par.hr}
              url={audios?.get(par.hr)}
              ligadoA={ligacoes[par.hr]}
              // Depois de verificar quem manda é verde ou vermelho: a cor de
              // associação já cumpriu o papel dela.
              cor={travado ? undefined : corDoHr.get(par.hr)}
              ativo={ativo}
              certo={certo}
              errado={errado}
              travado={travado}
              aoTocar={() => tocarHr(par.hr)}
            />
          );
        })}
      </View>

      <View style={styles.coluna}>
        {ladoPt.map((pt) => {
          const usado = ptJaUsado(pt);
          const dono = ptLigadoA(pt);
          const certo =
            travado && exercicio.pares.some((p) => p.hr === dono && p.pt === pt);
          const errado = travado && Boolean(dono) && !certo;
          // A ficha portuguesa empresta a cor da croata que a escolheu.
          const cor = !travado && dono ? corDoHr.get(dono) : undefined;

          return (
            <Pressable
              key={pt}
              accessibilityRole="button"
              accessibilityLabel={
                dono ? `${pt}, ligado a ${dono}` : pt
              }
              accessibilityState={{ disabled: travado || !hrAtivo }}
              onPress={() => tocarPt(pt)}
              style={[
                styles.ficha,
                usado && styles.fichaLigada,
                cor && { borderColor: cor.borda, backgroundColor: cor.fundo },
                // Alvo é só a dica de "pode soltar aqui", e só nas fichas
                // que ainda não têm dono — pintar as ligadas por cima
                // apagaria a associação bem na hora de conferir.
                hrAtivo && !travado && !usado && styles.fichaAlvo,
                certo && styles.fichaCerta,
                errado && styles.fichaErrada,
              ]}
            >
              <Text style={[styles.pt, errado && styles.textoErrado]}>{pt}</Text>
              {/* O nome da parceira, para quem não distingue a cor. */}
              {dono && !travado && (
                <Text
                  style={[styles.ligacao, cor && { color: cor.texto }]}
                  numberOfLines={1}
                >
                  {dono}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type PropsFicha = {
  hr: string;
  /** Sem faixa, a ficha não fala e não mostra o alto-falante. */
  url?: string;
  ligadoA?: string;
  /** Cor de associação desta palavra. Ausente depois de verificar. */
  cor?: Cor;
  ativo: boolean;
  certo: boolean;
  errado: boolean;
  travado: boolean;
  aoTocar: () => void;
};

/**
 * Ficha croata, com o próprio player — pelo mesmo motivo do `EscolherForma`:
 * player compartilhado com `replace()` destrói o `<audio>` no meio de um
 * `play()` que ainda não resolveu, e o navegador devolve `AbortError`.
 *
 * Fala inclusive quando o toque é para DESmarcar: ligar pares é onde a
 * palavra croata mais aparece solta, e ouvi-la de novo é o motivo mais comum
 * para tocar nela duas vezes.
 */
function FichaHr({
  hr,
  url,
  ligadoA,
  cor,
  ativo,
  certo,
  errado,
  travado,
  aoTocar,
}: PropsFicha) {
  const player = useAudioPlayer(url ? { uri: url } : null);
  // A cor aparece quando a ficha está na mão (ativa) ou já ligada. Parada e
  // solta, ela é neutra — senão a coluna inteira nasce colorida e a cor
  // deixa de significar "esta eu liguei".
  const pintura = cor && (ativo || Boolean(ligadoA)) ? cor : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: ativo, disabled: travado }}
      onPress={() => {
        if (url && !travado) {
          player.seekTo(0);
          player.play();
        }
        aoTocar();
      }}
      style={[
        styles.ficha,
        Boolean(ligadoA) && styles.fichaLigada,
        pintura && {
          borderColor: pintura.borda,
          backgroundColor: pintura.fundo,
        },
        // Erguer a ficha ativa é o que separa "estou segurando esta" de
        // "esta já está ligada", já que as duas usam a mesma cor.
        ativo && sombra.elevada,
        certo && styles.fichaCerta,
        errado && styles.fichaErrada,
      ]}
    >
      <View style={styles.linhaHr}>
        <Text style={[styles.hr, errado && styles.textoErrado]}>{hr}</Text>
        {url && (
          <Ionicons
            name="volume-medium"
            size={16}
            color={
              errado ? cores.erro : (pintura?.borda ?? cores.contorno)
            }
          />
        )}
      </View>
      {ligadoA && (
        <Text
          style={[styles.ligacao, pintura && { color: pintura.texto }]}
          numberOfLines={1}
        >
          {ligadoA}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  colunas: { flexDirection: 'row', gap: espaco.sm },
  coluna: { flex: 1, gap: espaco.sm },
  ficha: {
    minHeight: 56,
    justifyContent: 'center',
    padding: espaco.sm,
    borderRadius: raio.md,
    borderWidth: 2,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  // Dica de "pode soltar aqui" nas fichas ainda livres.
  fichaAlvo: { borderColor: cores.secundariaContainer, borderStyle: 'dashed' },
  fichaLigada: { backgroundColor: cores.fundoSuave },
  fichaCerta: { borderColor: cores.acerto, backgroundColor: cores.acertoSuave },
  fichaErrada: { borderColor: cores.erro, backgroundColor: cores.erroSuave },
  // Palavra croata é conteúdo-alvo, não estado: fica no vermelho, igual
  // ao dicionário. A cor de associação mora na borda e no fundo.
  linhaHr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.xs,
  },
  hr: { fontSize: fonte.subtitulo, lineHeight: linha.subtitulo, fontFamily: familia.forte, color: cores.primaria },
  pt: { fontSize: fonte.pequena, lineHeight: linha.pequena + 1, fontFamily: familia.normal, color: cores.texto },
  ligacao: { fontSize: fonte.pequena, lineHeight: linha.pequena, fontFamily: familia.medio, color: cores.textoSuave },
  textoErrado: { color: cores.erro },
});
