import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Progresso do convidado, em memória.
 *
 * A regra 5 do CLAUDE.md proíbe storage do navegador na lógica de produção,
 * e a Lição 1 abre sem login — então o que o convidado faz vive aqui até o
 * portão de login migrar tudo para a conta (item 10).
 *
 * Quem está logado também passa por aqui: o que vem do Supabase é somado a
 * este estado, de modo que a trilha reage na hora, sem esperar refetch.
 */
type Estado = {
  /** licaoId -> nota obtida. */
  notas: Record<string, number>;
  concluirLicao: (licaoId: string, nota: number) => void;
  /** Usado na migração de convidado para conta. */
  limpar: () => void;
};

const Contexto = createContext<Estado | null>(null);

export function ProvedorProgresso({ children }: { children: ReactNode }) {
  const [notas, setNotas] = useState<Record<string, number>>({});

  const concluirLicao = useCallback((licaoId: string, nota: number) => {
    setNotas((atual) => {
      // Refazer uma lição só melhora a nota, nunca piora.
      const anterior = atual[licaoId];
      if (anterior !== undefined && anterior >= nota) return atual;
      return { ...atual, [licaoId]: nota };
    });
  }, []);

  const limpar = useCallback(() => setNotas({}), []);

  const valor = useMemo(
    () => ({ notas, concluirLicao, limpar }),
    [notas, concluirLicao, limpar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useProgressoLocal(): Estado {
  const valor = useContext(Contexto);
  if (!valor) {
    throw new Error('useProgressoLocal precisa estar dentro de ProvedorProgresso');
  }
  return valor;
}
