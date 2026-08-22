import { StyleSheet, Text, View } from 'react-native';

import { BotaoFalarTexto } from '@/features/audio/BotaoFalarTexto';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
} from '@/theme/tokens';
import type { Exercicio } from '@/types/schema';

import { EscolherForma } from './EscolherForma';
import { LigarPares } from './LigarPares';
import { MontarFrase } from './MontarFrase';
import { ProducaoLivre } from './ProducaoLivre';
import { RespostaTexto } from './RespostaTexto';
import type { PropsExercicio } from './tipos';

export type { PropsExercicio };

/** Escolhe o template certo para o exercício. */
export function CampoDoExercicio(props: PropsExercicio<Exercicio>) {
  const { exercicio, resposta, aoResponder, travado, acertou } = props;

  switch (exercicio.tipo) {
    case 'escolher_forma':
      return <EscolherForma {...props} exercicio={exercicio} />;

    case 'ligar_pares':
      return <LigarPares {...props} exercicio={exercicio} />;

    case 'montar_frase':
      return <MontarFrase {...props} exercicio={exercicio} />;

    case 'producao_livre':
      return <ProducaoLivre {...props} exercicio={exercicio} />;

    case 'preencher_lacuna':
      return (
        <View style={styles.bloco}>
          <View style={styles.cartaoFrase}>
            <Text style={styles.fraseHr}>{exercicio.frase_hr}</Text>
            <View style={styles.rodapeCartao}>
              <Text style={styles.base}>forma base: {exercicio.base_hr}</Text>
              {/* Fala a forma flexionada — que é a resposta. Entrega o
                  exercício de propósito: fixar a sonoridade da flexão vale
                  mais do que a dificuldade de adivinhá-la, e é justamente a
                  terminação que a lição está ensinando. */}
              <BotaoFalarTexto
                texto={exercicio.resposta}
                rotulo="a palavra que completa a frase"
              />
            </View>
          </View>
          <RespostaTexto
            valor={resposta?.tipo === 'texto' ? resposta.valor : ''}
            aoMudar={(v) => aoResponder({ tipo: 'texto', valor: v })}
            travado={travado}
            acertou={acertou}
            placeholder="Complete a lacuna"
            rotuloAcessivel="Complete a lacuna"
          />
        </View>
      );

    case 'traducao':
      return (
        <View style={styles.bloco}>
          {/* Numa tradução PT→HR, ouvir É o gabarito. Fica assim mesmo: o
              aluno decide se quer ouvir antes ou depois de tentar, e quem
              ouve antes ainda tem de escrever com as letras certas. */}
          <View style={[styles.cartaoFrase, styles.cartaoComBotao]}>
            <Text style={[styles.origemPt, styles.textoQueSobra]}>
              {exercicio.origem_pt}
            </Text>
            <BotaoFalarTexto
              texto={exercicio.respostas_aceitas[0]}
              rotulo="a frase em croata"
            />
          </View>
          <RespostaTexto
            valor={resposta?.tipo === 'texto' ? resposta.valor : ''}
            aoMudar={(v) => aoResponder({ tipo: 'texto', valor: v })}
            travado={travado}
            acertou={acertou}
            placeholder="Escreva em croata"
            rotuloAcessivel="Escreva em croata"
          />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  bloco: { gap: espaco.md },
  rodapeCartao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.sm,
  },
  /** Texto à esquerda, botão de ouvir encostado na direita do cartão. */
  cartaoComBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textoQueSobra: { flex: 1 },
  cartaoFrase: {
    padding: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.fundoSuave,
    gap: espaco.xs,
  },
  fraseHr: { fontSize: fonte.subtitulo, lineHeight: linha.subtitulo, fontFamily: familia.normal, color: cores.texto },
  origemPt: {
    fontSize: fonte.titulo, lineHeight: linha.titulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  base: { fontSize: fonte.pequena, lineHeight: linha.pequena, fontFamily: familia.normal, color: cores.textoSuave },
});
