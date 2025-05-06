
export type UserRole = "admin" | "collaborator";
export type UnidadeType = "Asa Norte" | "Asa Sul" | "Sudoeste" | "Águas Claras";
export type PeriodoType = "manhã" | "tarde" | "noite";

// Database types
export interface DatabaseUser {
  id: string | number; // Updated to accept both string and number
  nome?: string;
  email: string;
  senha?: string; // Made optional since it might be missing in some responses
  unidade?: string;
}

// Adapted application type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
  unidade?: UnidadeType;
  storeIds?: string[]; // For admins who can manage multiple stores
}

export interface Store {
  id: string;
  name: string;
}

export interface ChecklistItem {
  id: string;
  description: string;
  status: "sim" | "nao" | null;
  justification?: string;
  timestamp?: string;
  recurrenceCount: number;
  photoUrl?: string;
  actionPlan?: ActionPlan;
}

export interface Checklist {
  id: string;
  type: ChecklistType;
  date: string;
  storeId: string;
  userId: string;
  userName: string;
  items: ChecklistItem[];
  completed: boolean;
  period?: PeriodoType;
}

// Database checklist model
export interface DatabaseChecklist {
  id: number;
  colaborador_id: string | number; // Updated to accept both string and number
  data: string;
  foto_vistoria1?: string | null;
  foto_vistoria2?: string | null;
  foto_vistoria3?: string | null;
  vistoria1?: any;
  vistoria2?: any;
  vistoria3?: any;
  status_vistoria3?: string;
  reincidencias_vistoria3?: number;
  items?: ChecklistItem[];
  setor_id?: number;
  unidade?: string;
  observacoes?: string;
}

export interface ActionPlan {
  id: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "completed" | "enviado" | "resolvido" | "adiado" | "recusado";
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewComment?: string;
  checklistItemId: string;
  dataAdiamento?: string;
  dataRecusa?: string;
  respostaCorrigida?: string;
}

// Database action plan model
export interface DatabaseActionPlan {
  id: number;
  checklist_id: number;
  descricao: string;
  data_envio: string;
  status: string;
  data_adiamento?: string | null;
  data_recusa?: string | null;
  resposta_corrigida?: string | null;
}

export type ChecklistType = 
  | "reposicao-frente-loja"
  | "estoque-seco"
  | "cozinha-copa"
  | "banheiros"
  | "area-producao"
  | "area-externa"
  | "vistoria1"
  | "vistoria2"
  | "vistoria3";

export interface PendingActionPlan {
  id: string;
  description: string;
  createdAt: string;
  daysPending: number;
  storeId: string;
  storeName: string;
  checklistType: ChecklistType;
  itemDescription: string;
}

// Helper converters to map between database and application models
export const mapDatabaseUserToAppUser = (dbUser: DatabaseUser, role: UserRole = "collaborator"): User => {
  return {
    id: String(dbUser.id),
    name: dbUser.nome || dbUser.email.split('@')[0],
    email: dbUser.email,
    role,
    unidade: dbUser.unidade as UnidadeType | undefined,
    storeId: dbUser.unidade
  };
};

export const mapDatabaseChecklistToAppChecklist = (
  dbChecklist: DatabaseChecklist,
  type: ChecklistType,
  period: PeriodoType = "manhã"
): Checklist => {
  // Extract items from the appropriate vistoria field based on period
  let vistoriaData: any;
  
  if (period === "manhã") vistoriaData = dbChecklist.vistoria1;
  else if (period === "tarde") vistoriaData = dbChecklist.vistoria2;
  else vistoriaData = dbChecklist.vistoria3;
  
  const items: ChecklistItem[] = Array.isArray(vistoriaData) 
    ? vistoriaData.map((item: any) => ({
        id: String(item.id || `${dbChecklist.id}-${Math.random()}`),
        description: item.description || "",
        status: item.status || null,
        justification: item.justification,
        timestamp: item.timestamp,
        recurrenceCount: item.recurrenceCount || 0,
        photoUrl: getPeriodPhotoUrl(dbChecklist, period),
        actionPlan: item.actionPlan
      }))
    : [];
  
  return {
    id: String(dbChecklist.id),
    type,
    date: dbChecklist.data,
    storeId: String(dbChecklist.colaborador_id), // Using colaborador_id as storeId
    userId: String(dbChecklist.colaborador_id),
    userName: "Colaborador", // This would need to be fetched separately
    items,
    completed: Boolean(period === "noite" ? dbChecklist.status_vistoria3 === "completed" : false), // Assume completed only if vistoria3 is completed
    period
  };
};

// Helper function to get photo URL based on period
function getPeriodPhotoUrl(dbChecklist: DatabaseChecklist, period: PeriodoType): string | undefined {
  if (period === "manhã") return dbChecklist.foto_vistoria1 || undefined;
  if (period === "tarde") return dbChecklist.foto_vistoria2 || undefined;
  return dbChecklist.foto_vistoria3 || undefined;
}
