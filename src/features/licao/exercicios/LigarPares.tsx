import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte, peso, raio } from '@/theme/tokens';
import type { ExLigarPares } from '@/types/schema';

import type { PropsExercicio } from './tipos';

/**
 * Toca no croata, depois no português. Ligar de novo troca o par.
 * Embaralha o lado PT com uma ordem estável — sem isso a resposta
 * seria só "ligar linha por linha".
 */
export function LigarPares({
  exercicio,
  resposta,
  aoResponder,
  travado,
}: PropsExercicio<ExLigarPares>) {
  const [hrAtivo, setHrAtivo] = useState<string | null>(null);
  const ligacoes = resposta?.tipo === 'pares' ? resposta.valor : {};

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
            <Pressable
              key={par.hr}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo, disabled: travado }}
              onPress={() => tocarHr(par.hr)}
              style={[
                styles.ficha,
                ligado && styles.fichaLigada,
                ativo && styles.fichaAtiva,
                certo && styles.fichaCerta,
                errado && styles.fichaErrada,
              ]}
            >
              <Text style={[styles.hr, errado && styles.textoErrado]}>
                {par.hr}
              </Text>
              {ligacoes[par.hr] && (
                <Text style={styles.ligacao} numberOfLines={1}>
                  {ligacoes[par.hr]}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.coluna}>
        {ladoPt.map((pt) => {
          const usado = ptJaUsado(pt);
          const dono = ptLigadoA(pt);
          const certo =
            travado && exercicio.pares.some((p) => p.hr === dono && p.pt === pt);
          return (
            <Pressable
              key={pt}
              accessibilityRole="button"
              accessibilityState={{ disabled: travado || !hrAtivo }}
              onPress={() => tocarPt(pt)}
              style={[
                styles.ficha,
                usado && styles.fichaLigada,
                certo && styles.fichaCerta,
                hrAtivo && !travado && styles.fichaAlvo,
              ]}
            >
              <Text style={styles.pt}>{pt}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
  fichaAtiva: {
    borderColor: cores.primaria,
    backgroundColor: cores.primariaSuave,
  },
  fichaAlvo: { borderColor: cores.secundaria },
  fichaLigada: { backgroundColor: cores.fundoSuave },
  fichaCerta: { borderColor: cores.acerto, backgroundColor: cores.acertoSuave },
  fichaErrada: { borderColor: cores.erro, backgroundColor: cores.erroSuave },
  hr: { fontSize: fonte.subtitulo, fontWeight: peso.forte, color: cores.primaria },
  pt: { fontSize: fonte.pequena + 1, color: cores.texto },
  ligacao: { fontSize: fonte.pequena, color: cores.textoSuave },
  textoErrado: { color: cores.erro },
});
