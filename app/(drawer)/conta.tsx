import { Placeholder } from '@/components/Placeholder';

export default function Conta() {
  return (
    <Placeholder
      titulo="Conta"
      descricao="Entrar, sair e migrar progresso de convidado para conta."
      itens={[
        'Entrar com Google',
        'Entrar com Apple',
        'Migrar progresso do convidado',
        'Excluir conta',
      ]}
    />
  );
}
