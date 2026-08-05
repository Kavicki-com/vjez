import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  cores,
  espaco,
  familia,
  fonte,
  larguraMaximaConteudo,
  linha,
  raio,
} from '@/theme/tokens';

/**
 * Aviso de privacidade. O texto está aqui, e não no banco, porque é
 * documento legal do app — não é conteúdo de curadoria.
 * Revisão jurídica pendente antes de publicar nas lojas.
 */
export default function Privacidade() {
  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.coluna}>
        <View style={styles.aviso}>
          <Text style={styles.avisoTexto}>
            Rascunho. Este texto ainda precisa de revisão jurídica antes de o
            Vjez ir para as lojas.
          </Text>
        </View>

        <Bloco titulo="O que guardamos">
          <Item>Seu nome e e-mail, vindos do Google ou da Apple ao entrar.</Item>
          <Item>
            Sua foto de perfil <Negrito>não é guardada</Negrito>: ela é lida
            direto da sua conta Google a cada sessão e só aparece na tela.
          </Item>
          <Item>
            Seu progresso: lições concluídas, notas, acertos e erros por
            exercício.
          </Item>
          <Item>Os textos em croata que você escreve nos exercícios livres.</Item>
        </Bloco>

        <Bloco titulo="Para que usamos">
          <Item>
            Mostrar sua trilha, sua ofensiva e montar os checkpoints — que
            priorizam justamente os exercícios em que você errou.
          </Item>
          <Item>
            Entender onde o app confunde as pessoas, para melhorar o conteúdo.
          </Item>
        </Bloco>

        <Bloco titulo="Com quem compartilhamos">
          <Item>
            <Negrito>Google Gemini</Negrito>: recebe o texto dos exercícios de
            produção livre para gerar a correção. Não enviamos seu nome nem seu
            e-mail junto.
          </Item>
          <Item>
            <Negrito>Microsoft Clarity</Negrito>: análise de uso do app. Pedimos
            seu consentimento antes de ativar.
          </Item>
          <Item>
            <Negrito>Supabase</Negrito>: onde os dados ficam hospedados.
          </Item>
        </Bloco>

        <Bloco titulo="Seus direitos (LGPD)">
          <Item>
            Ver, corrigir ou apagar seus dados. A exclusão da conta remove
            perfil, progresso e textos enviados.
          </Item>
          <Item>
            Retirar o consentimento do Clarity a qualquer momento, em
            Configurações.
          </Item>
          <Item>
            Falar com a gente:{' '}
            <Negrito>design@kavicki.com</Negrito>
          </Item>
        </Bloco>

        <Bloco titulo="Menores de idade">
          <Item>
            O Vjez não é destinado a menores de 13 anos e não coleta dados
            dessa faixa de forma intencional.
          </Item>
        </Bloco>
      </View>
    </ScrollView>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.bloco}>
      <Text style={styles.blocoTitulo}>{titulo}</Text>
      <View style={styles.blocoCorpo}>{children}</View>
    </View>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.item}>
      <View style={styles.marcador} />
      <Text style={styles.itemTexto}>{children}</Text>
    </View>
  );
}

function Negrito({ children }: { children: React.ReactNode }) {
  return <Text style={styles.negrito}>{children}</Text>;
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, alignItems: 'center' },
  coluna: { width: '100%', maxWidth: larguraMaximaConteudo, gap: espaco.md },
  aviso: {
    padding: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.primariaSuave,
    borderWidth: 1,
    borderColor: cores.primaria,
  },
  avisoTexto: { fontSize: fonte.pequena, lineHeight: linha.pequena, fontFamily: familia.normal, color: cores.primaria },
  bloco: {
    padding: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    gap: espaco.sm,
  },
  blocoTitulo: {
    fontSize: fonte.subtitulo, lineHeight: linha.subtitulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  blocoCorpo: { gap: espaco.sm },
  item: { flexDirection: 'row', gap: espaco.sm },
  marcador: {
    width: 6,
    height: 6,
    borderRadius: raio.pill,
    backgroundColor: cores.primaria,
    marginTop: 7,
  },
  itemTexto: { flex: 1, fontSize: fonte.corpo, fontFamily: familia.normal, color: cores.texto, lineHeight: 22 },
  negrito: { fontFamily: familia.forte },
});
