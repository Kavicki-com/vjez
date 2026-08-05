import { StyleSheet, Text, View } from 'react-native';

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
            <Text style={styles.base}>forma base: {exercicio.base_hr}</Text>
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
          <View style={styles.cartaoFrase}>
            <Text style={styles.origemPt}>{exercicio.origem_pt}</Text>
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
