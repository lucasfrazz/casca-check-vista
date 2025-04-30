import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Checklist, ChecklistItem, ChecklistType, ActionPlan, PendingActionPlan } from "@/types";
import { mockChecklists, mockActionPlans } from "@/data/mockData";
import { checklistTemplates } from "@/data/checklistTemplates";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/use-toast";
import { stores } from "@/data/stores";
import { 
  supabase, 
  checklistService, 
  actionPlanService, 
  storageService 
} from "@/services/supabase";

interface ChecklistContextType {
  checklists: Checklist[];
  createChecklist: (type: ChecklistType, storeId: string) => Promise<Checklist | null>;
  saveChecklist: (checklist: Checklist) => Promise<void>;
  getChecklistsByStore: (storeId: string) => Promise<Checklist[]>;
  getChecklistsByDate: (date: string) => Promise<Checklist[]>;
  getChecklistsByType: (type: ChecklistType) => Promise<Checklist[]>;
  updateChecklistItem: (
    checklistId: string,
    itemId: string,
    status: "sim" | "nao",
    justification?: string,
    photoUrl?: string
  ) => Promise<void>;
  addActionPlan: (
    checklistId: string,
    itemId: string,
    description: string
  ) => Promise<void>;
  getPendingActionPlans: () => Promise<PendingActionPlan[]>;
  reviewActionPlan: (
    planId: string,
    checklistId: string,
    itemId: string,
    status: "approved" | "rejected",
    comment?: string
  ) => Promise<void>;
  uploadImage: (file: File, checklistId: string, itemId: string) => Promise<string | null>;
  loading: boolean;
}

