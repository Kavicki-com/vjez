import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { Carregando } from '@/components/Estados';
import { useEhCurador } from '@/features/admin/hooks';
import { PortaoDeLogin } from '@/features/conta/PortaoDeLogin';
import { useSessao } from '@/features/conta/hooks';
import { voltarPara } from '@/lib/navegacao';
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
 * Portão do CMS.
 *
 * Três estados, nesta ordem: sem sessão → login; com sessão e sem papel →
 * recado; curador → o CMS.
 *
 * Este portão é CORTESIA, não segurança. Quem impede a escrita de verdade
 * é a RLS do Postgres: as policies de conteúdo chamam `e_curador()`, e um
 * aluno que chegasse aqui por URL veria as telas e tomaria erro em cada
 * gravação. O papel vem da lista `curadores_autorizados`, aplicada pelo
 * trigger no primeiro login — não há como se promover pelo app.
 */
export default function LayoutDoCms() {
  const { sessao, carregando } = useSessao();
  const { ehCurador, carregando: carregandoPapel } = useEhCurador();

  if (carregando || (sessao && carregandoPapel)) return <Carregando />;

  if (!sessao) {
    return (
      <PortaoDeLogin
        titulo="Área da curadoria"
        explicacao="Entre com a conta que tem permissão para editar o conteúdo do Vjež."
      />
    );
  }

  if (!ehCurador) {
    return (
      <View style={styles.tela}>
        <View style={styles.cartao}>
          <Ionicons name="lock-closed" size={44} color={cores.contorno} />
          <Text style={styles.titulo}>Área da curadoria</Text>
          <Text style={styles.texto}>
            Esta parte do Vjež é de quem cadastra o conteúdo. Sua conta está
            como aluno — o que é a coisa certa para estudar.
          </Text>
          <View style={styles.saida}>
            <Botao
              rotulo="Voltar para a trilha"
              variante="secundaria"
              aoTocar={() => voltarPara('/')}
            />
          </View>
        </View>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaco.md,
  },
  cartao: {
    width: '100%',
    maxWidth: larguraMaximaConteudo / 2,
    alignItems: 'center',
    gap: espaco.sm,
    padding: espaco.lg,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  titulo: {
    fontSize: fonte.titulo,
    lineHeight: linha.titulo,
    fontFamily: familia.forte,
    color: cores.texto,
    textAlign: 'center',
  },
  texto: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    textAlign: 'center',
  },
  saida: { alignSelf: 'stretch', marginTop: espaco.md },
});
