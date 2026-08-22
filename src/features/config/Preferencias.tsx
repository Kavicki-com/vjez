import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Preferências do app. Ficam em memória: a regra 5 do CLAUDE.md proíbe
 * storage do navegador na lógica de produção, então a persistência vem
 * junto com a conta, na tabela de usuário.
 */
type Preferencias = {
  /**
   * Tocar áudio sem o aluno pedir: o do exercício quando ele aparece, e o
   * da forma certa quando a resposta acerta.
   */
  audioAutomatico: boolean;
  /**
   * O tom curto de acerto e o grave de erro ao verificar uma questão.
   *
   * Separado do `audioAutomatico` de propósito: aquele é pronúncia, ou
   * seja, CONTEÚDO — quem estuda no ônibus sem fone desliga o croata em voz
   * alta e ainda quer a confirmação de que acertou.
   */
  efeitosSonoros: boolean;
  /** Lembrete diário da ofensiva. */
  notificacoes: boolean;
};

type Estado = Preferencias & {
  alternar: (chave: keyof Preferencias) => void;
};

const PADRAO: Preferencias = {
  audioAutomatico: true,
  efeitosSonoros: true,
  notificacoes: false,
};

const Contexto = createContext<Estado | null>(null);

export function ProvedorPreferencias({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferencias>(PADRAO);

  const alternar = useCallback((chave: keyof Preferencias) => {
    setPrefs((atual) => ({ ...atual, [chave]: !atual[chave] }));
  }, []);

  const valor = useMemo(() => ({ ...prefs, alternar }), [prefs, alternar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePreferencias(): Estado {
  const valor = useContext(Contexto);
  if (!valor) {
    throw new Error('usePreferencias precisa estar dentro de ProvedorPreferencias');
  }
  return valor;
}
