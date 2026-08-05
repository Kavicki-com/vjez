import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { usePreferencias } from '@/features/config/Preferencias';
import { cores, raio } from '@/theme/tokens';

type Props = {
  url: string;
  /** O que está sendo falado, para o leitor de tela. */
  rotulo: string;
  tamanho?: 'pequeno' | 'grande';
  /**
   * Toca sozinho ao aparecer, se a preferência estiver ligada.
   * Usado nos exercícios: o aluno ouve antes de responder.
   */
  automatico?: boolean;
};

/**
 * Botão de ouvir. Só existe quando há MP3 — conteúdo sem áudio não ganha
 * botão morto.
 *
 * Cada botão tem o próprio player: são trechos de 1 a 3 segundos e o aluno
 * costuma repetir o mesmo várias vezes, então instância dedicada evita o
 * corte que um player compartilhado causaria ao trocar de faixa.
 */
export function BotaoAudio({
  url,
  rotulo,
  tamanho = 'pequeno',
  automatico,
}: Props) {
  const player = useAudioPlayer({ uri: url });
  const status = useAudioPlayerStatus(player);
  const { audioAutomatico } = usePreferencias();

  const grande = tamanho === 'grande';
  const dimensao = grande ? 48 : 40;

  useEffect(() => {
    if (!automatico || !audioAutomatico || !status.isLoaded) return;
    player.seekTo(0);
    player.play();
    // Só na primeira vez que a faixa fica pronta: repetir depois disso
    // faria o áudio disparar de novo a cada re-render do exercício.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.isLoaded, automatico, audioAutomatico]);

  const tocar = () => {
    // Tocar de novo com a faixa no fim não faz nada sem voltar ao início —
    // e repetir é justamente o uso mais comum aqui.
    player.seekTo(0);
    player.play();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvir ${rotulo}`}
      onPress={tocar}
      style={({ pressed }) => [
        styles.base,
        { width: dimensao, height: dimensao },
        grande && styles.grande,
        status.playing && styles.tocando,
        pressed && styles.pressionado,
      ]}
    >
      <Ionicons
        name={status.playing ? 'volume-high' : grande ? 'volume-medium' : 'play'}
        size={grande ? 24 : 20}
        color={status.playing ? cores.superficie : cores.secundaria}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.secundariaSuave,
  },
  grande: { backgroundColor: cores.secundariaSuave },
  tocando: { backgroundColor: cores.secundaria },
  pressionado: { opacity: 0.8 },
});
