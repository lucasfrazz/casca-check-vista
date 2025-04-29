import { createContext, useState, useContext, ReactNode } from "react";
import { Checklist, ChecklistItem, ChecklistType, ActionPlan, PendingActionPlan } from "@/types";
import { mockChecklists, mockActionPlans } from "@/data/mockData";
import { checklistTemplates } from "@/data/checklistTemplates";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/use-toast";
import { stores } from "@/data/stores";

interface ChecklistContextType {
  checklists: Checklist[];
  createChecklist: (type: ChecklistType, storeId: string) => Checklist;
  saveChecklist: (checklist: Checklist) => void;
  getChecklistsByStore: (storeId: string) => Checklist[];
  getChecklistsByDate: (date: string) => Checklist[];
  getChecklistsByType: (type: ChecklistType) => Checklist[];
  updateChecklistItem: (
    checklistId: string,
    itemId: string,
    status: "sim" | "nao",
    justification?: string,
    photoUrl?: string
  ) => void;
  addActionPlan: (
    checklistId: string,
    itemId: string,
    description: string
  ) => void;
  getPendingActionPlans: () => PendingActionPlan[];
  reviewActionPlan: (
    planId: string,
    checklistId: string,
    itemId: string,
    status: "approved" | "rejected",
    comment?: string
  ) => void;
}

