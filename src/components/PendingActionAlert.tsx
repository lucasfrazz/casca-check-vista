
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PendingActionAlertProps {
  daysCount: number;
  onClose: () => void;
}

export function PendingActionAlert({ daysCount, onClose }: PendingActionAlertProps) {
  const [showAlert, setShowAlert] = useState(true);
  const navigate = useNavigate();

  const handleViewAction = () => {
    setShowAlert(false);
    navigate("/action-plans");
    onClose();
  };

  const handleDismiss = () => {
    setShowAlert(false);
    onClose();
  };

  return (
    <Dialog open={showAlert} onOpenChange={setShowAlert}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex flex-col items-center gap-4">
            <Bell className="h-12 w-12 text-yellow-400" />
            <span className="text-2xl font-bold">Pendência em Aberto</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-center text-lg">
            Você possui uma pendência há {daysCount} dias.
          </p>
          <p className="text-center text-lg mt-1">
            Por favor, resolva para evitar bloqueio ou novas notificações.
          </p>
        </div>
        <DialogFooter className="flex sm:flex-row gap-4">
          <Button 
            className="flex-1 bg-blue-500 hover:bg-blue-600" 
            onClick={handleViewAction}
          >
            Ver Pendência
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleDismiss}
          >
            Atualizar Depois
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
