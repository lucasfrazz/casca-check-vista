
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Checklist, PendingActionPlan } from "@/types";
import { useAuth } from "../AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useChecklistActions } from "./useChecklistActions";
import { ChecklistContextType } from "./checklistTypes";
import { checklistService } from "@/services/supabase";

// Create the context with default values
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
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  const { user } = useAuth();

  // Get all actions from our custom hook
  const actions = useChecklistActions({
    checklists,
    setChecklists,
    pendingPlans,
    setPendingPlans,
    setLoading,
    user
  });

  // Load checklists on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      if (user && !initialLoadAttempted) {
        setInitialLoadAttempted(true);
        setLoading(true);
        try {
          // Get checklists from Supabase
          let fetchedChecklists: Checklist[] = [];
          
          if (user.role === "admin") {
            // Admin can see all checklists
            if (user.storeIds && user.storeIds.length > 0) {
              // Only load first store to avoid performance issues
              const firstStore = user.storeIds[0];
              const storeChecklists = await checklistService.getChecklistsByStore(firstStore);
              fetchedChecklists = storeChecklists;
            } else {
              // If no specific stores, get only today's checklists
              const today = new Date().toISOString().split('T')[0];
              fetchedChecklists = await checklistService.getChecklistsByDate(today);
            }
          } else if (user.role === "collaborator" && user.storeId) {
            // Collaborators only see their store's checklists
            fetchedChecklists = await checklistService.getChecklistsByStore(user.storeId);
          }
          
          setChecklists(fetchedChecklists);
          
          // Get pending action plans
          try {
            const plans = await actions.getPendingActionPlans();
            setPendingPlans(plans);
          } catch (planError) {
            console.error("Error fetching pending plans:", planError);
            // Don't throw - continue with empty plans
          }
          
        } catch (error) {
          console.error("Error fetching initial data:", error);
          // Only show toast for non-network errors
          if (!(error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network')))) {
            toast({
              title: "Erro",
              description: "Falha ao carregar dados iniciais",
              variant: "destructive",
            });
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
  }, [user, actions.getPendingActionPlans, initialLoadAttempted]);

  return (
    <ChecklistContext.Provider
      value={{
        checklists,
        loading,
        ...actions
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export const useChecklists = () => useContext(ChecklistContext);
