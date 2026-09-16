import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Kuna } from '@/components/kuna';
import type { NomeDoEstado, Rosto } from '@/components/kuna';
import type { Aparencia } from '@/components/kuna/pose';
import { estado as estadoDe } from '@/components/kuna/estados';
import { ordemDe, palco, pivoDe, rostos, troncoDoRosto } from '@/components/kuna/pose';
import { cores, espaco, familia, raio } from '@/theme/tokens';

const ESTADOS: NomeDoEstado[] = ['parado', 'acena', 'comemora', 'errou', 'pensa'];

const ALTURA = 340;

/** Bancada do personagem: serve para olhar as animações, não é tela do app. */
export default function BancadaDoKuna() {
  const [estado, definirEstado] = useState<NomeDoEstado>('parado');
  const [rostoForcado, forcarRosto] = useState<Rosto | undefined>(undefined);
  const [pivos, mostrarPivos] = useState(false);

  const doEstado = estadoDe(estado);
  const rosto = rostoForcado ?? doEstado.rosto;
  const aparencia: Aparencia = {
    montagem: doEstado.montagem,
    rosto,
    tronco: rostoForcado ? troncoDoRosto(rostoForcado) : doEstado.tronco,
  };

  return (
    <ScrollView contentContainerStyle={styles.pagina}>
      <View style={styles.palco}>
        <View>
          <Kuna
            estado={estado}
            rosto={rostoForcado}
            altura={ALTURA}
            rotuloAcessivel="Kuna, o personagem do Vjez"
          />
          {pivos && <Pivos aparencia={aparencia} altura={ALTURA} />}
        </View>
      </View>

      <Text style={styles.legenda}>
        montagem <Text style={styles.forte}>{aparencia.montagem}</Text> · rosto{' '}
        <Text style={styles.forte}>{aparencia.rosto}</Text> · tronco{' '}
        <Text style={styles.forte}>{aparencia.tronco}</Text>
      </Text>

      <View style={styles.botoes}>
        {ESTADOS.map((nome) => (
          <Pressable
            key={nome}
            onPress={() => definirEstado(nome)}
            style={[styles.botao, estado === nome && styles.botaoAtivo]}
          >
            <Text style={[styles.rotulo, estado === nome && styles.rotuloAtivo]}>{nome}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.titulo}>Rosto</Text>
      <View style={styles.botoes}>
        {(['do estado', ...rostos] as const).map((nome, i) => {
          const valor = i === 0 ? undefined : (nome as Rosto);
          return (
            <Pressable
              key={nome}
              onPress={() => forcarRosto(valor)}
              style={[styles.botao, rostoForcado === valor && styles.botaoAtivo]}
            >
              <Text style={[styles.rotulo, rostoForcado === valor && styles.rotuloAtivo]}>
                {nome}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chave}>
        <Switch value={pivos} onValueChange={mostrarPivos} />
        <Text style={styles.rotulo}>mostrar pivôs</Text>
      </View>

      <Text style={styles.titulo}>Os estados, lado a lado</Text>
      <View style={styles.fileira}>
        {ESTADOS.map((nome) => (
          <View key={nome} style={styles.celula}>
            <Kuna estado={nome} altura={170} />
            <Text style={styles.legenda}>{nome}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.titulo}>Os rostos, no corpo parado — o tronco vira junto</Text>
      <View style={styles.fileira}>
        {rostos.map((nome) => (
          <View key={nome} style={styles.celula}>
            <Kuna estado="parado" rosto={nome} altura={150} congelado />
            <Text style={styles.legenda}>{nome}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/**
 * Os pivôs, por cima do boneco.
 *
 * São os da POSE PARADA do estado: o pulo e as rotações levam a junta
 * junto, e a marca fica onde a peça começou. Serve para conferir se o
 * ombro está no ombro — para isso, olhe o boneco GIRANDO, porque ombro
 * fora do lugar só abre buraco quando o braço sobe.
 */
function Pivos({ aparencia, altura }: { aparencia: Aparencia; altura: number }) {
  const escala = altura / palco.altura;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {ordemDe(aparencia.montagem).map((junta) => {
        const [x, y] = pivoDe(junta, aparencia);
        return (
          <View
            key={junta}
            style={[styles.pivo, { left: x * escala - RAIO, top: y * escala - RAIO }]}
          />
        );
      })}
    </View>
  );
}

const RAIO = 5;

const styles = StyleSheet.create({
  pagina: { padding: espaco.md, gap: espaco.lg, backgroundColor: cores.fundo },
  palco: { alignItems: 'center', justifyContent: 'center' },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm, justifyContent: 'center' },
  botao: {
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.md,
    borderRadius: raio.pill,
    backgroundColor: cores.fundoSuave,
  },
  botaoAtivo: { backgroundColor: cores.primaria },
  chave: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, justifyContent: 'center' },
  rotulo: { fontFamily: familia.forte, color: cores.texto },
  rotuloAtivo: { color: cores.superficie },
  forte: { fontFamily: familia.forte, color: cores.texto },
  titulo: { fontFamily: familia.forte, color: cores.textoSuave, textAlign: 'center' },
  fileira: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.md, justifyContent: 'center' },
  celula: { alignItems: 'center', gap: espaco.xs },
  legenda: {
    fontFamily: familia.normal,
    fontSize: 12,
    color: cores.textoSuave,
    textAlign: 'center',
  },
  pivo: {
    position: 'absolute',
    width: RAIO * 2,
    height: RAIO * 2,
    borderRadius: RAIO,
    borderWidth: 2,
    borderColor: '#D93F3F',
  },
});
