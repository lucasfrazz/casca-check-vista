
import { Checklist, ChecklistType, PendingActionPlan, ActionPlan, PeriodoType } from "@/types";
import { checklistTemplates } from "@/data/checklistTemplates";
import { toast } from "@/components/ui/use-toast";
import { ChecklistActionProps } from "./checklistTypes";
import { 
  checklistService, 
  actionPlanService, 
  storageService 
} from "@/services/supabase";

export function useChecklistActions({
  checklists,
  setChecklists,
  pendingPlans,
  setPendingPlans,
  setLoading,
  user
}: ChecklistActionProps) {
  // Create a new checklist based on template
  const createChecklist = async (type: ChecklistType, storeId: string, period?: string): Promise<Checklist | null> => {
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
        period: (period as PeriodoType) || "manhã", // Default to morning if not specified
      };

      // Save to Supabase
      const savedChecklist = await checklistService.createChecklist(newChecklist);
      
      if (savedChecklist) {
        // Update local state with the saved checklist
        setChecklists(prev => [...prev, savedChecklist]);
        return savedChecklist;
      } else {
        throw new Error("Failed to save checklist to database");
      }
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

      // Save to Supabase
      await checklistService.saveChecklist(checklist.id);
      
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
      // Fetch from Supabase
      const storeChecklists = await checklistService.getChecklistsByStore(storeId);
      
      // Update local state with the fetched checklists
      const updatedChecklists = [...checklists];
      storeChecklists.forEach(newCl => {
        const index = updatedChecklists.findIndex(cl => cl.id === newCl.id);
        if (index >= 0) {
          updatedChecklists[index] = newCl;
        } else {
          updatedChecklists.push(newCl);
        }
      });
      
      setChecklists(updatedChecklists);
      
      return storeChecklists;
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
      // Fetch from Supabase
      const dateChecklists = await checklistService.getChecklistsByDate(date);
      
      // Update local state with the fetched checklists
      const updatedChecklists = [...checklists];
      dateChecklists.forEach(newCl => {
        const index = updatedChecklists.findIndex(cl => cl.id === newCl.id);
        if (index >= 0) {
          updatedChecklists[index] = newCl;
        } else {
          updatedChecklists.push(newCl);
        }
      });
      
      setChecklists(updatedChecklists);
      
      return dateChecklists;
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
      // Fetch from Supabase
      const typeChecklists = await checklistService.getChecklistsByType(type);
      
      // Update local state with the fetched checklists
      const updatedChecklists = [...checklists];
      typeChecklists.forEach(newCl => {
        const index = updatedChecklists.findIndex(cl => cl.id === newCl.id);
        if (index >= 0) {
          updatedChecklists[index] = newCl;
        } else {
          updatedChecklists.push(newCl);
        }
      });
      
      setChecklists(updatedChecklists);
      
      return typeChecklists;
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

      // Update in Supabase
      await checklistService.updateChecklistItem(
        itemId, 
        status, 
        justification, 
        photoUrl
      );
      
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

      const actionPlanData: Omit<ActionPlan, 'id'> = {
        description,
        status: "pending",
        createdAt: timestamp,
        updatedAt: timestamp,
        userId: user.id,
        userName: user.name,
        checklistItemId: itemId
      };

      // Add to Supabase
      const savedActionPlan = await actionPlanService.addActionPlan(actionPlanData);
      
      if (!savedActionPlan) {
        throw new Error("Failed to save action plan");
      }

      // Update the checklist item with the action plan
      setChecklists(prev => {
        return prev.map(checklist => {
          if (checklist.id !== checklistId) return checklist;
          
          const updatedItems = checklist.items.map(item => {
            if (item.id !== itemId) return item;
            
            return {
              ...item,
              actionPlan: savedActionPlan,
            };
          });

          return {
            ...checklist,
            items: updatedItems,
          };
        });
      });

      toast({
        title: "Plano de Ação Criado",
        description: "O plano de ação foi registrado com sucesso.",
      });
      
      // Refresh pending plans
      const updatedPlans = await getPendingActionPlans();
      setPendingPlans(updatedPlans);
      
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
      // Fetch from Supabase
      const plans = await actionPlanService.getPendingActionPlans();
      
      // Update local state
      setPendingPlans(plans);
      
      return plans;
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
      console.log("Reviewing action plan:", { planId, status, comment });
      
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

      // Update in Supabase
      await actionPlanService.reviewActionPlan(
        planId, 
        status, 
        user.id, 
        user.name, 
        comment
      );
      
      // Permanently remove from pending plans if approved
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
      console.log("Starting image upload:", { checklistId, itemId, fileName: file.name });
      
      // Upload to Supabase storage
      const photoUrl = await storageService.uploadImage(file, checklistId, itemId);
      console.log("Image upload result:", photoUrl);
      
      if (!photoUrl) {
        throw new Error("Failed to upload image");
      }
      
      return photoUrl;
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

  return {
    createChecklist,
    saveChecklist,
    getChecklistsByStore,
    getChecklistsByDate,
    getChecklistsByType,
    updateChecklistItem,
    addActionPlan,
    getPendingActionPlans,
    reviewActionPlan,
    uploadImage
  };
}
