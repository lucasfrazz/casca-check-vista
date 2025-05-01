
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ActionPlanList } from "@/components/ActionPlanList";
import { useChecklists } from "@/context/checklist";
import { useAuth } from "@/context/AuthContext";
import { PendingActionPlan } from "@/types";
import { Spinner } from "@/components/ui/spinner";

const ActionPlansPage = () => {
  const { getPendingActionPlans, reviewActionPlan } = useChecklists();
  const { user } = useAuth();
  const [pendingPlans, setPendingPlans] = useState<PendingActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const plans = await getPendingActionPlans();
        setPendingPlans(plans);
      } catch (error) {
        console.error("Error fetching pending action plans:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlans();
  }, [getPendingActionPlans]);

  const handleReviewPlan = (
    planId: string, 
    checklistId: string, 
    itemId: string, 
    status: "approved" | "rejected", 
    comment?: string
  ) => {
    reviewActionPlan(planId, checklistId, itemId, status, comment);
    
    // Update the local state
    const updatedPlans = pendingPlans.filter(plan => plan.id !== planId);
    setPendingPlans(updatedPlans);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Planos de Ação Pendentes</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner size="lg" />
            <span className="ml-2">Carregando planos de ação...</span>
          </div>
        ) : (
          <ActionPlanList
            plans={pendingPlans}
            onReviewPlan={handleReviewPlan}
            isAdmin={isAdmin}
          />
        )}
      </main>
    </div>
  );
};

export default ActionPlansPage;
