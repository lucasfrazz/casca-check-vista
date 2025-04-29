
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useChecklists } from "@/context/ChecklistContext";
import { AlertTriangle } from "lucide-react";

export function PendingNotification() {
  const { getPendingActionPlans } = useChecklists();
  const [showNotification, setShowNotification] = useState(false);
  const [pendingPlans, setPendingPlans] = useState(0);
  const [maxDays, setMaxDays] = useState(0);

  useEffect(() => {
    // Check for pending plans on component mount
    const plans = getPendingActionPlans();
    if (plans.length > 0) {
      setPendingPlans(plans.length);
      
      // Find the maximum days pending
      const max = Math.max(...plans.map(plan => plan.daysPending));
      setMaxDays(max);
      
      // Show notification
      setShowNotification(true);
    }
  }, [getPendingActionPlans]);

  return (
    <Dialog open={showNotification} onOpenChange={setShowNotification}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Planos de Ação Pendentes
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-center">
            {pendingPlans === 1 ? (
              `Você possui ${pendingPlans} plano de ação pendente há ${maxDays} dia(s).`
            ) : (
              `Você possui ${pendingPlans} planos de ação pendentes, com o mais antigo há ${maxDays} dia(s).`
            )}
          </p>
          <p className="text-center text-muted-foreground mt-2">
            Por favor, resolva o mais rápido possível.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => setShowNotification(false)}>
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
