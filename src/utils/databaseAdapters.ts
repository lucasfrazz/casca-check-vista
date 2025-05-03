
import { DatabaseUser, DatabaseChecklist, DatabaseActionPlan, User, Checklist, ActionPlan, ChecklistType, PeriodoType } from "@/types";

// Map a database user to our app's user model
export const mapDatabaseUserToAppUser = (dbUser: DatabaseUser, role: "admin" | "collaborator"): User => {
  if (role === "admin") {
    return {
      id: String(dbUser.id),
      name: dbUser.email.split('@')[0], // Extraindo o nome do email para admins
      email: dbUser.email,
      role: "admin",
      storeId: null,
      unidade: "Administração"
    };
  } else {
    // Para colaboradores
    return {
      id: String(dbUser.id),
      name: dbUser.nome || '',
      email: dbUser.email,
      role: "collaborator",
      storeId: String(dbUser.id),
      unidade: dbUser.unidade
    };
  }
};

// Map a database checklist to our app's checklist model
export const mapDatabaseChecklistToAppChecklist = (
  dbChecklist: DatabaseChecklist,
  type: ChecklistType,
  period: PeriodoType
): Checklist => {
  // Determine which vistoria field to use based on period
  let items;
  let checklistId = String(dbChecklist.id);
  
  if (period === "manhã") {
    items = dbChecklist.vistoria1;
  } else if (period === "tarde") {
    items = dbChecklist.vistoria2;
  } else {
    items = dbChecklist.vistoria3;
  }
  
  // Convert to our app model
  return {
    id: checklistId,
    userId: String(dbChecklist.colaborador_id),
    type,
    period,
    date: dbChecklist.data,
    items: items || {},
    completed: period === "noite" && dbChecklist.status_vistoria3 === "completed"
  };
};

// Map a database action plan to our app's action plan model
export const mapDatabaseActionPlanToAppActionPlan = (
  dbActionPlan: DatabaseActionPlan,
  userName: string
): ActionPlan => {
  return {
    id: String(dbActionPlan.id),
    description: dbActionPlan.descricao,
    status: dbActionPlan.status as ActionPlan["status"],
    createdAt: dbActionPlan.data_envio,
    updatedAt: dbActionPlan.data_envio, // Assume it's the same for simplicity
    userId: "", // We don't have this info in the DB
    userName: userName || "Colaborador",
    checklistItemId: `${dbActionPlan.checklist_id}-item-1`, // This is a placeholder
    dataAdiamento: dbActionPlan.data_adiamento,
    dataRecusa: dbActionPlan.data_recusa,
    respostaCorrigida: dbActionPlan.resposta_corrigida
  };
};
