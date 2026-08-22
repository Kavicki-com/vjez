import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { BASE_WEB } from '@/lib/base';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
  sombra,
} from '@/theme/tokens';

/**
 * O convite para instalar o Vjež na tela inicial.
 *
 * Flutua sobre a trilha porque é oferta, não conteúdo: não pode empurrar o
 * caminho para baixo nem disputar a primeira dobra com a ofensiva.
 *
 * SÓ NA WEB, e só enquanto o app não está instalado. No iOS e no Android
 * nativos ele não existe — lá o app já veio da loja.
 *
 * Dois caminhos, porque os navegadores discordam:
 *
 * 1. Chrome, Edge, Samsung: disparam `beforeinstallprompt` quando o site
 *    cumpre os critérios de PWA (manifest, service worker, HTTPS). Guardamos
 *    o evento e chamamos `prompt()` no toque — é a instalação de um clique.
 *
 * 2. Safari do iPhone: NUNCA dispara esse evento, e não há API de
 *    instalação. O único caminho é Compartilhar → Adicionar à Tela de
 *    Início, que é conhecimento escondido — quem não sabe, não descobre.
 *    Então ali o convite vira instrução.
 *
 * A dispensa vive em memória (regra 5 do CLAUDE.md: nada de storage do
 * navegador na lógica de produção) e isso é suficiente aqui: o convite só
 * aparece enquanto o app NÃO está instalado, e some para sempre no instante
 * em que for. Não há nag para limitar.
 */

/** O evento do Chrome não está no lib.dom do TypeScript. */
type EventoDeInstalacao = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const NA_WEB = Platform.OS === 'web';

/** Já está rodando instalado? Então não há o que oferecer. */
function jaInstalado(): boolean {
  if (!NA_WEB || typeof window === 'undefined') return true;
  try {
    // `standalone` é a resposta do Safari do iPhone; o media query é a de
    // todo o resto.
    const iosInstalado = (
      window.navigator as Navigator & { standalone?: boolean }
    ).standalone;
    return (
      iosInstalado === true ||
      window.matchMedia('(display-mode: standalone)').matches
    );
  } catch {
    return true;
  }
}

function eIphone(): boolean {
  if (!NA_WEB || typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function ConviteDeInstalacao({
  aoMudarVisibilidade,
}: {
  /**
   * Avisa a tela que o cartão está (ou não) ocupando o rodapé, para ela
   * abrir folga no fim da rolagem. Sem isso o convite cobre o último nó da
   * trilha — e o último nó é justamente o próximo passo do aluno.
   */
  aoMudarVisibilidade?: (visivel: boolean) => void;
}) {
  const [evento, setEvento] = useState<EventoDeInstalacao | null>(null);
  const [instalado, setInstalado] = useState(true);
  const [dispensado, setDispensado] = useState(false);
  const [ensinando, setEnsinando] = useState(false);

  useEffect(() => {
    if (!NA_WEB || typeof window === 'undefined') return;

    setInstalado(jaInstalado());

    const aoPoderInstalar = (e: Event) => {
      // Sem isto o Chrome mostra a própria barrinha, que aparece uma vez e
      // some — e o aluno que perdeu não tem como pedir de volta.
      e.preventDefault();
      setEvento(e as EventoDeInstalacao);
    };

    const aoInstalar = () => {
      setInstalado(true);
      setEvento(null);
    };

    window.addEventListener('beforeinstallprompt', aoPoderInstalar);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoPoderInstalar);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  const noIphone = eIphone();
  // No iPhone não há evento para esperar: se não está instalado, oferece.
  const temOferta = Boolean(evento) || (noIphone && !instalado);
  const visivel = NA_WEB && !instalado && !dispensado && temOferta;

  useEffect(() => {
    aoMudarVisibilidade?.(visivel);
  }, [visivel, aoMudarVisibilidade]);

  if (!visivel) return null;

  const instalar = () => {
    if (noIphone && !evento) {
      setEnsinando((atual) => !atual);
      return;
    }
    if (!evento) return;
    void evento.prompt();
    void evento.userChoice.then(({ outcome }) => {
      // Aceito ou recusado, o evento não serve duas vezes.
      setEvento(null);
      if (outcome === 'dismissed') setDispensado(true);
    });
  };

  return (
    <View style={styles.ancora} pointerEvents="box-none">
      <View style={[styles.cartao, sombra.elevada]}>
        <Image
          source={{ uri: `${BASE_WEB}/icones/icone-192.png` }}
          style={styles.icone}
          accessibilityIgnoresInvertColors
        />

        <View style={styles.texto}>
          <Text style={styles.titulo}>Vjež na tela inicial</Text>
          <Text style={styles.detalhe}>
            {ensinando
              ? 'Toque em Compartilhar, embaixo, e escolha “Adicionar à Tela de Início”.'
              : 'Abre em tela cheia e funciona sem sinal.'}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Instalar o Vjež na tela inicial"
          onPress={instalar}
          style={({ pressed }) => [styles.acao, pressed && styles.acaoPressionada]}
        >
          <Text style={styles.acaoTexto}>
            {noIphone && !evento ? (ensinando ? 'Entendi' : 'Como?') : 'Instalar'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dispensar o convite"
          hitSlop={espaco.sm}
          onPress={() => setDispensado(true)}
          style={styles.fechar}
        >
          <Ionicons name="close" size={18} color={cores.textoSuave} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /**
   * Ancorado no rodapé da tela, sem capturar toque fora do cartão — a
   * trilha continua rolando com o dedo em cima dele.
   */
  ancora: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: espaco.md,
    alignItems: 'center',
  },
  cartao: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    padding: espaco.sm + espaco.xs,
    paddingRight: espaco.lg,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  icone: { width: 40, height: 40, borderRadius: raio.md },
  texto: { flex: 1, gap: 1 },
  titulo: {
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  detalhe: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
  acao: {
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
    borderRadius: raio.pill,
    backgroundColor: cores.primaria,
  },
  acaoPressionada: { opacity: 0.85 },
  acaoTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.superficie,
  },
  // Encostado no canto, fora do fluxo: fechar não pode disputar espaço com
  // instalar, que é a ação que importa.
  fechar: { position: 'absolute', top: espaco.xs, right: espaco.xs },
});
