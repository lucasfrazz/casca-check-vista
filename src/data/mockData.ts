
import { User, Checklist, ActionPlan, PendingActionPlan } from "@/types";
import { stores } from "./stores";

export const users: User[] = [
  {
    id: "1",
    name: "Admin",
    email: "admin@cascacheck.com",
    role: "admin"
  },
  {
    id: "2",
    name: "João Silva",
    email: "joao@cascacheck.com",
    role: "collaborator",
    storeId: "1"
  },
  {
    id: "3",
    name: "Maria Santos",
    email: "maria@cascacheck.com",
    role: "collaborator",
    storeId: "2"
  },
  {
    id: "4",
    name: "Pedro Oliveira",
    email: "pedro@cascacheck.com",
    role: "collaborator",
    storeId: "3"
  },
  {
    id: "5",
    name: "Ana Costa",
    email: "ana@cascacheck.com",
    role: "collaborator",
    storeId: "4"
  }
];

export const mockChecklists: Checklist[] = [
  {
    id: "1",
    type: "reposicao-frente-loja",
    date: "2023-04-28",
    storeId: "1",
    userId: "2",
    userName: "João Silva",
    completed: true,
    items: [
      {
        id: "1-1",
        description: "Bancada limpa e seca",
        status: "sim",
        timestamp: "2023-04-28T09:30:00",
        recurrenceCount: 0
      },
      {
        id: "1-2",
        description: "Toalhas descartáveis disponíveis",
        status: "nao",
        justification: "Acabaram as toalhas no estoque",
        timestamp: "2023-04-28T09:32:00",
        recurrenceCount: 1,
        actionPlan: {
          id: "ap-1",
          description: "Comprar novas toalhas descartáveis",
          status: "pending",
          createdAt: "2023-04-28T09:32:00",
          updatedAt: "2023-04-28T09:32:00",
          userId: "2",
          userName: "João Silva",
          checklistItemId: "1-2"
        }
      }
    ]
  },
  {
    id: "2",
    type: "area-producao",
    date: "2023-04-27",
    storeId: "2",
    userId: "3",
    userName: "Maria Santos",
    completed: true,
    items: [
      {
        id: "2-1",
        description: "Equipamentos limpos",
        status: "sim",
        timestamp: "2023-04-27T10:15:00",
        recurrenceCount: 0
      },
      {
        id: "2-2",
        description: "Superfícies sanitizadas",
        status: "sim",
        timestamp: "2023-04-27T10:17:00",
        recurrenceCount: 0
      }
    ]
  }
];

export const mockActionPlans: PendingActionPlan[] = [
  {
    id: "ap-1",
    description: "Comprar novas toalhas descartáveis",
    createdAt: "2023-04-28T09:32:00",
    daysPending: 2,
    storeId: "1",
    storeName: "Açaí Casca Asa Norte",
    checklistType: "reposicao-frente-loja",
    itemDescription: "Toalhas descartáveis disponíveis"
  }
];
