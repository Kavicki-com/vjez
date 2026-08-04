import { Placeholder } from '@/components/Placeholder';

export default function Privacidade() {
  return (
    <Placeholder
      titulo="Privacidade e termos"
      descricao="LGPD: quais dados coletamos, o que vai para o corretor de IA e para o Clarity."
      itens={[
        'Política de privacidade',
        'Termos de uso',
        'Consentimento do Clarity',
        'Envio de texto ao Gemini',
      ]}
    />
  );
}
