
import { useState, useEffect, useCallback, useRef } from "react";
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const hasAttemptedFetch = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use memoized callback to prevent re-creation on each render
  const fetchPlans = useCallback(async () => {
    if (!user || isLoading || hasAttemptedFetch.current) return;
    
    hasAttemptedFetch.current = true;
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
      
      // Check for resource errors specifically
      const isNetworkError = error instanceof TypeError && 
        (error.message.includes('fetch') || error.message.includes('network'));
      
      const isResourceError = error instanceof Error && 
        (error.message.includes('ERR_INSUFFICIENT_RESOURCES') || 
         (error.toString && error.toString().includes('ERR_INSUFFICIENT_RESOURCES')));
      
      if (isNetworkError || isResourceError) {
        if (retryCount < maxRetries) {
          // Implement exponential backoff for retries
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retry ${retryCount + 1}/${maxRetries} after ${delay}ms`);
          
          // Clear any existing timeout
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
          }
          
          fetchTimeoutRef.current = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            hasAttemptedFetch.current = false; // Reset the flag to allow another attempt
            setIsLoading(false); // Allow retry on next render
            fetchTimeoutRef.current = null;
          }, delay);
        } else {
          // After max retries, just stop trying to prevent reload loops
          console.warn("Max retries reached, stopping fetch attempts");
          setIsLoading(false);
        }
        return;
      }
      
      // For other errors, show toast but don't continuously retry
      toast({
        title: "Erro",
        description: "Não foi possível verificar pendências",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [getPendingActionPlans, user, isLoading, retryCount]);

  useEffect(() => {
    // Check for pending plans on component mount only
    if (user && !isLoading && !hasAttemptedFetch.current) {
      fetchPlans();
    }
    
    return () => {
      // Clean up any pending timeouts on unmount
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchPlans, user, isLoading]);

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
