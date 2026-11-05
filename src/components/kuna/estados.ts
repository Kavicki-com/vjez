/**
 * Os cinco estados do Kuna, em quadros.
 *
 * Um estado escolhe uma **montagem** — um dos bonecos que o artista montou
 * no Figma — e descreve, por junta, uma *pose* (valores fixos) e/ou
 * *quadros* (valores que percorrem um ciclo de `duracao` ms e recomeçam).
 * Nada aqui é código: é tabela. O motor (`Kuna.tsx`) é que lê e move.
 *
 * A DIVISÃO DE TRABALHO é a regra desta tabela: **a pose é desenhada, o
 * movimento é animado**. O braço do aceno está erguido porque existe um
 * desenho dele erguido, não porque alguém girou o braço de baixo 114°. O
 * que sobra para cá é só o vaivém por cima da pose — o aceno balançando, o
 * pulo subindo, o peito respirando. Se uma pose nova precisar de ângulo
 * grande, o lugar de resolver é o Figma, não este arquivo.
 *
 * `rot` em graus, positivo no sentido horário. `dx`/`dy` em unidades do
 * palco. `escalaY` multiplica a altura em torno do pivô.
 *
 * Quadro é `[posição no ciclo de 0 a 1, valor]`. O motor suaviza a
 * passagem entre quadros, então dois quadros já dão um vaivém com peso —
 * não precisa picar o movimento em dez pontos para ele não sair robótico.
 *
 * O CASCATEAMENTO é por junta, não por propriedade: o que o estado diz
 * sobre `calda` substitui o que a base dizia sobre `calda`, inteiro.
 */
import type { NomeDaMontagem, Rosto, Tronco } from './arte';
import { troncoDoRosto, type Aparencia, type Junta } from './pose';

type Propriedade = 'rot' | 'dx' | 'dy' | 'escalaY';
type Quadro = readonly [number, number];

export type Movimento = {
  /** Duração do ciclo em ms. Sem ela, a junta fica parada na pose. */
  duracao?: number;
  pose?: Partial<Record<Propriedade, number>>;
  quadros?: Partial<Record<Propriedade, readonly Quadro[]>>;
};

export type NomeDoEstado =
  | 'parado'
  | 'acena'
  | 'comemora'
  | 'errou'
  | 'espanta'
  | 'resmunga'
  | 'pensa';

type Estado = {
  montagem: NomeDaMontagem;
  rosto: Rosto;
  /**
   * Só quando o estado quiser contrariar o padrão. O tronco segue o rosto
   * sozinho (veja `troncoDoRosto`), e o único motivo para dizer outra coisa
   * é uma pose de olhar por cima do ombro — cabeça virada, corpo de frente.
   */
  tronco?: Tronco;
  juntas: Partial<Record<Junta, Movimento>>;
};

/**
 * O que vale em todo estado que não disser o contrário: o peito subindo e
 * descendo, a cauda no vaivém e a cabeça em cisma. É o que separa um
 * boneco vivo de um decalque.
 *
 * A cauda oscila entre −3° e +5°, nunca mais que isso: ela é comprida e
 * gira pela raiz, então 5° na raiz já viram uns 27 na ponta, que é toda a
 * folga que o palco tem do lado direito. Para o negativo fundo ela também
 * não vai — mora à direita, e girar para dentro faz ela atravessar o corpo.
 */
const BASE: Partial<Record<Junta, Movimento>> = {
  tronco: { duracao: 3600, quadros: { escalaY: [[0, 1], [0.5, 1.022], [1, 1]] } },
  calda: { duracao: 3000, quadros: { rot: [[0, -3], [0.5, 5], [1, -3]] } },
  cabeca: { duracao: 5600, quadros: { rot: [[0, -1.6], [0.5, 1.6], [1, -1.6]] } },
};

