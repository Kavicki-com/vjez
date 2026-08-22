/**
 * Vjez — landing: parallax, revelação e contadores.
 *
 * Três regras que guiam o arquivo inteiro:
 *
 * 1. O JS não escreve `transform`. Ele escreve variáveis CSS (`--y`,
 *    `--saida`) e o CSS decide o que fazer com elas. Assim dá para mudar o
 *    efeito sem tocar aqui, e `prefers-reduced-motion` desliga tudo no CSS.
 *
 * 2. Nada de medir dentro do laço. `getBoundingClientRect()` força
 *    layout; chamado a cada quadro para cada camada, engasga o scroll. As
 *    posições são medidas uma vez e refeitas só quando o layout muda.
 *
 * 3. Só um `requestAnimationFrame` para a página toda, agendado pelo
 *    scroll. Um laço solto rodando 60 vezes por segundo em página parada
 *    é bateria jogada fora.
 */

(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Para onde vão os "Comece agora"
     ------------------------------------------------------------------ */

  /**
   * Em produção o app fica em `/app` no mesmo domínio — é o que está escrito
   * no `href` de cada CTA, e é o que vale se o JS não rodar. Em
   * desenvolvimento ele vive noutra porta (`expo start --web` sobe na 8081),
   * então aqui os links são reapontados.
   *
   * Se o app for publicado em domínio próprio, troque `PRODUCAO` — é o
   * único lugar.
   */
  const APP = {
    PRODUCAO: '/app/',
    DESENVOLVIMENTO: 'http://localhost:8081',
  };

  const emDesenvolvimento =
    location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  if (emDesenvolvimento) {
    for (const cta of document.querySelectorAll('[data-cta]')) {
      cta.href = APP.DESENVOLVIMENTO;
    }
  }

  const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------
     Camadas de parallax
     ------------------------------------------------------------------ */

  /**
   * Cada camada anda em relação à *cena* que a contém — o elemento
   * `[data-cena]` mais próximo. Camadas da mesma cena compartilham o
   * progresso e se separam só pela velocidade, que é o que dá profundidade.
   * Sem cena por perto (as ilustrações do método, por exemplo), a
   * referência é o próprio pai: aí cada peça flutua por conta própria
   * quando passa pela tela.
   */
  const camadas = [...document.querySelectorAll('[data-parallax]')].map((el) => ({
    el,
    velocidade: Number(el.dataset.parallax) || 0,
    referencia: el.closest('[data-cena]') || el.parentElement,
    topo: 0,
    altura: 0,
    ultimo: null,
  }));

  const heroi = document.querySelector('[data-heroi]');

  let alturaTela = 0;

  /** Mede tudo de uma vez. Só roda fora do laço de animação. */
  function medir() {
    alturaTela = window.innerHeight;
    const rolagem = window.scrollY;

    for (const camada of camadas) {
      const caixa = camada.referencia.getBoundingClientRect();
      camada.topo = caixa.top + rolagem;
      camada.altura = caixa.height;
    }
  }

  /**
   * Amplitude cheia só quando há espaço. Em tela estreita o mesmo
   * deslocamento em pixels come uma fatia grande da tela e o efeito vira
   * tranco em vez de profundidade.
   */
  function fator() {
    return window.innerWidth < 720 ? 0.55 : 1;
  }

  function desenhar() {
    const rolagem = window.scrollY;
    const centroTela = rolagem + alturaTela / 2;
    const escala = fator();

    for (const camada of camadas) {
      const { topo, altura } = camada;

      // Fora da tela (com uma folga de meia tela) não vale gastar quadro.
      if (topo + altura < rolagem - alturaTela / 2) continue;
      if (topo > rolagem + alturaTela * 1.5) continue;

      // -1 quando a cena está entrando por baixo, 0 no centro da tela,
      // +1 quando já saiu por cima.
      const centroCena = topo + altura / 2;
      const bruto = (centroTela - centroCena) / (alturaTela / 2 + altura / 2);
      const progresso = Math.max(-1, Math.min(1, bruto));

      const y = Math.round(progresso * camada.velocidade * escala * 10) / 10;
      // Escrever a mesma variável de novo suja o estilo à toa.
      if (y !== camada.ultimo) {
        camada.el.style.setProperty('--y', `${y}px`);
        camada.ultimo = y;
      }
    }

    if (heroi) {
      // 0 no topo da página, 1 quando o herói terminou de sair.
      const saida = Math.min(1, Math.max(0, rolagem / (heroi.offsetHeight || 1)));
      heroi.style.setProperty('--saida', saida.toFixed(4));
    }
  }

  /* ------------------------------------------------------------------
     Agendamento
     ------------------------------------------------------------------ */

  let agendado = false;

  function agendar() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => {
      agendado = false;
      desenhar();
    });
  }

  function ligar() {
    medir();
    desenhar();
    window.addEventListener('scroll', agendar, { passive: true });
  }

  function desligar() {
    window.removeEventListener('scroll', agendar);
    for (const camada of camadas) {
      camada.el.style.removeProperty('--y');
      camada.ultimo = null;
    }
    heroi?.style.removeProperty('--saida');
  }

  if (!menosMovimento.matches) ligar();

  // A preferência pode mudar com a página aberta (trocar o ajuste do SO).
  menosMovimento.addEventListener('change', (e) => {
    if (e.matches) desligar();
    else ligar();
  });

  // Remedir: o layout muda com rotação de tela, chegada das fontes e das
  // imagens `lazy`. Observar o body cobre os três sem inventar evento.
  const aoMudarLayout = () => {
    if (menosMovimento.matches) return;
    medir();
    agendar();
  };

  window.addEventListener('resize', aoMudarLayout, { passive: true });
  window.addEventListener('load', aoMudarLayout);
  document.fonts?.ready.then(aoMudarLayout);
  new ResizeObserver(aoMudarLayout).observe(document.body);

  /* ------------------------------------------------------------------
     Revelação ao entrar na tela
     ------------------------------------------------------------------ */

  const revelaveis = document.querySelectorAll('[data-revela]');

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('visivel');
        contar(entrada.target);
        // Revelação é de mão única: some da lista assim que apareceu.
        observador.unobserve(entrada.target);
      }
    },
    // A margem negativa segura a entrada até o bloco estar de fato à vista,
    // em vez de disparar com um fio dele na borda da tela.
    { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
  );

  for (const el of revelaveis) observador.observe(el);

  /* ------------------------------------------------------------------
     Contadores
     ------------------------------------------------------------------ */

  const DURACAO = 900;

  /** Conta de 0 até o valor de `data-conta` quando o bloco aparece. */
  function contar(bloco) {
    const alvo = bloco.querySelector('[data-conta]');
    if (!alvo) return;

    const destino = Number(alvo.dataset.conta);
    if (!Number.isFinite(destino) || destino === 0) return;
    if (menosMovimento.matches) return;

    const inicio = performance.now();

    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / DURACAO);
      // easeOutCubic: começa rápido e assenta — número que desacelera lê
      // melhor do que número em velocidade constante.
      const suave = 1 - Math.pow(1 - t, 3);
      alvo.textContent = String(Math.round(destino * suave));
      if (t < 1) requestAnimationFrame(passo);
    };

    alvo.textContent = '0';
    requestAnimationFrame(passo);
  }

  /* ------------------------------------------------------------------
     Cabeçalho
     ------------------------------------------------------------------ */

  // Enquanto a sentinela (a primeira meia tela) estiver visível, o topo fica
  // de vidro sobre a bandeira. Depois vira barra sólida. Sai mais barato que
  // ouvir scroll só para comparar um número.
  const sentinela = document.querySelector('.sentinela');
  const topo = document.querySelector('.topo');

  if (sentinela && topo) {
    new IntersectionObserver(([entrada]) => {
      topo.classList.toggle('topo--solido', !entrada.isIntersecting);
    }).observe(sentinela);
  }
})();
