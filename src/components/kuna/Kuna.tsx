import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import Svg from 'react-native-svg';

import { caixas, desenhos, type Junta, type Rosto, type Tronco } from './arte';
import { estado as estadoDe, type Movimento, type NomeDoEstado } from './estados';
import {
  arteDa,
  lugarDe,
  ordemDe,
  palco,
  pivoDe,
  pivoDoCorpo,
  troncoDoRosto,
  type Aparencia,
} from './pose';

/**
 * O Kuna animado.
 *
 * Cada peça é uma `Animated.View` própria com um `<Svg>` estático dentro —
 * não é o SVG que anima, é a View. Isso vale porque as props de transformação
 * do react-native-svg (`rotation`, `originX`, `scaleX`…) estão todas
 * depreciadas na v15, enquanto `transform` de View com `useNativeDriver`
 * roda fora da thread de JS e se comporta igual na web, no iOS e no Android.
 *
 * As peças são irmãs, e a ordem vem da montagem (`ordemDe`). Como
 * cada `<Svg>` recorta só a sua peça pelo viewBox, elas se sobrepõem sem
 * máscara nenhuma.
 */

type Props = {
  estado?: NomeDoEstado;
  /**
   * Troca só a cabeça, mantendo o corpo do estado. Sem ele vale o rosto que
   * o estado pede. Serve para separar o que ele FAZ do que ele SENTE: o
   * mesmo `parado` pode estar `triste` ou `surpreso`.
   */
  rosto?: Rosto;
  /**
   * Para que lado o corpo está virado. Sem ele o tronco acompanha o rosto,
   * que é o que quase sempre se quer; dizer outra coisa é pedir cabeça
   * virada com corpo de frente — olhar por cima do ombro.
   */
  tronco?: Tronco;
  /** Altura em px. A largura sai da proporção do palco. */
  altura?: number;
  /** Trava na pose inicial. O sistema já congela sozinho se o usuário pediu menos movimento. */
  congelado?: boolean;
  /** Em PT-BR. Sem ele o boneco é decorativo e o leitor de tela pula. */
  rotuloAcessivel?: string;
};

export function Kuna({
  estado = 'parado',
  rosto: rostoForcado,
  tronco: troncoForcado,
  altura = 200,
  congelado = false,
  rotuloAcessivel,
}: Props) {
  const reduzido = useMovimentoReduzido();
  const parar = congelado || reduzido;
  const { juntas, ...doEstado } = useMemo(() => estadoDe(estado), [estado]);
  const rosto = rostoForcado ?? doEstado.rosto;
  const aparencia: Aparencia = {
    montagem: doEstado.montagem,
    rosto,
    // Trocar só o rosto tem de virar o corpo junto, senão o pescoço torce.
    tronco: troncoForcado ?? (rostoForcado ? troncoDoRosto(rostoForcado) : doEstado.tronco),
  };
  const escala = altura / palco.altura;

  return (
    <View
      style={{ width: palco.largura * escala, height: altura }}
      accessible={!!rotuloAcessivel}
      accessibilityRole={rotuloAcessivel ? 'image' : undefined}
      accessibilityLabel={rotuloAcessivel}
      importantForAccessibility={rotuloAcessivel ? 'yes' : 'no-hide-descendants'}
      accessibilityElementsHidden={!rotuloAcessivel}
    >
      {/* O boneco inteiro: é daqui que sai o pulo do `comemora`. */}
      <Corpo mov={juntas.corpo} escala={escala} parar={parar}>
        {ordemDe(aparencia.montagem).map((junta) => (
          <Peca
            key={junta}
            junta={junta}
            aparencia={aparencia}
            mov={juntas[junta]}
            escala={escala}
            parar={parar}
          />
        ))}
      </Corpo>
    </View>
  );
}

// ------------------------------------------------------------------ peças

