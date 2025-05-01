
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Checklist, ChecklistItem, ChecklistType, ActionPlan, PendingActionPlan } from "@/types";
import { mockChecklists, mockActionPlans } from "@/data/mockData";
import { useAuth } from "../AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useChecklistActions } from "./useChecklistActions";
import { ChecklistContextType } from "./checklistTypes";

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
