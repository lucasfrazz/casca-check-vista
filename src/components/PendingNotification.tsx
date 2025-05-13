import { useState, useEffect, useCallback, useRef } from "react";
import { useChecklists } from "@/context/checklist";
import { PendingActionAlert } from "./PendingActionAlert";
import { PendingActionPlan } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function PendingNotification() {
  const { getPendingActionPlans } = useChecklists();
  const { user } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [pendingPlans, setPendingPlans] = useState<PendingActionPlan[]>([]);
  const [maxDays, setMaxDays] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const maxRetries = 3;
  const hasAttemptedFetch = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fully memoized fetch function that won't change on rerenders
  const fetchPlans = useCallback(async () => {
    if (!user || isLoading || hasAttemptedFetch.current) return;
    
    hasAttemptedFetch.current = true;
    setIsLoading(true);
    
    try {
      console.log("Attempting to fetch pending action plans...");
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
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching pending action plans:", error);
      setErrorOccurred(true);
      
      // Check for resource errors or network errors
      const isNetworkError = error instanceof TypeError && 
        (error.message.includes('fetch') || error.message.includes('network'));
      
      const isResourceError = error instanceof Error && 
        (error.message.includes('ERR_INSUFFICIENT_RESOURCES') || 
         (error.toString && error.toString().includes('ERR_INSUFFICIENT_RESOURCES')));
      
      if ((isNetworkError || isResourceError) && retryCount < maxRetries) {
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
          console.log("Retry timeout executed, will attempt retry on next render");
        }, delay);
      } else {
        // After max retries or for other errors, just stop trying
        console.log("Max retries reached or non-retriable error, stopping fetch attempts");
        
        // Only show toast for non-network/resource errors
        if (!isNetworkError && !isResourceError) {
          toast({
            title: "Erro",
            description: "Não foi possível verificar pendências",
            variant: "destructive",
          });
        }
        
        setIsLoading(false);
      }
    }
  }, [getPendingActionPlans, user, isLoading, retryCount]);

  // Cleanup function for unmounting
  useEffect(() => {
    return () => {
      // Clean up any pending timeouts on unmount
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Manual check function that will be triggered by button click
  const handleManualCheck = () => {
    // Reset state for a fresh check
    hasAttemptedFetch.current = false;
    setRetryCount(0);
    setErrorOccurred(false);
    
    // Trigger the fetch
    fetchPlans();
  };

  const handleCloseAlert = () => {
    setShowNotification(false);
  };

  // If we have a notification to show, display it
  if (showNotification) {
    return (
      <PendingActionAlert 
        daysCount={maxDays} 
        onClose={handleCloseAlert} 
      />
    );
  }
  
  // Otherwise, render a small button to manually check for notifications
  return errorOccurred ? (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={handleManualCheck}
        className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 shadow-md"
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "Verificando..." : "Verificar pendências"}
      </Button>
    </div>
  ) : null;
}
