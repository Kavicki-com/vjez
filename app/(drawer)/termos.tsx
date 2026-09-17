import {
  Documento,
  Item,
  Negrito,
  P,
  Rodape,
  Secao,
} from '@/features/legal/Documento';
import { RESPONSAVEL } from '@/features/legal/responsavel';

/**
 * Termos de Uso.
 *
 * Rota própria porque as lojas pedem URL separada da política de privacidade,
 * e porque um documento que fala de regra de uso não deveria estar escondido
 * dentro da tela que fala de dado pessoal — que era o estado anterior: o menu
 * dizia "Privacidade e termos" e os termos não existiam.
 */
export default function Termos() {
  return (
    <Documento
      titulo="Termos de Uso"
      resumo="As regras de uso do Vjez: o que oferecemos, o que esperamos de você e até onde vai a nossa responsabilidade."
    >
      <Secao numero={1} titulo="Quem oferece o Vjez">
        <P>
          O Vjez é um aplicativo para brasileiros aprenderem croata, oferecido
          por <Negrito>{RESPONSAVEL.razaoSocial}</Negrito>, CNPJ{' '}
          {RESPONSAVEL.cnpj}, com sede em {RESPONSAVEL.endereco}. Contato:{' '}
          <Negrito>{RESPONSAVEL.email}</Negrito>.
        </P>
      </Secao>

      <Secao numero={2} titulo="Ao usar, você aceita">
        <P>
          Usar o Vjez — inclusive a primeira lição, que abre sem conta —
          significa concordar com estes Termos e com a Política de Privacidade.
          Se você não concorda com alguma parte, não use o app.
        </P>
      </Secao>

      <Secao numero={3} titulo="Quem pode usar">
        <P>
          O Vjez é para maiores de 13 anos. Entre 13 e 18, o uso deve ser de
          conhecimento do responsável legal, que responde pelo aceite destes
          Termos.
        </P>
      </Secao>

      <Secao numero={4} titulo="O que o Vjez é — e o que não é">
        <Item>
          É um curso informal de croata, com conteúdo escrito e revisado por
          quem conhece a língua.
        </Item>
        <Item>
          Não é ensino formal, não emite certificado, não vale como comprovação
          de proficiência e não substitui aula com professor.
        </Item>
        <Item>
          O conteúdo pode conter erro ou simplificação didática. Corrigimos
          quando alguém aponta — escreva para {RESPONSAVEL.email}.
        </Item>
      </Secao>

      <Secao numero={5} titulo="Conta, convidado e acesso">
        <Item>
          A primeira lição abre sem conta. Depois dela, é preciso entrar para
          continuar.
        </Item>
        <Item>
          Hoje a entrada é pela sua conta <Negrito>Google</Negrito>. Não criamos
          senha e não guardamos a sua.
        </Item>
        <Item>
          O progresso feito como convidado vive na sessão e migra para a conta
          quando você entra. Se você fechar o app antes de entrar, ele se perde.
        </Item>
        <Item>
          Cuidar do acesso à sua conta Google é com você. Se suspeitar de uso
          indevido, avise em {RESPONSAVEL.email}.
        </Item>
        <Item>
          Uma conta é de uma pessoa. Não a compartilhe nem a venda.
        </Item>
      </Secao>

      <Secao numero={6} titulo="Preço">
        <P>
          O Vjez é gratuito, sem anúncios e sem compras dentro do app. Se um dia
          houver parte paga, ela será anunciada com antecedência e o que você já
          tinha de graça não vira cobrança retroativa.
        </P>
      </Secao>

      <Secao numero={7} titulo="Correção automática dos textos livres">
        <Item>
          Nos exercícios de escrita você envia até{' '}
          <Negrito>400 caracteres</Negrito>, e um sistema de inteligência
          artificial devolve o texto corrigido e um comentário em português.
        </Item>
        <Item>
          A correção é <Negrito>automática e pode errar</Negrito>. Use-a como
          estudo, não como verdade final. Se discordar, peça revisão humana em{' '}
          {RESPONSAVEL.email}.
        </Item>
        <Item>
          Para conter custo e abuso, há teto diário de correções por conta e no
          total do app. Atingido o teto, a correção volta no dia seguinte — o
          seu texto continua salvo.
        </Item>
        <Item>
          A correção é só para quem está com conta; como convidado, o exercício
          pontua mas não é corrigido.
        </Item>
        <Item>
          <Negrito>Não escreva dado pessoal seu ou de terceiros</Negrito> nesses
          textos — o conteúdo é enviado a um serviço de IA de terceiro para ser
          corrigido, como explica a Política de Privacidade.
        </Item>
      </Secao>

      <Secao numero={8} titulo="Uso aceitável">
        <P>Ao usar o Vjez, você concorda em não:</P>
        <Item>
          usar o corretor para outra coisa que não corrigir o exercício — ele
          não é assistente de uso geral;
        </Item>
        <Item>
          tentar burlar os limites de uso, criar contas em série ou automatizar
          acesso (robô, raspagem, ataque de carga);
        </Item>
        <Item>
          tentar acessar dado de outra pessoa, conta administrativa ou parte não
          pública do sistema;
        </Item>
        <Item>
          enviar conteúdo ilegal, ofensivo, discriminatório ou que viole direito
          de terceiro;
        </Item>
        <Item>
          copiar, redistribuir ou revender o conteúdo do app (lições,
          ilustrações, áudios) fora do seu estudo pessoal;
        </Item>
        <Item>
          fazer engenharia reversa do app ou tentar extrair chaves e credenciais.
        </Item>
      </Secao>

      <Secao numero={9} titulo="O que é seu e o que é nosso">
        <P>
          <Negrito>Seu:</Negrito> os textos que você escreve continuam seus.
          Você nos autoriza a armazená-los e processá-los para corrigi-los,
          revisá-los e mostrar o resultado a você — e, de forma anônima e
          agregada (sem nome, e-mail ou qualquer coisa que identifique você), a
          usá-los para entender onde o conteúdo confunde e melhorá-lo. Essa
          autorização acaba quando você exclui a conta.
        </P>
        <P>
          <Negrito>Nosso:</Negrito> o nome Vjez, a identidade visual, as
          ilustrações, os áudios, o texto das lições e o código são protegidos
          por direito autoral e de marca. Você tem licença pessoal,
          intransferível e não comercial de usá-los dentro do app.
        </P>
      </Secao>

      <Secao numero={10} titulo="Disponibilidade e mudanças no app">
        <P>
          O Vjez está em desenvolvimento e é oferecido “como está”. Não
          prometemos disponibilidade ininterrupta: pode haver manutenção, falha
          de provedor e indisponibilidade do corretor de IA.
        </P>
        <P>
          Podemos mudar, acrescentar ou encerrar funcionalidades. Se formos
          encerrar o serviço por completo, avisaremos com antecedência razoável
          e daremos tempo para você exportar seus dados.
        </P>
      </Secao>

      <Secao numero={11} titulo="Suspensão e encerramento">
        <P>
          Você pode sair quando quiser e pedir a exclusão da conta (veja a seção
          11 da Política de Privacidade).
        </P>
        <P>
          Podemos suspender ou encerrar o acesso de quem descumprir a seção 8,
          na medida do necessário e, sempre que possível, com aviso prévio.
        </P>
      </Secao>

      <Secao numero={12} titulo="Responsabilidade">
        <P>
          Respondemos pelos danos que causarmos por falha do serviço, nos
          limites da lei brasileira. Não respondemos por indisponibilidade de
          serviços de terceiros (Google, provedor de nuvem, sua operadora), por
          uso da sua conta por alguém a quem você deu acesso, nem por decisões
          que você tome com base numa correção automática.
        </P>
        <P>
          Nada nestes Termos afasta os direitos que o Código de Defesa do
          Consumidor garante a você.
        </P>
      </Secao>

      <Secao numero={13} titulo="Mudanças nestes Termos">
        <P>
          Quando o texto mudar, a data no topo muda junto. Mudança relevante é
          avisada dentro do app antes de valer; continuar usando depois do aviso
          significa aceitar a nova versão.
        </P>
      </Secao>

      <Secao numero={14} titulo="Lei aplicável e foro">
        <P>
          Estes Termos seguem a lei brasileira. Fica eleito o foro do domicílio
          do consumidor para resolver o que não se resolver por acordo — e o
          acordo é o que a gente prefere: escreva para {RESPONSAVEL.email}.
        </P>
      </Secao>

      <Rodape href="/privacidade" rotulo="Ler a Política de Privacidade →" />
    </Documento>
  );
}
