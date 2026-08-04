import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Segmentos } from '@/components/Segmentos';
import { ListaAlfabeto } from '@/features/dicionario/ListaAlfabeto';
import { ListaExpressoes } from '@/features/dicionario/ListaExpressoes';
import { ListaNumeros } from '@/features/dicionario/ListaNumeros';
import { ListaPalavras } from '@/features/dicionario/ListaPalavras';
import { cores, espaco, larguraMaximaConteudo } from '@/theme/tokens';

const SECOES = [
  { valor: 'alfabeto', rotulo: 'Alfabeto' },
  { valor: 'numeros', rotulo: 'Números' },
  { valor: 'dicionario', rotulo: 'Dicionário' },
  { valor: 'expressoes', rotulo: 'Expressões' },
] as const;

type Secao = (typeof SECOES)[number]['valor'];

export default function Dicionario() {
  const [secao, setSecao] = useState<Secao>('alfabeto');

  return (
    <View style={styles.tela}>
      <View style={styles.coluna}>
        <Segmentos opcoes={SECOES} selecionado={secao} aoSelecionar={setSecao} />
        {secao === 'alfabeto' && <ListaAlfabeto />}
        {secao === 'numeros' && <ListaNumeros />}
        {secao === 'dicionario' && <ListaPalavras />}
        {secao === 'expressoes' && <ListaExpressoes />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center' },
  coluna: {
    flex: 1,
    width: '100%',
    maxWidth: larguraMaximaConteudo,
    paddingHorizontal: espaco.md,
  },
});