function Corpo({
  mov,
  escala,
  parar,
  children,
}: {
  mov?: Movimento;
  escala: number;
  parar: boolean;
  children: ReactNode;
}) {
  const progresso = useCiclo(mov, parar);
  const [px, py] = pivoDoCorpo;
  const transform = montarTransformacao(
    mov,
    progresso,
    parar,
    {
      x: px * escala - (palco.largura * escala) / 2,
      y: py * escala - (palco.altura * escala) / 2,
    },
    escala,
  );
  return <Animated.View style={[StyleSheet.absoluteFill, { transform }]}>{children}</Animated.View>;
}

function Peca({
  junta,
  aparencia,
  mov,
  escala,
  parar,
}: {
  junta: Junta;
  aparencia: Aparencia;
  mov?: Movimento;
  escala: number;
  parar: boolean;
}) {
  const progresso = useCiclo(mov, parar);

  const arte = arteDa(junta, aparencia);
  const caixa = caixas[arte];
  const lugar = lugarDe(junta, aparencia);
  const largura = caixa.largura * escala;
  const alturaPeca = caixa.altura * escala;
  const [px, py] = pivoDe(junta, aparencia);

  // A `transform` da RN gira em torno do CENTRO da View. O pivô é um ponto
  // qualquer da peça (o ombro, o quadril), então entra como deslocamento até
  // o centro — vai, gira, e volta.
  const transform = montarTransformacao(
    mov,
    progresso,
    parar,
    {
      x: (px - lugar.x) * escala - largura / 2,
      y: (py - lugar.y) * escala - alturaPeca / 2,
    },
    escala,
  );

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: lugar.x * escala,
        top: lugar.y * escala,
        width: largura,
        height: alturaPeca,
        transform,
      }}
    >
      {/*
        `fill="none"` é o padrão da raiz do SVG que o Figma exporta, e ele
        importa: o Ž do boné e o háček são caminhos só de TRAÇO, sem fill.
        Sem isto cada um vira um borrão preto, porque em SVG a ausência de
        fill não é "nenhum", é preto.
      */}
      <Svg
        width={largura}
        height={alturaPeca}
        viewBox={`${caixa.x} ${caixa.y} ${caixa.largura} ${caixa.altura}`}
        fill="none"
      >
        {desenhos[arte]}
      </Svg>
    </Animated.View>
  );
}

// ------------------------------------------------------------------ motor

