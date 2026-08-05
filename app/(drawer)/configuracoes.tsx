import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { usePreferencias } from '@/features/config/Preferencias';
import {
  cores,
  espaco,
  familia,
  fonte,
  larguraMaximaConteudo,
  linha,
  raio,
} from '@/theme/tokens';

export default function Configuracoes() {
  const { audioAutomatico, notificacoes, alternar } = usePreferencias();

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.coluna}>
        <Text style={styles.secao}>Idioma</Text>
        <View style={styles.cartao}>
          <Linha
            icone="language"
            titulo="Interface"
            detalhe="Português do Brasil"
          />
          <Divisor />
          <Linha
            icone="school"
            titulo="Idioma que você aprende"
            detalhe="Croata"
          />
        </View>

        <Text style={styles.secao}>Áudio</Text>
        <View style={styles.cartao}>
          <Linha
            icone="volume-high"
            titulo="Tocar áudio automaticamente"
            detalhe="Reproduz a pronúncia assim que o exercício abre"
            controle={
              <Switch
                value={audioAutomatico}
                onValueChange={() => alternar('audioAutomatico')}
                trackColor={{ true: cores.primaria, false: cores.borda }}
                accessibilityLabel="Tocar áudio automaticamente"
              />
            }
          />
        </View>

        <Text style={styles.secao}>Notificações</Text>
        <View style={styles.cartao}>
          <Linha
            icone="notifications"
            titulo="Lembrete diário"
            detalhe="Avisa antes de a ofensiva zerar"
            controle={
              <Switch
                value={notificacoes}
                onValueChange={() => alternar('notificacoes')}
                trackColor={{ true: cores.primaria, false: cores.borda }}
                accessibilityLabel="Lembrete diário"
              />
            }
          />
        </View>

        <Text style={styles.nota}>
          As preferências valem para esta sessão. Elas passam a acompanhar você
          entre aparelhos quando estiverem ligadas à sua conta.
        </Text>

        <Text style={styles.secao}>Sobre</Text>
        <View style={styles.cartao}>
          <Linha
            icone="information-circle"
            titulo="Versão"
            detalhe={Constants.expoConfig?.version ?? '1.0.0'}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function Linha({
  icone,
  titulo,
  detalhe,
  controle,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  detalhe?: string;
  controle?: React.ReactNode;
}) {
  return (
    <View style={styles.linha}>
      <Ionicons name={icone} size={22} color={cores.textoSuave} />
      <View style={styles.linhaTexto}>
        <Text style={styles.linhaTitulo}>{titulo}</Text>
        {detalhe && <Text style={styles.linhaDetalhe}>{detalhe}</Text>}
      </View>
      {controle}
    </View>
  );
}

function Divisor() {
  return <View style={styles.divisor} />;
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, alignItems: 'center' },
  coluna: { width: '100%', maxWidth: larguraMaximaConteudo, gap: espaco.sm },
  secao: {
    fontSize: fonte.pequena, lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: espaco.md,
  },
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
  linhaTitulo: { fontSize: fonte.corpo, lineHeight: linha.corpo, fontFamily: familia.normal, color: cores.texto },
  linhaDetalhe: { fontSize: fonte.pequena, lineHeight: linha.pequena, fontFamily: familia.normal, color: cores.textoSuave },
  divisor: { height: 1, backgroundColor: cores.borda, marginLeft: espaco.xxl },
  nota: {
    fontSize: fonte.pequena, lineHeight: linha.pequena, fontFamily: familia.normal,
    color: cores.textoSuave,
    marginTop: espaco.sm,
  },
});
