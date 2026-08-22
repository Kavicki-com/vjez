/**
 * GERADO — não editar à mão.
 * Reflete o schema do Postgres (projeto cltclnrgtlififwvpfra).
 * Regerar após cada migration com:
 *   npx supabase gen types typescript --project-id cltclnrgtlififwvpfra
 *
 * Esse comando exige `npx supabase login` (interativo, uma vez por
 * máquina). Sem a sessão ele devolve `Unauthorized` e o arquivo aqui
 * envelhece em silêncio — o typecheck passa mesmo com colunas faltando,
 * e o erro só aparece quando alguém tenta ler uma delas. Foi o que
 * aconteceu até 2026-08-22: faltavam `usuarios.papel`, `audio_ajustes`,
 * `criar_licao` e `e_curador`.
 *
 * Formas de domínio (camelCase, do CLAUDE.md) vivem em ./schema.ts;
 * a tradução entre os dois está em @/lib/mapeadores.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      atividades: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          licao_id: string
          ordem: number
          tipo: Database["public"]["Enums"]["tipo_atividade"]
          titulo_pt: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          licao_id: string
          ordem: number
          tipo: Database["public"]["Enums"]["tipo_atividade"]
          titulo_pt: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          licao_id?: string
          ordem?: number
          tipo?: Database["public"]["Enums"]["tipo_atividade"]
          titulo_pt?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_licao_id_fkey"
            columns: ["licao_id"]
            isOneToOne: false
            referencedRelation: "licoes"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_ajustes: {
        Row: {
          criado_em: string
          motivo: string | null
          texto: string
          texto_falado: string
        }
        Insert: {
          criado_em?: string
          motivo?: string | null
          texto: string
          texto_falado: string
        }
        Update: {
          criado_em?: string
          motivo?: string | null
          texto?: string
          texto_falado?: string
        }
        Relationships: []
      }
      audio_hr: {
        Row: {
          atualizado_em: string
          audio_url: string
          criado_em: string
          id: string
          texto: string
        }
        Insert: {
          atualizado_em?: string
          audio_url: string
          criado_em?: string
          id?: string
          texto: string
        }
        Update: {
          atualizado_em?: string
          audio_url?: string
          criado_em?: string
          id?: string
          texto?: string
        }
        Relationships: []
      }
      checkpoints: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          modulo_id: string
          nota_minima: number
          tamanho: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          modulo_id: string
          nota_minima?: number
          tamanho: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          modulo_id?: string
          nota_minima?: number
          tamanho?: number
        }
        Relationships: [
          {
            foreignKeyName: "checkpoints_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: true
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      curadores_autorizados: {
        Row: {
          criado_em: string
          email: string
          nota: string | null
          papel: Database["public"]["Enums"]["papel"]
        }
        Insert: {
          criado_em?: string
          email: string
          nota?: string | null
          papel?: Database["public"]["Enums"]["papel"]
        }
        Update: {
          criado_em?: string
          email?: string
          nota?: string | null
          papel?: Database["public"]["Enums"]["papel"]
        }
        Relationships: []
      }
      exercicios: {
        Row: {
          atividade_id: string
          atualizado_em: string
          audio_url: string | null
          criado_em: string
          dados: Json
          dica_pt: string | null
          enunciado_pt: string
          id: string
          ordem: number
          padez: Database["public"]["Enums"]["padez"] | null
          peso: number
          publicado: boolean
          tipo: Database["public"]["Enums"]["tipo_exercicio"]
        }
        Insert: {
          atividade_id: string
          atualizado_em?: string
          audio_url?: string | null
          criado_em?: string
          dados?: Json
          dica_pt?: string | null
          enunciado_pt: string
          id?: string
          ordem: number
          padez?: Database["public"]["Enums"]["padez"] | null
          peso: number
          publicado?: boolean
          tipo: Database["public"]["Enums"]["tipo_exercicio"]
        }
        Update: {
          atividade_id?: string
          atualizado_em?: string
          audio_url?: string | null
          criado_em?: string
          dados?: Json
          dica_pt?: string | null
          enunciado_pt?: string
          id?: string
          ordem?: number
          padez?: Database["public"]["Enums"]["padez"] | null
          peso?: number
          publicado?: boolean
          tipo?: Database["public"]["Enums"]["tipo_exercicio"]
        }
        Relationships: [
          {
            foreignKeyName: "exercicios_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
        ]
      }
      frases: {
        Row: {
          atualizado_em: string
          audio_url: string | null
          contexto: string | null
          criado_em: string
          hr: string
          id: string
          pronuncia_pt: string | null
          pt: string
        }
        Insert: {
          atualizado_em?: string
          audio_url?: string | null
          contexto?: string | null
          criado_em?: string
          hr: string
          id?: string
          pronuncia_pt?: string | null
          pt: string
        }
        Update: {
          atualizado_em?: string
          audio_url?: string | null
          contexto?: string | null
          criado_em?: string
          hr?: string
          id?: string
          pronuncia_pt?: string | null
          pt?: string
        }
        Relationships: []
      }
      letras: {
        Row: {
          atualizado_em: string
          audio_url: string | null
          criado_em: string
          exemplo_hr: string | null
          id: string
          letra: string
          ordem: number
          som_pt: string
        }
        Insert: {
          atualizado_em?: string
          audio_url?: string | null
          criado_em?: string
          exemplo_hr?: string | null
          id?: string
          letra: string
          ordem: number
          som_pt: string
        }
        Update: {
          atualizado_em?: string
          audio_url?: string | null
          criado_em?: string
          exemplo_hr?: string | null
          id?: string
          letra?: string
          ordem?: number
          som_pt?: string
        }
        Relationships: []
      }
      lex_items: {
        Row: {
          atualizado_em: string
          audio_url: string | null
          categoria: string
          criado_em: string
          genero: Database["public"]["Enums"]["genero_gramatical"] | null
          hr: string
          id: string
          nota_pt: string | null
          pronuncia_pt: string | null
          pt: string
        }
        Insert: {
          atualizado_em?: string
          audio_url?: string | null
          categoria: string
          criado_em?: string
          genero?: Database["public"]["Enums"]["genero_gramatical"] | null
          hr: string
          id?: string
          nota_pt?: string | null
          pronuncia_pt?: string | null
          pt: string
        }
        Update: {
          atualizado_em?: string
          audio_url?: string | null
          categoria?: string
          criado_em?: string
          genero?: Database["public"]["Enums"]["genero_gramatical"] | null
          hr?: string
          id?: string
          nota_pt?: string | null
          pronuncia_pt?: string | null
          pt?: string
        }
        Relationships: []
      }
      licoes: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          ilustracao: string | null
          intro_pt: string | null
          modulo_id: string
          ordem: number
          titulo_pt: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          ilustracao?: string | null
          intro_pt?: string | null
          modulo_id: string
          ordem: number
          titulo_pt: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          ilustracao?: string | null
          intro_pt?: string | null
          modulo_id?: string
          ordem?: number
          titulo_pt?: string
        }
        Relationships: [
          {
            foreignKeyName: "licoes_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos: {
        Row: {
          atualizado_em: string
          bloqueado_por: string | null
          criado_em: string
          fase: Database["public"]["Enums"]["fase"]
          icone: string | null
          id: string
          nivel: Database["public"]["Enums"]["nivel"]
          ordem: number
          padez: Database["public"]["Enums"]["padez"] | null
          tema_pt: string
        }
        Insert: {
          atualizado_em?: string
          bloqueado_por?: string | null
          criado_em?: string
          fase: Database["public"]["Enums"]["fase"]
          icone?: string | null
          id?: string
          nivel: Database["public"]["Enums"]["nivel"]
          ordem: number
          padez?: Database["public"]["Enums"]["padez"] | null
          tema_pt: string
        }
        Update: {
          atualizado_em?: string
          bloqueado_por?: string | null
          criado_em?: string
          fase?: Database["public"]["Enums"]["fase"]
          icone?: string | null
          id?: string
          nivel?: Database["public"]["Enums"]["nivel"]
          ordem?: number
          padez?: Database["public"]["Enums"]["padez"] | null
          tema_pt?: string
        }
        Relationships: [
          {
            foreignKeyName: "modulos_bloqueado_por_fkey"
            columns: ["bloqueado_por"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      numeros: {
        Row: {
          atualizado_em: string
          audio_url: string | null
          criado_em: string
          hr: string
          id: string
          pronuncia_pt: string | null
          valor: number
        }
        Insert: {
          atualizado_em?: string
          audio_url?: string | null
          criado_em?: string
          hr: string
          id?: string
          pronuncia_pt?: string | null
          valor: number
        }
        Update: {
          atualizado_em?: string
          audio_url?: string | null
          criado_em?: string
          hr?: string
          id?: string
          pronuncia_pt?: string | null
          valor?: number
        }
        Relationships: []
      }
      padez_terminacoes: {
        Row: {
          atualizado_em: string
          criado_em: string
          exemplos_hr: string[]
          genero: Database["public"]["Enums"]["genero_gramatical"]
          id: string
          padez: Database["public"]["Enums"]["padez"]
          plural: boolean
          terminacao: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          exemplos_hr: string[]
          genero: Database["public"]["Enums"]["genero_gramatical"]
          id?: string
          padez: Database["public"]["Enums"]["padez"]
          plural: boolean
          terminacao: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          exemplos_hr?: string[]
          genero?: Database["public"]["Enums"]["genero_gramatical"]
          id?: string
          padez?: Database["public"]["Enums"]["padez"]
          plural?: boolean
          terminacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "padez_terminacoes_padez_fkey"
            columns: ["padez"]
            isOneToOne: false
            referencedRelation: "padezi"
            referencedColumns: ["padez"]
          },
        ]
      }
      padezi: {
        Row: {
          atualizado_em: string
          criado_em: string
          exemplo_hr: string
          exemplo_pt: string
          id: string
          nota_pt: string | null
          numero: number
          padez: Database["public"]["Enums"]["padez"]
          pergunta_hr: string
          pergunta_pt: string
          preposicoes_hr: string[]
          uso_pt: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          exemplo_hr: string
          exemplo_pt: string
          id?: string
          nota_pt?: string | null
          numero: number
          padez: Database["public"]["Enums"]["padez"]
          pergunta_hr: string
          pergunta_pt: string
          preposicoes_hr?: string[]
          uso_pt: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          exemplo_hr?: string
          exemplo_pt?: string
          id?: string
          nota_pt?: string | null
          numero?: number
          padez?: Database["public"]["Enums"]["padez"]
          pergunta_hr?: string
          pergunta_pt?: string
          preposicoes_hr?: string[]
          uso_pt?: string
        }
        Relationships: []
      }
      progresso_licao: {
        Row: {
          concluida: boolean
          data: string
          licao_id: string
          nota: number
          usuario_id: string
        }
        Insert: {
          concluida?: boolean
          data?: string
          licao_id: string
          nota: number
          usuario_id: string
        }
        Update: {
          concluida?: boolean
          data?: string
          licao_id?: string
          nota?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_licao_licao_id_fkey"
            columns: ["licao_id"]
            isOneToOne: false
            referencedRelation: "licoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_licao_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_modulo: {
        Row: {
          atualizado_em: string
          checkpoint_passado: boolean
          desbloqueado: boolean
          modulo_id: string
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string
          checkpoint_passado?: boolean
          desbloqueado?: boolean
          modulo_id: string
          usuario_id: string
        }
        Update: {
          atualizado_em?: string
          checkpoint_passado?: boolean
          desbloqueado?: boolean
          modulo_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_modulo_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_modulo_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      revisoes_gerais: {
        Row: {
          apos_modulo_ordem: number
          atualizado_em: string
          criado_em: string
          id: string
          tamanho: number
        }
        Insert: {
          apos_modulo_ordem: number
          atualizado_em?: string
          criado_em?: string
          id?: string
          tamanho: number
        }
        Update: {
          apos_modulo_ordem?: number
          atualizado_em?: string
          criado_em?: string
          id?: string
          tamanho?: number
        }
        Relationships: []
      }
      submissoes_livres: {
        Row: {
          atualizado_em: string
          correcao_ia: Json | null
          correcao_nativo: Json | null
          criado_em: string
          exercicio_id: string
          id: string
          status: Database["public"]["Enums"]["status_submissao"]
          texto_hr: string
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string
          correcao_ia?: Json | null
          correcao_nativo?: Json | null
          criado_em?: string
          exercicio_id: string
          id?: string
          status?: Database["public"]["Enums"]["status_submissao"]
          texto_hr: string
          usuario_id: string
        }
        Update: {
          atualizado_em?: string
          correcao_ia?: Json | null
          correcao_nativo?: Json | null
          criado_em?: string
          exercicio_id?: string
          id?: string
          status?: Database["public"]["Enums"]["status_submissao"]
          texto_hr?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissoes_livres_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissoes_livres_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tentativas_exercicio: {
        Row: {
          acertou: boolean
          data: string
          exercicio_id: string
          id: string
          modulo_id: string
          tentativas: number
          usuario_id: string
        }
        Insert: {
          acertou: boolean
          data?: string
          exercicio_id: string
          id?: string
          modulo_id: string
          tentativas?: number
          usuario_id: string
        }
        Update: {
          acertou?: boolean
          data?: string
          exercicio_id?: string
          id?: string
          modulo_id?: string
          tentativas?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tentativas_exercicio_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tentativas_exercicio_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tentativas_exercicio_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          atualizado_em: string
          criado_em: string
          estado: Database["public"]["Enums"]["estado_conta"]
          id: string
          nivel: Database["public"]["Enums"]["nivel"]
          nome: string | null
          ofensiva_dias_seguidos: number
          ofensiva_status: Database["public"]["Enums"]["status_ofensiva"]
          ofensiva_ultimo_dia_ativo: string | null
          papel: Database["public"]["Enums"]["papel"]
          provedor: Database["public"]["Enums"]["provedor"] | null
          xp: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          estado?: Database["public"]["Enums"]["estado_conta"]
          id: string
          nivel?: Database["public"]["Enums"]["nivel"]
          nome?: string | null
          ofensiva_dias_seguidos?: number
          ofensiva_status?: Database["public"]["Enums"]["status_ofensiva"]
          ofensiva_ultimo_dia_ativo?: string | null
          papel?: Database["public"]["Enums"]["papel"]
          provedor?: Database["public"]["Enums"]["provedor"] | null
          xp?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          estado?: Database["public"]["Enums"]["estado_conta"]
          id?: string
          nivel?: Database["public"]["Enums"]["nivel"]
          nome?: string | null
          ofensiva_dias_seguidos?: number
          ofensiva_status?: Database["public"]["Enums"]["status_ofensiva"]
          ofensiva_ultimo_dia_ativo?: string | null
          papel?: Database["public"]["Enums"]["papel"]
          provedor?: Database["public"]["Enums"]["provedor"] | null
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_lex_items: {
        Args: { termo: string }
        Returns: {
          atualizado_em: string
          audio_url: string | null
          categoria: string
          criado_em: string
          genero: Database["public"]["Enums"]["genero_gramatical"] | null
          hr: string
          id: string
          nota_pt: string | null
          pronuncia_pt: string | null
          pt: string
        }[]
        SetofOptions: {
          from: "*"
          to: "lex_items"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      criar_licao: {
        Args: {
          p_atividades: Json
          p_modulo_ordem: number
          p_ordem: number
          p_titulo: string
        }
        Returns: string
      }
      e_curador: { Args: never; Returns: boolean }
      migrar_progresso: {
        Args: {
          dia_local?: string
          licoes?: Json
          modulos?: Json
          tentativas?: Json
        }
        Returns: undefined
      }
      registrar_dia_ativo: {
        Args: { dia_local: string }
        Returns: {
          atualizado_em: string
          criado_em: string
          estado: Database["public"]["Enums"]["estado_conta"]
          id: string
          nivel: Database["public"]["Enums"]["nivel"]
          nome: string | null
          ofensiva_dias_seguidos: number
          ofensiva_status: Database["public"]["Enums"]["status_ofensiva"]
          ofensiva_ultimo_dia_ativo: string | null
          papel: Database["public"]["Enums"]["papel"]
          provedor: Database["public"]["Enums"]["provedor"] | null
          xp: number
        }
        SetofOptions: {
          from: "*"
          to: "usuarios"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      estado_conta: "convidado" | "autenticado"
      fase: "demo" | "paralelo" | "evolucao"
      genero_gramatical: "m" | "f" | "n"
      nivel: "basico" | "intermediario" | "avancado"
      padez:
        | "nominativ"
        | "genitiv"
        | "dativ"
        | "akuzativ"
        | "vokativ"
        | "lokativ"
        | "instrumental"
      papel: "aluno" | "curador" | "admin"
      provedor: "google" | "apple"
      status_ofensiva: "ativa" | "em_recuperacao" | "zerada"
      status_submissao:
        | "aguardando"
        | "corrigida_ia"
        | "revisada_nativo"
        | "falha"
      tipo_atividade: "transformacao" | "traducao" | "producao_livre"
      tipo_exercicio:
        | "preencher_lacuna"
        | "escolher_forma"
        | "montar_frase"
        | "ligar_pares"
        | "traducao"
        | "producao_livre"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_conta: ["convidado", "autenticado"],
      fase: ["demo", "paralelo", "evolucao"],
      genero_gramatical: ["m", "f", "n"],
      nivel: ["basico", "intermediario", "avancado"],
      padez: [
        "nominativ",
        "genitiv",
        "dativ",
        "akuzativ",
        "vokativ",
        "lokativ",
        "instrumental",
      ],
      papel: ["aluno", "curador", "admin"],
      provedor: ["google", "apple"],
      status_ofensiva: ["ativa", "em_recuperacao", "zerada"],
      status_submissao: [
        "aguardando",
        "corrigida_ia",
        "revisada_nativo",
        "falha",
      ],
      tipo_atividade: ["transformacao", "traducao", "producao_livre"],
      tipo_exercicio: [
        "preencher_lacuna",
        "escolher_forma",
        "montar_frase",
        "ligar_pares",
        "traducao",
        "producao_livre",
      ],
    },
  },
} as const
