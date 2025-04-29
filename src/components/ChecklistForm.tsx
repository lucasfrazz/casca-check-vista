
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checklist, ChecklistItem } from "@/types";
import { AlertTriangle, Check, X, Upload, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { checklistTemplates } from "@/data/checklistTemplates";

interface ChecklistFormProps {
  checklist: Checklist;
  onUpdateItem: (itemId: string, status: "sim" | "nao", justification?: string, photoUrl?: string) => void;
  onAddActionPlan: (itemId: string, description: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ChecklistForm({ checklist, onUpdateItem, onAddActionPlan, onSave, onCancel }: ChecklistFormProps) {
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [justification, setJustification] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [showActionPlanDialog, setShowActionPlanDialog] = useState(false);

  // Find the template title
  const template = checklistTemplates.find(t => t.type === checklist.type);
  const title = template ? template.title : "Checklist";

  const handleItemStatus = (item: ChecklistItem, status: "sim" | "nao") => {
    setSelectedItem(item);
    
    if (status === "nao") {
      // Show justification dialog
      setJustification("");
      setShowActionPlanDialog(true);
    } else {
      // For "sim" status, update immediately
      onUpdateItem(item.id, status);
      simulatePhotoUpload(item.id);
    }
  };

  const simulatePhotoUpload = (itemId: string) => {
    // In a real app, this would open a camera/file upload
    // For now we'll just simulate with a random photo URL
    const mockPhotoUrl = `https://source.unsplash.com/random/300x200?sig=${Date.now()}`;
    setPhotoUrl(mockPhotoUrl);
    
    setTimeout(() => {
      onUpdateItem(itemId, "sim", undefined, mockPhotoUrl);
      toast({
        title: "Foto enviada",
        description: "A foto foi anexada ao item com sucesso",
      });
    }, 1000);
  };

  const handleSubmitJustification = () => {
    if (!selectedItem) return;
    
    if (!justification) {
      toast({
        title: "Justificativa obrigatória",
        description: "Por favor, preencha uma justificativa para o item não conforme",
        variant: "destructive",
      });
      return;
    }
    
    onUpdateItem(selectedItem.id, "nao", justification);
    
    // Show action plan dialog
    setActionPlan("");
    setShowActionPlanDialog(true);
  };

  const handleSubmitActionPlan = () => {
    if (!selectedItem) return;
    
    if (!actionPlan) {
      toast({
        title: "Plano de ação obrigatório",
        description: "Por favor, descreva um plano de ação para resolver o problema",
        variant: "destructive",
      });
      return;
    }
    
    onAddActionPlan(selectedItem.id, actionPlan);
    setShowActionPlanDialog(false);
  };

  const handleDeferActionPlan = () => {
    toast({
      title: "Plano de Ação",
      description: "Você tem 2 dias para preencher o plano de ação",
    });
    setShowActionPlanDialog(false);
  };

  const getItemStatusColor = (item: ChecklistItem) => {
    if (item.status === null) return "bg-gray-100";
    if (item.status === "sim") return "bg-green-50 border-green-200";
    if (item.recurrenceCount >= 2) return "bg-red-50 border-red-200";
    return "bg-yellow-50 border-yellow-200";
  };

  const isFormComplete = () => {
    return checklist.items.every(item => item.status !== null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Preencha todos os itens do checklist
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checklist.items.map((item) => (
            <Card 
              key={item.id} 
              className={`${getItemStatusColor(item)} border p-4`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{item.description}</div>
                  
                  {item.status === "nao" && item.justification && (
                    <div className="text-sm text-red-600 mt-1">
                      Justificativa: {item.justification}
                    </div>
                  )}
                  
                  {item.timestamp && (
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                  
                  {item.recurrenceCount > 0 && (
                    <div className={`text-xs ${item.recurrenceCount >= 2 ? 'text-red-600' : 'text-yellow-600'} font-medium mt-1`}>
                      {item.recurrenceCount >= 2 
                        ? "Reincidência crítica!" 
                        : "Reincidência detectada"}
                    </div>
                  )}
                  
                  {item.status === "sim" && item.photoUrl && (
                    <div className="mt-2">
                      <img 
                        src={item.photoUrl} 
                        alt="Evidência" 
                        className="h-16 w-24 object-cover rounded border"
                      />
                    </div>
                  )}
                  
                  {item.actionPlan && (
                    <div className="text-xs bg-blue-50 p-2 rounded mt-2">
                      <div className="font-medium">Plano de ação:</div>
                      <div>{item.actionPlan.description}</div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.actionPlan.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          item.actionPlan.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.actionPlan.status === 'approved' ? 'Aprovado' : 
                           item.actionPlan.status === 'rejected' ? 'Rejeitado' : 
                           'Pendente'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {item.status === null && (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-green-50 hover:bg-green-100 border-green-200"
                      onClick={() => handleItemStatus(item, "sim")}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Sim
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-red-50 hover:bg-red-100 border-red-200"
                      onClick={() => handleItemStatus(item, "nao")}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Não
                    </Button>
                  </div>
                )}
                
                {item.status !== null && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'sim' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status === 'sim' ? 'Conforme' : 'Não conforme'}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={onSave} 
            disabled={!isFormComplete()}
          >
            Salvar Checklist
          </Button>
        </CardFooter>
      </Card>

      {/* Justification Dialog */}
      <Dialog open={selectedItem !== null && selectedItem.status !== "sim" && !showActionPlanDialog} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Justificativa Necessária
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Por favor, informe o motivo da não conformidade:</p>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Descreva o problema encontrado..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitJustification}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Plan Dialog */}
      <Dialog open={showActionPlanDialog} onOpenChange={setShowActionPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Plano de Ação
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Descreva um plano de ação para resolver este problema:</p>
            <Textarea
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              placeholder="Descreva as ações que serão tomadas..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={handleDeferActionPlan}>
              Deixar para depois
            </Button>
            <Button onClick={handleSubmitActionPlan}>
              Registrar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={photoUrl !== ""} onOpenChange={() => setPhotoUrl("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Foto
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Anexe uma foto como evidência:</p>
            {photoUrl && (
              <div className="mt-4 flex justify-center">
                <img 
                  src={photoUrl} 
                  alt="Preview" 
                  className="max-h-48 object-contain rounded border"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setPhotoUrl("")}>
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
