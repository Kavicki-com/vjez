/**
 * GERADO — não editar à mão.
 * Reflete o schema do Postgres (projeto cltclnrgtlififwvpfra).
 * Regerar após cada migration com:
 *   npx supabase gen types typescript --project-id cltclnrgtlififwvpfra
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
          pt: string
        }
        Insert: {
          atualizado_em?: string
          audio_url?: string | null
          contexto?: string | null
          criado_em?: string
          hr: string
          id?: string
          pt: string
        }
        Update: {
          atualizado_em?: string
          audio_url?: string | null
          contexto?: string | null
          criado_em?: string
          hr?: string
          id?: string
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
          valor: number
        }
        Insert: {
          atualizado_em?: string
          audio_url?: string | null
          criado_em?: string
          hr: string
          id?: string
          valor: number
        }
        Update: {
          atualizado_em?: string
          audio_url?: string | null
          criado_em?: string
          hr?: string
          id?: string
          valor?: number
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
          pt: string
        }[]
        SetofOptions: {
          from: "*"
          to: "lex_items"
          isOneToOne: false
          isSetofReturn: true
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