const ChecklistContext = createContext<ChecklistContextType>({
  checklists: [],
  createChecklist: () => ({ id: "", type: "reposicao-frente-loja", date: "", storeId: "", userId: "", userName: "", items: [], completed: false }),
  saveChecklist: () => {},
  getChecklistsByStore: () => [],
  getChecklistsByDate: () => [],
  getChecklistsByType: () => [],
  updateChecklistItem: () => {},
  addActionPlan: () => {},
  getPendingActionPlans: () => [],
  reviewActionPlan: () => {},
});

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [checklists, setChecklists] = useState<Checklist[]>(mockChecklists);
  const [pendingPlans, setPendingPlans] = useState<PendingActionPlan[]>(mockActionPlans);
  const { user } = useAuth();

  // Create a new checklist based on template
  const createChecklist = (type: ChecklistType, storeId: string): Checklist => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      throw new Error("User not authenticated");
    }

    const template = checklistTemplates.find(t => t.type === type);
    if (!template) {
      toast({
        title: "Erro",
        description: "Tipo de checklist não encontrado",
        variant: "destructive",
      });
      throw new Error("Checklist template not found");
    }

    // Generate unique ID
    const id = `checklist-${Date.now()}`;
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Create empty checklist from template
    const newChecklist: Checklist = {
      id,
      type,
      date: currentDate,
      storeId,
      userId: user.id,
      userName: user.name,
      items: template.items.map((item, index) => ({
        id: `${id}-${index}`,
        description: item.description,
        status: null,
        recurrenceCount: 0,
      })),
      completed: false,
    };

    // Add to state
    setChecklists(prev => [...prev, newChecklist]);
    return newChecklist;
  };

  // Save a completed checklist
  const saveChecklist = (checklist: Checklist): void => {
    const updatedCheckList = {
      ...checklist,
      completed: true,
    };
    
    setChecklists(prev => 
      prev.map(cl => cl.id === checklist.id ? updatedCheckList : cl)
    );

    toast({
      title: "Checklist Salvo",
      description: "O checklist foi salvo com sucesso!",
    });
  };

  // Filter checklists by store
  const getChecklistsByStore = (storeId: string): Checklist[] => {
    return checklists.filter(cl => cl.storeId === storeId);
  };

  // Filter checklists by date
  const getChecklistsByDate = (date: string): Checklist[] => {
    return checklists.filter(cl => cl.date === date);
  };

  // Filter checklists by type
  const getChecklistsByType = (type: ChecklistType): Checklist[] => {
    return checklists.filter(cl => cl.type === type);
  };

  // Update a checklist item status
  const updateChecklistItem = (
    checklistId: string,
    itemId: string,
    status: "sim" | "nao",
    justification?: string,
    photoUrl?: string
  ): void => {
    const timestamp = new Date().toISOString();

    setChecklists(prev => {
      return prev.map(checklist => {
        if (checklist.id !== checklistId) return checklist;
        
        // Find the item to update
        const updatedItems = checklist.items.map(item => {
          if (item.id !== itemId) return item;

          // Check for recurrence if status is "nao"
          let recurrenceCount = item.recurrenceCount;
          if (status === "nao") {
            recurrenceCount += 1;
          }

          return {
            ...item,
            status,
            justification: status === "nao" ? justification || item.justification : undefined,
            photoUrl: status === "sim" ? photoUrl || item.photoUrl : undefined,
            timestamp,
            recurrenceCount,
          };
        });

        return {
          ...checklist,
          items: updatedItems,
        };
      });
    });
  };

  // Add an action plan for a checklist item
  const addActionPlan = (
    checklistId: string,
    itemId: string,
    description: string
  ): void => {
    if (!user) return;

    const timestamp = new Date().toISOString();
    const actionPlanId = `ap-${Date.now()}`;

    const actionPlan: ActionPlan = {
      id: actionPlanId,
      description,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
      userId: user.id,
      userName: user.name,
      checklistItemId: itemId,
    };

    // Update the checklist item with the action plan
    setChecklists(prev => {
      return prev.map(checklist => {
        if (checklist.id !== checklistId) return checklist;
        
        const updatedItems = checklist.items.map(item => {
          if (item.id !== itemId) return item;
          
          return {
            ...item,
            actionPlan,
          };
        });

        return {
          ...checklist,
          items: updatedItems,
        };
      });
    });

    // Add to pending plans
    const checklist = checklists.find(cl => cl.id === checklistId);
    if (!checklist) return;
    
    const item = checklist.items.find(it => it.id === itemId);
    if (!item) return;
    
    const store = stores.find(s => s.id === checklist.storeId);
    if (!store) return;

    const newPendingPlan: PendingActionPlan = {
      id: actionPlanId,
      description,
      createdAt: timestamp,
      daysPending: 0,
      storeId: checklist.storeId,
      storeName: store.name,
      checklistType: checklist.type,
      itemDescription: item.description,
    };

    setPendingPlans(prev => [...prev, newPendingPlan]);
    
    toast({
      title: "Plano de Ação Criado",
      description: "O plano de ação foi registrado com sucesso.",
    });
  };

  // Get all pending action plans
  const getPendingActionPlans = (): PendingActionPlan[] => {
    // In a real app, we would calculate days pending here
    return pendingPlans;
  };

  // Review an action plan (admin only)
  const reviewActionPlan = (
    planId: string,
    checklistId: string,
    itemId: string,
    status: "approved" | "rejected",
    comment?: string
  ): void => {
    if (!user || user.role !== "admin") {
      toast({
        title: "Erro",
        description: "Apenas administradores podem revisar planos de ação",
        variant: "destructive",
      });
      return;
    }

    const timestamp = new Date().toISOString();

    // Update the action plan in the checklist
    setChecklists(prev => {
      return prev.map(checklist => {
        if (checklist.id !== checklistId) return checklist;
        
        const updatedItems = checklist.items.map(item => {
          if (item.id !== itemId || !item.actionPlan) return item;
          
          return {
            ...item,
            actionPlan: {
              ...item.actionPlan,
              status,
              updatedAt: timestamp,
              reviewerId: user.id,
              reviewerName: user.name,
              reviewComment: comment,
            },
          };
        });

        return {
          ...checklist,
          items: updatedItems,
        };
      });
    });

    // If approved, remove from pending plans
    if (status === "approved") {
      setPendingPlans(prev => prev.filter(plan => plan.id !== planId));
      toast({
        title: "Plano de Ação Aprovado",
        description: "O plano de ação foi aprovado com sucesso.",
      });
    } else {
      // If rejected, update the plan status but keep it in pending
      toast({
        title: "Plano de Ação Rejeitado",
        description: "O plano de ação foi rejeitado. É necessário criar um novo plano.",
        variant: "destructive",
      });
    }
  };

  return (
    <ChecklistContext.Provider
      value={{
        checklists,
        createChecklist,
        saveChecklist,
        getChecklistsByStore,
        getChecklistsByDate,
        getChecklistsByType,
        updateChecklistItem,
        addActionPlan,
        getPendingActionPlans,
        reviewActionPlan,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export const useChecklists = () => useContext(ChecklistContext);
