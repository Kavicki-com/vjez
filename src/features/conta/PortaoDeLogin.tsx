import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import {
  cores,
  espaco,
  familia,
  fonte,
  raio,
} from '@/theme/tokens';

import { entrarComGoogle } from './api';

type Props = {
  titulo: string;
  explicacao: string;
};

export function PortaoDeLogin({ titulo, explicacao }: Props) {
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  const entrar = async () => {
    setErro(null);
    setEntrando(true);
    try {
      await entrarComGoogle();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para entrar.');
      setEntrando(false);
    }
  };

  return (
    <View style={styles.tela}>
      <View style={styles.cartao}>
        <View style={styles.icone}>
          <Ionicons name="person-circle" size={56} color={cores.primaria} />
        </View>

        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.explicacao}>{explicacao}</Text>

        <View style={styles.botoes}>
          <Botao
            rotulo={entrando ? 'Abrindo...' : 'Entrar com Google'}
            aoTocar={entrar}
            desabilitado={entrando}
          />
          <Botao
            rotulo="Entrar com Apple"
            variante="secundaria"
            desabilitado
            aoTocar={() => {}}
          />
          <Text style={styles.nota}>
            {Platform.OS === 'web'
              ? 'O login com Apple entra quando a conta de desenvolvedor estiver ativa.'
              : 'No celular, o login ainda está sendo configurado.'}
          </Text>
        </View>

        {erro && <Text style={styles.erro}>{erro}</Text>}

        <Text style={styles.rodape}>
          Seu progresso desta sessão é levado para a conta ao entrar.
        </Text>
      </View>
    </View>
  );
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
    maxWidth: 420,
    padding: espaco.lg,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    gap: espaco.sm,
    alignItems: 'center',
  },
  icone: { marginBottom: espaco.xs },
  titulo: {
    fontSize: fonte.titulo,
    fontFamily: familia.forte,
    color: cores.texto,
    textAlign: 'center',
  },
  explicacao: {
    fontSize: fonte.corpo, fontFamily: familia.normal,
    color: cores.textoSuave,
    textAlign: 'center',
  },
  botoes: { width: '100%', gap: espaco.sm, marginTop: espaco.md },
  nota: { fontSize: fonte.pequena, fontFamily: familia.normal, color: cores.textoSuave, textAlign: 'center' },
  erro: { fontSize: fonte.pequena, fontFamily: familia.normal, color: cores.erro, textAlign: 'center' },
  rodape: {
    fontSize: fonte.pequena, fontFamily: familia.normal,
    color: cores.textoSuave,
    textAlign: 'center',
    marginTop: espaco.sm,
  },
});
