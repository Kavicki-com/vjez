import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Sahovnica } from '@/components/Sahovnica';
import { TEXTO_DA_OFENSIVA } from '@/features/ofensiva/regras';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
  tracking,
} from '@/theme/tokens';
import type { Ofensiva } from '@/types/schema';

type Props = {
  nome?: string;
  diasDeOfensiva: number;
  statusDaOfensiva: Ofensiva['status'];
};

/**
 * Saudação da trilha. "Bok" é conteúdo-alvo (fica em HR, regra 1);
 * o resto da interface é PT-BR.
 * A faixa quadriculada no topo é o motivo da bandeira, como nos mockups.
 */
export function CabecalhoTrilha({
  nome,
  diasDeOfensiva,
  statusDaOfensiva,
}: Props) {
  const emRisco = statusDaOfensiva === 'em_recuperacao';
  const apagada = statusDaOfensiva === 'zerada';

  return (
    <View style={styles.cartao}>
      <Sahovnica noTopo />

      <View style={styles.corpo}>
        <View style={styles.texto}>
          <Text style={styles.saudacao}>Bok{nome ? `, ${nome}` : ''}!</Text>
          <Text style={styles.pergunta}>
            {apagada || emRisco
              ? TEXTO_DA_OFENSIVA[statusDaOfensiva]
              : 'Pronto para aprender?'}
          </Text>
        </View>

        <View
          style={[
            styles.ofensiva,
            emRisco && styles.ofensivaEmRisco,
            apagada && styles.ofensivaZerada,
          ]}
        >
          <Ionicons
            name={apagada ? 'flame-outline' : 'flame'}
            size={20}
            color={
              apagada
                ? cores.contorno
                : emRisco
                  ? cores.erro
                  : cores.destaque
            }
          />
          <Text style={[styles.ofensivaNumero, apagada && styles.numeroApagado]}>
            {diasDeOfensiva}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  corpo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.lg,
  },
  texto: { flex: 1, gap: espaco.xs },
  saudacao: {
    fontSize: fonte.titulo,
    lineHeight: linha.titulo,
    letterSpacing: tracking.titulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  pergunta: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
  ofensiva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    paddingHorizontal: espaco.sm + espaco.xs,
    paddingVertical: espaco.sm,
    borderRadius: raio.pill,
    backgroundColor: cores.superficieMedia,
  },
  ofensivaEmRisco: { backgroundColor: cores.erroSuave },
  ofensivaZerada: { backgroundColor: cores.superficieVariante },
  ofensivaNumero: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  numeroApagado: { color: cores.contorno },
});
