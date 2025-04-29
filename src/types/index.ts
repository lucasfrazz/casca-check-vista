
export type UserRole = "admin" | "collaborator";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
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
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewComment?: string;
  checklistItemId: string;
}

export type ChecklistType = 
  | "reposicao-frente-loja"
  | "estoque-seco"
  | "cozinha-copa"
  | "banheiros"
  | "area-producao"
  | "area-externa";

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
