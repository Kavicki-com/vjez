import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { Carregando } from '@/components/Estados';
import { PortaoDeLogin } from '@/features/conta/PortaoDeLogin';
import { sair } from '@/features/conta/api';
import { useSessao } from '@/features/conta/hooks';
import { usePerfil } from '@/features/perfil/hooks';
import {
  cores,
  espaco,
  fonte,
  larguraMaximaConteudo,
  peso,
  raio,
} from '@/theme/tokens';

export default function Conta() {
  const { carregando, autenticado, sessao } = useSessao();
  const { data: perfil } = usePerfil();
  const [erro, setErro] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  if (carregando) return <Carregando />;

  if (!autenticado) {
    return (
      <PortaoDeLogin
        titulo="Entrar no Vjez"
        explicacao="Sua conta guarda a ofensiva, o XP e por onde você parou."
      />
    );
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.coluna}>
        <View style={styles.cartao}>
          <View style={styles.linha}>
            <Ionicons name="mail" size={22} color={cores.textoSuave} />
            <View style={styles.linhaTexto}>
              <Text style={styles.linhaTitulo}>E-mail</Text>
              <Text style={styles.linhaDetalhe}>
                {sessao?.user.email ?? '—'}
              </Text>
            </View>
          </View>
          <View style={styles.divisor} />
          <View style={styles.linha}>
            <Ionicons name="logo-google" size={22} color={cores.textoSuave} />
            <View style={styles.linhaTexto}>
              <Text style={styles.linhaTitulo}>Entrou com</Text>
              <Text style={styles.linhaDetalhe}>
                {perfil?.provedor === 'apple' ? 'Apple' : 'Google'}
              </Text>
            </View>
          </View>
        </View>

        <Botao rotulo="Sair da conta" variante="secundaria" aoTocar={() => void sair()} />

        <Text style={styles.secao}>Zona de risco</Text>
        <View style={styles.cartaoRisco}>
          <Text style={styles.riscoTitulo}>Excluir minha conta</Text>
          <Text style={styles.riscoTexto}>
            Apaga o perfil, o progresso e os textos que você enviou para
            correção. Não dá para desfazer.
          </Text>

          {confirmandoExclusao ? (
            <View style={styles.confirmacao}>
              <Text style={styles.riscoTexto}>
                A exclusão ainda não está ligada — ela depende da Edge Function
                de exclusão de conta. Enquanto isso, peça por{' '}
                <Text style={styles.destaque}>design@kavicki.com</Text>.
              </Text>
              <Botao
                rotulo="Cancelar"
                variante="secundaria"
                aoTocar={() => setConfirmandoExclusao(false)}
              />
            </View>
          ) : (
            <Botao
              rotulo="Excluir conta"
              variante="secundaria"
              aoTocar={() => setConfirmandoExclusao(true)}
            />
          )}
        </View>

        {erro && <Text style={styles.erro}>{erro}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, alignItems: 'center' },
  coluna: { width: '100%', maxWidth: larguraMaximaConteudo, gap: espaco.md },
  cartao: {
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    overflow: 'hidden',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
  },
  linhaTexto: { flex: 1, gap: 2 },
  linhaTitulo: { fontSize: fonte.corpo, color: cores.texto },
  linhaDetalhe: { fontSize: fonte.pequena, color: cores.textoSuave },
  divisor: { height: 1, backgroundColor: cores.borda, marginLeft: espaco.xxl },
  secao: {
    fontSize: fonte.pequena,
    fontWeight: peso.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: espaco.md,
  },
  cartaoRisco: {
    gap: espaco.sm,
    padding: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.erro,
    backgroundColor: cores.erroSuave,
  },
  riscoTitulo: {
    fontSize: fonte.corpo,
    fontWeight: peso.forte,
    color: cores.erro,
  },
  riscoTexto: { fontSize: fonte.pequena, color: cores.texto },
  destaque: { fontWeight: peso.forte },
  confirmacao: { gap: espaco.sm },
  erro: { fontSize: fonte.pequena, color: cores.erro },
});
