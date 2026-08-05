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
  /**
   * exercicioId -> resultado da última tentativa. Alimenta o checkpoint e,
   * na migração, vira linha em tentativas_exercicio — que exige o módulo,
   * por isso ele viaja junto.
   */
  tentativas: Record<string, { acertou: boolean; moduloId: string }>;
  /** moduloId -> passou no checkpoint. */
  checkpoints: Record<string, boolean>;
  concluirLicao: (licaoId: string, nota: number) => void;
  registrarTentativa: (
    exercicioId: string,
    acertou: boolean,
    moduloId: string,
  ) => void;
  concluirCheckpoint: (moduloId: string, passou: boolean) => void;
  /** Há algo do convidado para levar para a conta? */
  temProgresso: boolean;
  /** Usado na migração de convidado para conta. */
  limpar: () => void;
};

const Contexto = createContext<Estado | null>(null);

export function ProvedorProgresso({ children }: { children: ReactNode }) {
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [tentativas, setTentativas] = useState<
    Record<string, { acertou: boolean; moduloId: string }>
  >({});
  const [checkpoints, setCheckpoints] = useState<Record<string, boolean>>({});

  const concluirLicao = useCallback((licaoId: string, nota: number) => {
    setNotas((atual) => {
      // Refazer uma lição só melhora a nota, nunca piora.
      const anterior = atual[licaoId];
      if (anterior !== undefined && anterior >= nota) return atual;
      return { ...atual, [licaoId]: nota };
    });
  }, []);

  const registrarTentativa = useCallback(
    (exercicioId: string, acertou: boolean, moduloId: string) => {
      // Guarda só o último resultado: acertar depois de errar tira o
      // exercício da fila de prioridade do checkpoint.
      setTentativas((atual) => ({
        ...atual,
        [exercicioId]: { acertou, moduloId },
      }));
    },
    [],
  );

  const concluirCheckpoint = useCallback((moduloId: string, passou: boolean) => {
    // Reprovar não apaga uma aprovação anterior.
    setCheckpoints((atual) =>
      atual[moduloId] ? atual : { ...atual, [moduloId]: passou },
    );
  }, []);

  const limpar = useCallback(() => {
    setNotas({});
    setTentativas({});
    setCheckpoints({});
  }, []);

  const temProgresso =
    Object.keys(notas).length > 0 ||
    Object.keys(tentativas).length > 0 ||
    Object.keys(checkpoints).length > 0;

  const valor = useMemo(
    () => ({
      notas,
      tentativas,
      checkpoints,
      temProgresso,
      concluirLicao,
      registrarTentativa,
      concluirCheckpoint,
      limpar,
    }),
    [
      notas,
      tentativas,
      checkpoints,
      temProgresso,
      concluirLicao,
      registrarTentativa,
      concluirCheckpoint,
      limpar,
    ],
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
