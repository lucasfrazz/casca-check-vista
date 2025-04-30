
import { useState, useEffect } from "react";
import { useChecklists } from "@/context/ChecklistContext";
import { PendingActionAlert } from "./PendingActionAlert";

export function PendingNotification() {
  const { getPendingActionPlans } = useChecklists();
  const [showNotification, setShowNotification] = useState(false);
  const [pendingPlans, setPendingPlans] = useState(0);
  const [maxDays, setMaxDays] = useState(0);

  useEffect(() => {
    // Check for pending plans on component mount
    const fetchPlans = async () => {
      const plans = await getPendingActionPlans();
      if (plans.length > 0) {
        setPendingPlans(plans.length);
        
        // Find the maximum days pending
        const max = Math.max(...plans.map(plan => plan.daysPending));
        setMaxDays(max);
        
        // Show notification
        setShowNotification(true);
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