/** Um relógio 0 → 1 em laço, no ritmo do movimento. Parado, fica em 0. */
function useCiclo(mov: Movimento | undefined, parar: boolean) {
  const progresso = useRef(new Animated.Value(0)).current;
  const duracao = mov?.duracao;

  useEffect(() => {
    progresso.setValue(0);
    if (!duracao || parar) return;
    const laco = Animated.loop(
      Animated.timing(progresso, {
        toValue: 1,
        duration: duracao,
        // O relógio é linear; quem dá o peso é a suavização entre quadros.
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    laco.start();
    return () => laco.stop();
  }, [duracao, parar, progresso]);

  return progresso;
}

type Quadro = readonly [number, number];

/**
 * Quadros esparsos → rampa amostrada com suavização.
 *
 * Interpolar direto entre dois quadros dá velocidade constante, e um
 * respiro de velocidade constante parece motor, não fôlego. Aqui cada
 * trecho é picado em amostras com `smoothstep`, que sai e chega parado.
 */
function rampa(quadros: readonly Quadro[], amostras = 8) {
  const entrada: number[] = [];
  const saida: number[] = [];

  for (let i = 0; i < quadros.length - 1; i++) {
    const [p0, v0] = quadros[i];
    const [p1, v1] = quadros[i + 1];
    if (p1 <= p0) continue; // a entrada do Animated tem de subir sempre
    for (let k = 0; k < amostras; k++) {
      const f = k / amostras;
      entrada.push(p0 + (p1 - p0) * f);
      saida.push(v0 + (v1 - v0) * (f * f * (3 - 2 * f)));
    }
  }

  const ultimo = quadros[quadros.length - 1];
  entrada.push(ultimo[0]);
  saida.push(ultimo[1]);
  return { entrada, saida };
}

type Propriedade = 'rot' | 'dx' | 'dy' | 'escalaY';

/** Os quadros de uma propriedade, se ela for animada neste movimento. */
function quadrosDe(mov: Movimento | undefined, prop: Propriedade, parar: boolean) {
  const quadros = mov?.quadros?.[prop];
  if (!quadros?.length) return undefined;
  // Congelado (ou quadro único), a peça fica no primeiro valor.
  if (parar || quadros.length < 2) return { fixo: quadros[0][1] };
  return { rampa: rampa(quadros) };
}

/**
 * Uma propriedade em número. `fator` converte unidade do palco em px, e
 * vale 1 para o que já é adimensional (`escalaY`).
 */
function numeroDe(
  mov: Movimento | undefined,
  prop: Propriedade,
  progresso: Animated.Value,
  parar: boolean,
  fator = 1,
): number | Animated.AnimatedInterpolation<number> | undefined {
  const q = quadrosDe(mov, prop, parar);
  if (q?.rampa) {
    return progresso.interpolate({
      inputRange: q.rampa.entrada,
      outputRange: q.rampa.saida.map((v) => v * fator),
    });
  }
  const valor = q?.fixo ?? mov?.pose?.[prop];
  return valor === undefined ? undefined : valor * fator;
}

/** `rot` em graus. A RN só aceita ângulo como string — nunca número. */
function grausDe(
  mov: Movimento | undefined,
  progresso: Animated.Value,
  parar: boolean,
): string | Animated.AnimatedInterpolation<string> | undefined {
  const q = quadrosDe(mov, 'rot', parar);
  if (q?.rampa) {
    return progresso.interpolate({
      inputRange: q.rampa.entrada,
      outputRange: q.rampa.saida.map((v) => `${v}deg`),
    });
  }
  const fixo = q?.fixo ?? mov?.pose?.rot;
  return fixo === undefined ? undefined : `${fixo}deg`;
}

/**
 * Monta a lista de transformações em torno de `deslocamento` — a distância
 * do pivô até o centro da View, já em px.
 *
 * A ordem (girar, depois deslocar, depois esticar) é a mesma do CSS de
 * referência, para as poses baterem com o que foi desenhado lá.
 *
 * `dx`/`dy` vêm da tabela em unidades do palco e são convertidos para px
 * aqui — sem isso o mesmo pulo teria alturas diferentes em cada tamanho.
 * `escalaY` é multiplicador: não escala.
 */
function montarTransformacao(
  mov: Movimento | undefined,
  progresso: Animated.Value,
  parar: boolean,
  deslocamento: { x: number; y: number },
  escala: number,
) {
  const rot = grausDe(mov, progresso, parar);
  const dx = numeroDe(mov, 'dx', progresso, parar, escala);
  const dy = numeroDe(mov, 'dy', progresso, parar, escala);
  const escalaY = numeroDe(mov, 'escalaY', progresso, parar);

  if (rot === undefined && dx === undefined && dy === undefined && escalaY === undefined) {
    return [];
  }

  return [
    { translateX: deslocamento.x },
    { translateY: deslocamento.y },
    ...(rot === undefined ? [] : [{ rotate: rot }]),
    ...(dx === undefined ? [] : [{ translateX: dx }]),
    ...(dy === undefined ? [] : [{ translateY: dy }]),
    ...(escalaY === undefined ? [] : [{ scaleY: escalaY }]),
    { translateX: -deslocamento.x },
    { translateY: -deslocamento.y },
  ];
}

// ---------------------------------------------------------- acessibilidade

/** Segue o "reduzir movimento" do sistema — e o `prefers-reduced-motion` na web. */
function useMovimentoReduzido() {
  const [reduzido, definir] = useState(false);

  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => vivo && definir(v));
    const ouvinte = AccessibilityInfo.addEventListener('reduceMotionChanged', definir);
    return () => {
      vivo = false;
      ouvinte.remove();
    };
  }, [definir]);

  return reduzido;
}
