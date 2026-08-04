import { Placeholder } from '@/components/Placeholder';

export default function Configuracoes() {
  return (
    <Placeholder
      titulo="Configurações"
      descricao="Preferências do app."
      itens={['Idioma da interface', 'Áudio', 'Notificações']}
    />
  );
}