const ChecklistContext = createContext<ChecklistContextType>({
  checklists: [],
  createChecklist: async () => null,
  saveChecklist: async () => {},
  getChecklistsByStore: async () => [],
  getChecklistsByDate: async () => [],
  getChecklistsByType: async () => [],
  updateChecklistItem: async () => {},
  addActionPlan: async () => {},
  getPendingActionPlans: async () => [],
  reviewActionPlan: async () => {},
  uploadImage: async () => null,
  loading: false,
});

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [pendingPlans, setPendingPlans] = useState<PendingActionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load checklists on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      if (user) {
        setLoading(true);
        try {
          // In a real app, we'd fetch the user's checklists
          // For now, using mock data
          setChecklists(mockChecklists);
          setPendingPlans(mockActionPlans);
        } catch (error) {
          console.error("Error fetching initial data:", error);
          toast({
            title: "Erro",
            description: "Falha ao carregar dados iniciais",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
  }, [user]);

  // Create a new checklist based on template
  const createChecklist = async (type: ChecklistType, storeId: string): Promise<Checklist | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const template = checklistTemplates.find(t => t.type === type);
      if (!template) {
        toast({
          title: "Erro",
          description: "Tipo de checklist não encontrado",
          variant: "destructive",
        });
        return null;
      }

      // Generate unique ID for client-side use before sending to Supabase
      const clientId = `checklist-${Date.now()}`;
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Create empty checklist from template
      const newChecklist: Checklist = {
        id: clientId,
        type,
        date: currentDate,
        storeId,
        userId: user.id,
        userName: user.name,
        items: template.items.map((item, index) => ({
          id: `${clientId}-${index}`,
          description: item.description,
          status: null,
          recurrenceCount: 0,
        })),
        completed: false,
      };

      // In a real app with Supabase, we'd save to the database
      // For now, just add to local state
      setChecklists(prev => [...prev, newChecklist]);
      
      // If connected to Supabase, we'd use:
      // const savedChecklist = await checklistService.createChecklist(newChecklist);
      // return savedChecklist;
      
      return newChecklist;
    } catch (error) {
      console.error("Error creating checklist:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar checklist",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save a completed checklist
  const saveChecklist = async (checklist: Checklist): Promise<void> => {
    setLoading(true);
    try {
      const updatedCheckList = {
        ...checklist,
        completed: true,
      };
      
      // Update local state
      setChecklists(prev => 
        prev.map(cl => cl.id === checklist.id ? updatedCheckList : cl)
      );

      // In a real app with Supabase, we'd save to the database
      // await checklistService.saveChecklist(checklist.id);
      
      toast({
        title: "Checklist Salvo",
        description: "O checklist foi salvo com sucesso!",
      });
    } catch (error) {
      console.error("Error saving checklist:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar checklist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter checklists by store
  const getChecklistsByStore = async (storeId: string): Promise<Checklist[]> => {
    setLoading(true);
    try {
      // In a real app with Supabase, we'd fetch from the database
      // return await checklistService.getChecklistsByStore(storeId);
      
      // For now, just filter local state
      return checklists.filter(cl => cl.storeId === storeId);
    } catch (error) {
      console.error("Error getting checklists by store:", error);
      toast({
        title: "Erro",
        description: "Falha ao buscar checklists por loja",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Filter checklists by date
  const getChecklistsByDate = async (date: string): Promise<Checklist[]> => {
    setLoading(true);
    try {
      // In a real app with Supabase, we'd fetch from the database
      // return await checklistService.getChecklistsByDate(date);
      
      // For now, just filter local state
      return checklists.filter(cl => cl.date === date);
    } catch (error) {
      console.error("Error getting checklists by date:", error);
      toast({
        title: "Erro",
        description: "Falha ao buscar checklists por data",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Filter checklists by type
  const getChecklistsByType = async (type: ChecklistType): Promise<Checklist[]> => {
    setLoading(true);
    try {
      // In a real app with Supabase, we'd fetch from the database
      // return await checklistService.getChecklistsByType(type);
      
      // For now, just filter local state
      return checklists.filter(cl => cl.type === type);
    } catch (error) {
      console.error("Error getting checklists by type:", error);
      toast({
        title: "Erro",
        description: "Falha ao buscar checklists por tipo",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update a checklist item status
  const updateChecklistItem = async (
    checklistId: string,
    itemId: string,
    status: "sim" | "nao",
    justification?: string,
    photoUrl?: string
  ): Promise<void> => {
    setLoading(true);
    try {
      const timestamp = new Date().toISOString();

      // Update local state
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

      // In a real app with Supabase, we'd save to the database
      // await checklistService.updateChecklistItem(itemId, status, justification, photoUrl);
      
    } catch (error) {
      console.error("Error updating checklist item:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar item do checklist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add an action plan for a checklist item
  const addActionPlan = async (
    checklistId: string,
    itemId: string,
    description: string
  ): Promise<void> => {
    if (!user) return;
    setLoading(true);

    try {
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
      
      // In a real app with Supabase, we'd save to the database
      // await actionPlanService.addActionPlan({
      //   description,
      //   status: "pending",
      //   createdAt: timestamp,
      //   updatedAt: timestamp,
      //   userId: user.id,
      //   userName: user.name,
      //   checklistItemId: itemId,
      // });
      
      toast({
        title: "Plano de Ação Criado",
        description: "O plano de ação foi registrado com sucesso.",
      });
    } catch (error) {
      console.error("Error adding action plan:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar plano de ação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get all pending action plans
  const getPendingActionPlans = async (): Promise<PendingActionPlan[]> => {
    setLoading(true);
    try {
      // In a real app with Supabase, we'd fetch from the database
      // const data = await actionPlanService.getPendingActionPlans();
      // return data;
      
      // For now, just return local state
      return pendingPlans;
    } catch (error) {
      console.error("Error getting pending action plans:", error);
      toast({
        title: "Erro",
        description: "Falha ao buscar planos de ação pendentes",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Review an action plan (admin only)
  const reviewActionPlan = async (
    planId: string,
    checklistId: string,
    itemId: string,
    status: "approved" | "rejected",
    comment?: string
  ): Promise<void> => {
    if (!user || user.role !== "admin") {
      toast({
        title: "Erro",
        description: "Apenas administradores podem revisar planos de ação",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
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

      // In a real app with Supabase, we'd save to the database
      // await actionPlanService.reviewActionPlan(planId, status, user.id, user.name, comment);
      
    } catch (error) {
      console.error("Error reviewing action plan:", error);
      toast({
        title: "Erro",
        description: "Falha ao revisar plano de ação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload an image for a checklist item
  const uploadImage = async (file: File, checklistId: string, itemId: string): Promise<string | null> => {
    setLoading(true);
    try {
      // In a real app with Supabase, we'd upload to storage
      // return await storageService.uploadImage(file, checklistId, itemId);
      
      // For now, just simulate with a random URL
      const mockPhotoUrl = `https://source.unsplash.com/random/300x200?sig=${Date.now()}`;
      return mockPhotoUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar imagem",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
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
        uploadImage,
        loading
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export const useChecklists = () => useContext(ChecklistContext);