const ESTADOS: Record<NomeDoEstado, Estado> = {
  parado: {
    montagem: 'parado',
    rosto: 'front',
    juntas: {},
  },

  /**
   * O aceno é a montagem `waving-zef`: o braço ESQUERDO (o da esquerda de
   * quem olha) já vem desenhado erguido, com a pata aberta na altura da
   * cabeça. Aqui só o balanço.
   *
   * O ângulo é pequeno de propósito. O braço erguido é largo e a mão já
   * está perto da borda esquerda do palco; a partir de uns −8° a pata
   * começa a sair do componente e invadir o layout em volta.
   */
  acena: {
    montagem: 'acena',
    rosto: 'front',
    juntas: {
      'braco-esq': {
        duracao: 620,
        quadros: { rot: [[0, 6], [0.5, -6], [1, 6]] },
      },
      calda: { duracao: 1100, quadros: { rot: [[0, -1], [0.5, 5], [1, -1]] } },
    },
  },

  /**
   * A comemoração é a montagem `celebrating-zef`: os dois braços desenhados
   * para cima e as pernas esticadas, que é o boneco NO AR. O gerador
   * assentou essa montagem pelo chão, então o quadro de baixo do ciclo é o
   * de contato e o pulo sobe a partir dele.
   *
   * O pulo não é simétrico: sobe rápido, quase toca o chão, e dá um segundo
   * pulinho menor. Um seno puro aqui pareceria flutuar, não pular.
   */
  comemora: {
    montagem: 'comemora',
    rosto: 'front',
    juntas: {
      corpo: {
        duracao: 1050,
        quadros: {
          dy: [[0, 0], [0.28, -44], [0.52, -4], [0.72, -23], [1, 0]],
        },
      },
      calda: { duracao: 480, quadros: { rot: [[0, -2], [0.5, 5], [1, -2]] } },
    },
  },

  // Nada de castigo: a cabeça pesa, os braços recolhem, a cauda cai e o
  // respiro fica mais lento. O erro não bloqueia, e o boneco não repreende.
  // Os braços já nascem abertos no montado, então recolher é girar cada um
  // para dentro — sinais opostos.
  //
  // O rosto `triste` é DÓ, não bronca: quem está de cara fechada aqui seria
  // o `bravo`, e ele mora no `resmunga`, que é sobre a conexão e não sobre
  // quem respondeu.
  errou: {
    montagem: 'parado',
    rosto: 'triste',
    juntas: {
      cabeca: {
        duracao: 2800,
        pose: { rot: -5 },
        quadros: { dy: [[0, 7], [0.5, 12], [1, 7]] },
      },
      'braco-esq': { pose: { rot: -12 } },
      'braco-dir': { pose: { rot: 12 } },
      calda: { pose: { rot: 12 } },
      tronco: { duracao: 5000, quadros: { escalaY: [[0, 1], [0.5, 1.022], [1, 1]] } },
    },
  },

  /**
   * O sobressalto de quem não passou por pouco: o corpo dá um pulinho curto
   * no começo do ciclo e volta, os braços abrem um tanto. Não passar é
   * notícia, não bronca — por isso `surpreso` e não `triste`.
   *
   * O pulo é de 10 contra os 44 do `comemora`: ali é festa, aqui é susto.
   */
  espanta: {
    montagem: 'parado',
    rosto: 'surpreso',
    juntas: {
      corpo: {
        duracao: 1600,
        quadros: { dy: [[0, 0], [0.1, -10], [0.26, 0], [1, 0]] },
      },
      'braco-esq': { pose: { rot: 8 } },
      'braco-dir': { pose: { rot: -8 } },
      calda: { duracao: 1000, quadros: { rot: [[0, -3], [0.5, 5], [1, -3]] } },
    },
  },

  /**
   * A cara fechada tem um alvo só: a tela que não carregou. Os braços
   * cruzam para dentro e a cauda bate rápido — é impaciência, e ela é com a
   * conexão, não com quem está estudando.
   */
  resmunga: {
    montagem: 'parado',
    rosto: 'bravo',
    juntas: {
      'braco-esq': { pose: { rot: -16 } },
      'braco-dir': { pose: { rot: 16 } },
      // Metade da duração do vaivém de base: a mesma amplitude, o dobro da
      // impaciência.
      calda: { duracao: 1500, quadros: { rot: [[0, -3], [0.5, 5], [1, -3]] } },
      cabeca: { duracao: 2600, quadros: { rot: [[0, -1.2], [0.5, 1.2], [1, -1.2]] } },
    },
  },

  // De três quartos: o olhar sai da tela, que é o que faz ler como
  // "pensando", mas ele não vira as costas — ainda está meio voltado para
  // você. O perfil fechado era distante demais para o que ele faz aqui.
  //
  // O tronco vem virado junto, por `troncoDoRosto`. Se um dia a ideia for
  // "olhar por cima do ombro", é aqui que entra `tronco: 'tronco'`.
  pensa: {
    montagem: 'parado',
    rosto: 'sideways',
    juntas: {
      cabeca: {
        duracao: 3200,
        quadros: { rot: [[0, -8], [0.5, -12], [1, -8]] },
      },
      'braco-esq': { pose: { rot: 18 } },
      'braco-dir': { pose: { rot: 6 } },
      calda: { duracao: 5200, quadros: { rot: [[0, 0], [0.5, 5], [1, 0]] } },
    },
  },
};

export function estado(nome: NomeDoEstado): Aparencia & {
  juntas: Partial<Record<Junta, Movimento>>;
} {
  const e = ESTADOS[nome];
  return {
    montagem: e.montagem,
    rosto: e.rosto,
    tronco: e.tronco ?? troncoDoRosto(e.rosto),
    juntas: { ...BASE, ...e.juntas },
  };
}
