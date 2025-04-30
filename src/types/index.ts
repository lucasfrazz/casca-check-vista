
export type UserRole = "admin" | "collaborator";
export type UnidadeType = "Asa Norte" | "Asa Sul" | "Sudoeste" | "Águas Claras";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
  unidade?: UnidadeType;
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
