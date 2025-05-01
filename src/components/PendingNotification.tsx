
import { useState, useEffect } from "react";
import { useChecklists } from "@/context/checklist";
import { PendingActionAlert } from "./PendingActionAlert";
import { PendingActionPlan } from "@/types";

export function PendingNotification() {
  const { getPendingActionPlans } = useChecklists();
  const [showNotification, setShowNotification] = useState(false);
  const [pendingPlans, setPendingPlans] = useState<PendingActionPlan[]>([]);
  const [maxDays, setMaxDays] = useState(0);

  useEffect(() => {
    // Check for pending plans on component mount
    const fetchPlans = async () => {
      try {
        const plans = await getPendingActionPlans();
        if (plans && plans.length > 0) {
          setPendingPlans(plans);
          
          // Find the maximum days pending
          const max = Math.max(...plans.map(plan => plan.daysPending));
          setMaxDays(max);
          
          // Show notification
          setShowNotification(true);
        }
      } catch (error) {
        console.error("Error fetching pending action plans:", error);
      }
    };

    fetchPlans();
  }, [getPendingActionPlans]);

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
