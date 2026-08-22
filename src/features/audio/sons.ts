import { useAudioPlayer } from 'expo-audio';
import { useCallback } from 'react';

import { usePreferencias } from '@/features/config/Preferencias';

/**
 * Os dois sons de resposta: acerto e erro.
 *
 * Ficam no BUNDLE, não no Storage — e isso não briga com a regra 2 do
 * CLAUDE.md. A regra fala de CONTEÚDO (palavras, frases, áudio de
 * pronúncia), que é curado e muda sem novo build. Estes dois são casca de
 * interface, como o ícone e a cor: têm que soar no mesmo quadro em que a
 * cor do rodapé muda, e uma ida à rede transformaria a confirmação num
 * eco atrasado.
 *
 * Gerados por `scripts/gerar-sons.mjs` — as notas e o volume estão lá.
 *
 * Um player por som, nunca um só trocando de faixa: `replace()` destrói o
 * elemento de áudio no meio de um `play()` que ainda não resolveu, e o
 * navegador devolve `AbortError` (o mesmo motivo do `EscolherForma`).
 */
const ACERTO = require('../../../assets/sons/acerto.wav');
const ERRO = require('../../../assets/sons/erro.wav');

/** Devolve a função que toca o som do veredito. */
export function useSomDeResposta(): (acertou: boolean) => void {
  const { efeitosSonoros } = usePreferencias();
  const acerto = useAudioPlayer(ACERTO);
  const erro = useAudioPlayer(ERRO);

  return useCallback(
    (acertou: boolean) => {
      if (!efeitosSonoros) return;
      const player = acertou ? acerto : erro;
      // seekTo(0) antes de tocar: sem isso, responder duas questões
      // rápido faz a segunda começar de onde a primeira parou.
      player.seekTo(0);
      player.play();
    },
    [efeitosSonoros, acerto, erro],
  );
}
