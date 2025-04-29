
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ActionPlanList } from "@/components/ActionPlanList";
import { useChecklists } from "@/context/ChecklistContext";
import { useAuth } from "@/context/AuthContext";
import { PendingActionPlan } from "@/types";

const ActionPlansPage = () => {
  const { getPendingActionPlans, reviewActionPlan } = useChecklists();
  const { user } = useAuth();
  const [pendingPlans, setPendingPlans] = useState<PendingActionPlan[]>([]);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const plans = getPendingActionPlans();
    setPendingPlans(plans);
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
        
        <ActionPlanList
          plans={pendingPlans}
          onReviewPlan={handleReviewPlan}
          isAdmin={isAdmin}
        />
      </main>
    </div>
  );
};

export default ActionPlansPage;
