import { Placeholder } from '@/components/Placeholder';

export default function Dicionario() {
  return (
    <Placeholder
      titulo="Dicionário"
      descricao="Camada basal, consultável a qualquer momento."
      itens={[
        'Alfabeto (letra, som em PT, áudio)',
        'Números',
        'Dicionário PT ↔ HR pesquisável',
        'Expressões e frases prontas',
      ]}
    />
  );
}
