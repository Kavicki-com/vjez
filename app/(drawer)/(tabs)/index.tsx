import { Placeholder } from '@/components/Placeholder';

export default function Inicio() {
  return (
    <Placeholder
      titulo="Trilha de aprendizado"
      descricao="Aqui entram os módulos, as lições e a ofensiva. Conteúdo vem do Supabase."
      itens={[
        'Trilha de módulos → lições',
        'Ofensiva (dias seguidos)',
        'Checkpoint no fim de cada módulo',
      ]}
    />
  );
}
