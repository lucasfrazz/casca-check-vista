
import { 
  DatabaseUser, 
  DatabaseChecklist,
  User,
  Checklist,
  ActionPlan,
  ChecklistType,
  PeriodoType,
  ChecklistItem,
  UserRole
} from "@/types";

// Convert database user to app user
export function mapDatabaseUserToAppUser(dbUser: DatabaseUser, role: UserRole = "collaborator"): User {
  return {
    id: String(dbUser.id),
    name: dbUser.nome || dbUser.email.split('@')[0],
    email: dbUser.email,
    role,
    unidade: dbUser.unidade as any,
    storeId: String(dbUser.id)
  };
}

// Convert database checklist to app checklist
export function mapDatabaseChecklistToAppChecklist(
  dbChecklist: DatabaseChecklist,
  type: ChecklistType,
  period: PeriodoType = "manhã"
): Checklist {
  // Extract items from the appropriate vistoria field based on period
  let vistoriaData: any;
  
  if (period === "manhã") vistoriaData = dbChecklist.vistoria1;
  else if (period === "tarde") vistoriaData = dbChecklist.vistoria2;
  else vistoriaData = dbChecklist.vistoria3;
  
  const items: ChecklistItem[] = Array.isArray(vistoriaData) 
    ? vistoriaData.map((item: any, index: number) => ({
        id: String(item.id || `${dbChecklist.id}-${index}`),
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
    storeId: String(dbChecklist.colaborador_id),
    userId: String(dbChecklist.colaborador_id),
    userName: "Colaborador", // This would need to be fetched separately
    items,
    completed: Boolean(period === "noite" ? dbChecklist.status_vistoria3 === "completed" : false),
    period
  };
}

// Helper function to get photo URL based on period
function getPeriodPhotoUrl(dbChecklist: DatabaseChecklist, period: PeriodoType): string | undefined {
  if (period === "manhã") return dbChecklist.foto_vistoria1 || undefined;
  if (period === "tarde") return dbChecklist.foto_vistoria2 || undefined;
  return dbChecklist.foto_vistoria3 || undefined;
}

// Convert database action plan to app action plan
export function mapDatabaseActionPlanToAppActionPlan(
  dbActionPlan: any,
  userId: string,
  userName: string
): ActionPlan {
  return {
    id: String(dbActionPlan.id),
    description: dbActionPlan.descricao,
    status: dbActionPlan.status,
    createdAt: dbActionPlan.data_envio,
    updatedAt: dbActionPlan.data_envio,
    userId,
    userName,
    checklistItemId: String(dbActionPlan.checklist_id),
    dataAdiamento: dbActionPlan.data_adiamento,
    dataRecusa: dbActionPlan.data_recusa,
    respostaCorrigida: dbActionPlan.resposta_corrigida
  };
}
