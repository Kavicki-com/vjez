import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

/**
 * Áudio indexado por texto croata.
 *
 * Carregado inteiro de uma vez e guardado por uma hora: são poucas dezenas
 * de linhas, e uma consulta por exercício custaria mais do que a tabela
 * toda. O mapa deixa qualquer string croata da tela virar som por busca
 * direta, sem o exercício precisar carregar URL nenhuma.
 */
export function useAudioDeTexto() {
  return useQuery({
    queryKey: ['audio-hr'],
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audio_hr')
        .select('texto, audio_url');
      if (error) throw error;
      return new Map(data.map((linha) => [linha.texto, linha.audio_url]));
    },
  });
}
