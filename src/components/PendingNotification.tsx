
import { useState, useEffect } from "react";
import { useChecklists } from "@/context/checklist";
import { PendingActionAlert } from "./PendingActionAlert";
import { PendingActionPlan } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

export function PendingNotification() {
  const { getPendingActionPlans } = useChecklists();
  const { user } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [pendingPlans, setPendingPlans] = useState<PendingActionPlan[]>([]);
  const [maxDays, setMaxDays] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for pending plans on component mount
    const fetchPlans = async () => {
      if (!user || isLoading) return;
      
      setIsLoading(true);
      try {
        const plans = await getPendingActionPlans();
        
        // Filter plans by the user's unit if they are a collaborator
        const filteredPlans = user.role === "collaborator" && user.unidade 
          ? plans.filter(plan => plan.storeName === user.unidade)
          : plans;
        
        if (filteredPlans && filteredPlans.length > 0) {
          setPendingPlans(filteredPlans);
          
          // Find the maximum days pending
          const max = Math.max(...filteredPlans.map(plan => plan.daysPending));
          setMaxDays(max);
          
          // Show notification
          setShowNotification(true);
        }
      } catch (error) {
        console.error("Error fetching pending action plans:", error);
        // Don't show toast for network errors as they're expected during initial load
        if (!(error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network')))) {
          toast({
            title: "Erro",
            description: "Não foi possível verificar pendências",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [getPendingActionPlans, user]);

  const handleCloseAlert = () => {
    setShowNotification(false);
  };

  if (!showNotification) return null;

  return (
    <PendingActionAlert 
      daysCount={maxDays} 
      onClose={handleCloseAlert} 
    />
  );
}
