export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          email: string
          id: string | null
          senha: string
        }
        Insert: {
          email: string
          id?: string | null
          senha: string
        }
        Update: {
          email?: string
          id?: string | null
          senha?: string
        }
        Relationships: []
      }
      checklist_itens: {
        Row: {
          atividade: string
          checklist_id: number | null
          horario: string | null
          id: number
          periodo: string
          reincidencia: boolean | null
          status: string
        }
        Insert: {
          atividade: string
          checklist_id?: number | null
          horario?: string | null
          id?: number
          periodo: string
          reincidencia?: boolean | null
          status: string
        }
        Update: {
          atividade?: string
          checklist_id?: number | null
          horario?: string | null
          id?: number
          periodo?: string
          reincidencia?: boolean | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_itens_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          colaborador_id: string | null
          data: string
          id: number
          observacoes: string | null
          setor_id: number | null
          unidade: string | null
        }
        Insert: {
          colaborador_id?: string | null
          data: string
          id?: number
          observacoes?: string | null
          setor_id?: number | null
          unidade?: string | null
        }
        Update: {
          colaborador_id?: string | null
          data?: string
          id?: number
          observacoes?: string | null
          setor_id?: number | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklists_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_unidade_fkey"
            columns: ["unidade"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          email: string
          id: string
          nome: string
          unidade: string | null
        }
        Insert: {
          email: string
          id: string
          nome: string
          unidade?: string | null
        }
        Update: {
          email?: string
          id?: string
          nome?: string
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_unidade_fkey"
            columns: ["unidade"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      lojas: {
        Row: {
          id: string
          nome: string
        }
        Insert: {
          id: string
          nome: string
        }
        Update: {
          id?: string
          nome?: string
        }
        Relationships: []
      }
      planos_acao: {
        Row: {
          checklist_id: number
          data_adiamento: string | null
          data_envio: string
          data_recusa: string | null
          descricao: string
          id: number
          resposta_corrigida: string | null
          status: string
        }
        Insert: {
          checklist_id: number
          data_adiamento?: string | null
          data_envio: string
          data_recusa?: string | null
          descricao: string
          id?: number
          resposta_corrigida?: string | null
          status: string
        }
        Update: {
          checklist_id?: number
          data_adiamento?: string | null
          data_envio?: string
          data_recusa?: string | null
          descricao?: string
          id?: number
          resposta_corrigida?: string | null
          status?: string
        }
        Relationships: []
      }
      setores: {
        Row: {
          codigo: string
          id: number
          nome: string
        }
        Insert: {
          codigo: string
          id?: number
          nome: string
        }
        Update: {
          codigo?: string
          id?: number
          nome?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
