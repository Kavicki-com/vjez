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
 * Política de Privacidade.
 *
 * O texto está no código, e não no banco, porque é documento legal do app —
 * não é conteúdo de curadoria. Rota própria (e não uma aba dentro de outra
 * tela) porque as lojas pedem uma URL só para a política de privacidade.
 *
 * REGRA DE OURO desta tela: ela descreve o que o app FAZ HOJE. Se alguma
 * funcionalidade descrita aqui mudar — Clarity entrar, exclusão de conta
 * virar botão, Apple passar a funcionar —, o texto muda no mesmo commit.
 */
export default function Privacidade() {
  return (
    <Documento
      titulo="Política de Privacidade"
      resumo="O que o Vjez guarda sobre você, por quê, com quem divide e como você manda apagar."
    >
      <Secao numero={1} titulo="Quem trata seus dados">
        <P>
          O Vjez é operado por <Negrito>{RESPONSAVEL.razaoSocial}</Negrito>,
          inscrita no CNPJ {RESPONSAVEL.cnpj}, com sede em{' '}
          {RESPONSAVEL.endereco}. Somos o controlador dos dados pessoais
          tratados no app, nos termos da Lei nº 13.709/2018 (LGPD).
        </P>
        <P>
          Para qualquer assunto de privacidade — inclusive exercer os direitos
          da seção 9 — escreva para{' '}
          <Negrito>{RESPONSAVEL.email}</Negrito>.
        </P>
      </Secao>

      <Secao numero={2} titulo="O que guardamos">
        <Item>
          <Negrito>Conta:</Negrito> seu nome e seu e-mail, como o Google os
          envia quando você entra, mais o identificador que o login gera e qual
          provedor você usou.
        </Item>
        <Item>
          <Negrito>Progresso:</Negrito> a nota de cada lição concluída, cada
          tentativa de exercício (se você acertou, quantas vezes tentou e
          quando), os módulos desbloqueados, os checkpoints passados, o XP e a
          ofensiva (dias seguidos e último dia em que você estudou).
        </Item>
        <Item>
          <Negrito>Textos de produção livre:</Negrito> o que você escreve em
          croata nos exercícios de escrita (até 400 caracteres por envio) e a
          correção que volta.
        </Item>
        <Item>
          <Negrito>Registros técnicos:</Negrito> nosso provedor de
          infraestrutura registra os acessos ao servidor (endereço IP, data,
          hora e tipo de pedido) por alguns dias. Usamos isso só para
          diagnosticar erro e abuso.
        </Item>
      </Secao>

      <Secao numero={3} titulo="O que não guardamos">
        <Item>
          <Negrito>Sua senha.</Negrito> Quem autentica é o Google; sua senha
          nunca passa pelo Vjez.
        </Item>
        <Item>
          <Negrito>Sua foto de perfil.</Negrito> Ela é lida da sua conta Google
          a cada sessão e só aparece na tela. Não existe cópia no nosso banco.
        </Item>
        <Item>
          <Negrito>Dado de pagamento.</Negrito> O app é gratuito e não tem
          compra dentro dele.
        </Item>
        <Item>
          <Negrito>Localização, contatos, agenda, microfone ou câmera.</Negrito>{' '}
          O Vjez não pede nenhuma dessas permissões.
        </Item>
        <Item>
          <Negrito>Dado sensível.</Negrito> Não pedimos saúde, religião,
          opinião política, biometria nem nada do gênero — e você não deve
          escrevê-los nos exercícios de produção livre.
        </Item>
      </Secao>

      <Secao numero={4} titulo="Se você usa sem conta">
        <P>
          A primeira lição abre sem login. Enquanto você está como convidado, o
          progresso vive na memória do app: ele não vai para o nosso banco e
          some quando você fecha o app.
        </P>
        <P>
          A única exceção é o instante do login na web: para o progresso não se
          perder quando o navegador sai para o Google e volta, o app guarda a
          nota e as tentativas daquela sessão no armazenamento temporário da
          aba e apaga assim que o servidor confirma a migração. Esse dado morre
          com a aba.
        </P>
      </Secao>

      <Secao numero={5} titulo="Para que usamos, e com que base legal">
        <Item>
          <Negrito>Fazer o app funcionar</Negrito> — mostrar sua trilha, somar
          XP, contar a ofensiva e montar os checkpoints, que priorizam
          justamente os exercícios em que você errou. Base legal:{' '}
          <Negrito>execução de contrato</Negrito> (art. 7º, V, da LGPD).
        </Item>
        <Item>
          <Negrito>Corrigir seus textos</Negrito> de produção livre. Base legal:{' '}
          <Negrito>execução de contrato</Negrito>.
        </Item>
        <Item>
          <Negrito>Melhorar o conteúdo</Negrito> — olhar, de forma agregada,
          onde a maioria erra, para reescrever explicação e exercício. Base
          legal: <Negrito>legítimo interesse</Negrito> (art. 7º, IX).
        </Item>
        <Item>
          <Negrito>Segurança</Negrito> — evitar abuso do corretor automático e
          investigar erro. Base legal: <Negrito>legítimo interesse</Negrito>.
        </Item>
        <P>
          Não usamos seus dados para publicidade e não vendemos dado pessoal a
          ninguém.
        </P>
      </Secao>

      <Secao numero={6} titulo="Com quem compartilhamos">
        <Item>
          <Negrito>Google (login):</Negrito> é quem confirma quem você é e nos
          devolve nome e e-mail. O que você faz dentro do Vjez não volta para o
          Google.
        </Item>
        <Item>
          <Negrito>Google Gemini (correção):</Negrito> recebe o texto que você
          escreveu no exercício, junto com o enunciado e o caso gramatical
          treinado. <Negrito>Não enviamos seu nome, seu e-mail nem o
          identificador da sua conta.</Negrito> O Google processa esse texto em
          servidores fora do Brasil — é uma transferência internacional de
          dados (art. 33 da LGPD), feita para prestar o serviço que você pediu
          ao apertar “corrigir”.
        </Item>
        <Item>
          <Negrito>Supabase (hospedagem):</Negrito> guarda o banco de dados e os
          arquivos de áudio, em servidores na região de São Paulo.
        </Item>
        <Item>
          <Negrito>Autoridades</Negrito>, quando houver ordem judicial ou
          obrigação legal.
        </Item>
        <P>
          <Negrito>Hoje o Vjez não usa nenhuma ferramenta de análise de
          uso</Negrito> — nem Microsoft Clarity, nem Google Analytics, nem
          cookie de publicidade. Se um dia passarmos a usar, pediremos seu
          consentimento antes de ativar, e esta política será atualizada.
        </P>
      </Secao>

      <Secao numero={7} titulo="Quem consegue ler seus textos">
        <P>
          As regras do banco deixam cada pessoa ler apenas o próprio progresso e
          os próprios textos: nenhum aluno enxerga o que outro escreveu.
        </P>
        <P>
          Do nosso lado, quem mantém o app tem acesso administrativo ao banco e
          pode ler uma submissão para revisar a correção da IA ou investigar uma
          falha. Fazemos isso só quando é necessário para o serviço.
        </P>
      </Secao>

      <Secao numero={8} titulo="Correção automática e revisão humana">
        <P>
          A correção dos exercícios de escrita é gerada por inteligência
          artificial. Ela é sugestão de estudo — não produz efeito jurídico nem
          decide nada sobre você — e pode errar.
        </P>
        <P>
          Se discordar de uma correção, você pode pedir revisão humana pelo{' '}
          <Negrito>{RESPONSAVEL.email}</Negrito>.
        </P>
      </Secao>

      <Secao numero={9} titulo="Por quanto tempo guardamos">
        <Item>
          Conta, progresso e textos ficam enquanto sua conta existir. É o que
          permite retomar de onde você parou.
        </Item>
        <Item>
          Pedida a exclusão, apagamos em até 30 dias, inclusive dos backups na
          rotação seguinte.
        </Item>
        <Item>
          Registros técnicos do servidor ficam por alguns dias e se apagam
          sozinhos.
        </Item>
        <Item>
          Podemos guardar por mais tempo o que a lei exigir, e nesse caso só
          para cumprir a exigência.
        </Item>
      </Secao>

      <Secao numero={10} titulo="Seus direitos (LGPD, art. 18)">
        <P>Você pode, a qualquer momento, pedir:</P>
        <Item>confirmação de que tratamos dados seus e acesso a eles;</Item>
        <Item>correção de dado incompleto, inexato ou desatualizado;</Item>
        <Item>
          anonimização, bloqueio ou eliminação de dado desnecessário ou
          excessivo;
        </Item>
        <Item>
          portabilidade dos seus dados para outro fornecedor, em formato legível
          por máquina;
        </Item>
        <Item>eliminação dos dados tratados com base no seu consentimento;</Item>
        <Item>
          informação sobre com quem compartilhamos seus dados e sobre a
          possibilidade de não consentir;
        </Item>
        <Item>
          revogação do consentimento, quando o tratamento se apoiar nele;
        </Item>
        <Item>
          oposição a tratamento feito com base em legítimo interesse.
        </Item>
        <P>
          Escreva para <Negrito>{RESPONSAVEL.email}</Negrito> do e-mail
          cadastrado na sua conta. Respondemos em até 15 dias. Você também pode
          reclamar à ANPD (gov.br/anpd).
        </P>
      </Secao>

      <Secao numero={11} titulo="Como excluir sua conta">
        <P>
          A exclusão apaga o perfil, o progresso e os textos que você enviou
          para correção. Não dá para desfazer.
        </P>
        <P>
          <Negrito>Hoje o pedido é por e-mail:</Negrito> escreva para{' '}
          {RESPONSAVEL.email} do endereço cadastrado, com o assunto “excluir
          minha conta”. Confirmamos e apagamos em até 30 dias. A tela{' '}
          <Negrito>Conta</Negrito> mostra esse mesmo caminho enquanto o botão de
          exclusão dentro do app não estiver no ar.
        </P>
      </Secao>

      <Secao numero={12} titulo="Como protegemos">
        <Item>
          Tudo trafega por conexão cifrada (HTTPS) entre o app e o servidor.
        </Item>
        <Item>
          O banco tem regra de acesso por linha: o servidor recusa a leitura do
          dado de outra pessoa mesmo que alguém peça direto pela API.
        </Item>
        <Item>
          A chave do corretor de IA vive só no servidor, nunca no app — e há
          teto diário de uso por conta e no total, para conter abuso.
        </Item>
        <P>
          Nenhum sistema é infalível. Se acontecer incidente que possa gerar
          risco relevante para você, avisaremos você e a ANPD, como manda o art.
          48 da LGPD.
        </P>
      </Secao>

      <Secao numero={13} titulo="Crianças e adolescentes">
        <P>
          O Vjez é para maiores de 13 anos e não coleta dados de crianças
          menores de 13 de forma intencional. Se descobrirmos que uma conta é de
          alguém abaixo dessa idade, apagamos os dados. Se você é responsável e
          acha que isso aconteceu, escreva para {RESPONSAVEL.email}.
        </P>
        <P>
          Entre 13 e 18 anos, o uso deve ser de conhecimento do responsável
          legal.
        </P>
      </Secao>

      <Secao numero={14} titulo="Mudanças nesta política">
        <P>
          Quando o texto mudar, a data no topo muda junto. Se a mudança for
          relevante — dado novo, finalidade nova, parceiro novo —, avisamos
          dentro do app antes de ela valer.
        </P>
      </Secao>

      <Rodape href="/termos" rotulo="Ler os Termos de Uso →" />
    </Documento>
  );
}
