
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
      if (user) {
        setLoading(true);
        try {
          // Get checklists from Supabase
          let fetchedChecklists: Checklist[] = [];
          
          if (user.role === "admin") {
            // Admin can see all checklists
            const storeChecklists = await Promise.all(
              (user.stores || []).map(storeId => 
                checklistService.getChecklistsByStore(storeId)
              )
            );
            fetchedChecklists = storeChecklists.flat();
          } else if (user.role === "collaborator" && user.storeId) {
            // Collaborators only see their store's checklists
            fetchedChecklists = await checklistService.getChecklistsByStore(user.storeId);
          }
          
          setChecklists(fetchedChecklists);
          
          // Get pending action plans
          const plans = await actions.getPendingActionPlans();
          setPendingPlans(plans);
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
  }, [user, actions.getPendingActionPlans]);

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
