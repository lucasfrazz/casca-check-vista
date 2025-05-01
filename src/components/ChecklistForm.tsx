
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checklist, ChecklistItem } from "@/types";
import { AlertTriangle, Check, X, Camera, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { checklistTemplates } from "@/data/checklistTemplates";
import { useChecklists } from "@/context/checklist";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [showJustificationDialog, setShowJustificationDialog] = useState(false);
  const [showActionPlanDialog, setShowActionPlanDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTab, setCurrentTab] = useState("vistoria1");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage } = useChecklists();

  // Find the template title
  const template = checklistTemplates.find(t => t.type === checklist.type);
  const title = template ? template.title : "Checklist";

  useEffect(() => {
    // Clear image preview when dialog closes
    if (!showPhotoDialog) {
      setImagePreview(null);
    }
  }, [showPhotoDialog]);

  const handleItemStatus = (item: ChecklistItem, status: "sim" | "nao") => {
    setSelectedItem(item);
    
    if (status === "nao") {
      // Show justification dialog only for "nao" status
      setJustification("");
      setShowJustificationDialog(true);
    } else {
      // For "sim" status, open photo upload dialog
      setPhotoUrl("");
      setImagePreview(null);
      setShowPhotoDialog(true);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedItem) return;
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log("File preview generated:", result ? "success" : "failed");
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
    console.log("Starting file read for preview");
    
    setIsUploading(true);
    try {
      console.log("Starting upload for file:", file.name);
      // Upload the image
      const uploadedPhotoUrl = await uploadImage(file, checklist.id, selectedItem.id);
      console.log("Upload result:", uploadedPhotoUrl);
      
      if (uploadedPhotoUrl) {
        setPhotoUrl(uploadedPhotoUrl);
        onUpdateItem(selectedItem.id, "sim", undefined, uploadedPhotoUrl);
        toast({
          title: "Foto enviada",
          description: "A foto foi anexada ao item com sucesso",
        });
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTakePhoto = () => {
    // Trigger file input click to open camera or file picker
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    
    // Close justification dialog and open action plan dialog
    setShowJustificationDialog(false);
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
    setSelectedItem(null);
  };

  const handleDeferActionPlan = () => {
    toast({
      title: "Plano de Ação",
      description: "Você tem 2 dias para preencher o plano de ação",
    });
    setShowActionPlanDialog(false);
    setSelectedItem(null);
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

  // Filtrar itens para cada aba de vistoria
  const getVisitoriaItems = (vistoriaNumber: number) => {
    // Por enquanto, vamos dividir os itens em 3 partes iguais para as 3 abas
    const itemsPerVistoria = Math.ceil(checklist.items.length / 3);
    const startIndex = (vistoriaNumber - 1) * itemsPerVistoria;
    const endIndex = startIndex + itemsPerVistoria;
    return checklist.items.slice(startIndex, endIndex);
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
          <Tabs defaultValue="vistoria1" onValueChange={setCurrentTab} value={currentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vistoria1">Manhã</TabsTrigger>
              <TabsTrigger value="vistoria2">Tarde</TabsTrigger>
              <TabsTrigger value="vistoria3">Noite</TabsTrigger>
            </TabsList>
            
            {["vistoria1", "vistoria2", "vistoria3"].map((vistoria, index) => (
              <TabsContent key={vistoria} value={vistoria} className="space-y-4">
                {getVisitoriaItems(index + 1).map((item) => (
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
                              className="h-16 w-24 object-cover rounded border cursor-pointer"
                              onClick={() => {
                                setImagePreview(item.photoUrl || null);
                                setShowPhotoDialog(true);
                              }}
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
              </TabsContent>
            ))}
          </Tabs>
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

      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Justification Dialog */}
      <Dialog open={showJustificationDialog} onOpenChange={setShowJustificationDialog}>
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
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Evidência Fotográfica
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Anexe uma foto como evidência:</p>
            
            {isUploading ? (
              <div className="flex justify-center my-8">
                <Spinner />
                <span className="ml-2">Enviando foto...</span>
              </div>
            ) : (
              <>
                {imagePreview ? (
                  <div className="mt-4 flex justify-center">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-64 max-w-full object-contain rounded border"
                    />
                  </div>
                ) : (
                  <Button 
                    onClick={handleTakePhoto}
                    className="w-full py-8 flex flex-col items-center gap-2"
                  >
                    <Camera className="h-8 w-8" />
                    <span>Tirar Foto</span>
                  </Button>
                )}
              </>
            )}
            
            {photoUrl && !imagePreview && (
              <div className="mt-4 flex justify-center">
                <img 
                  src={photoUrl} 
                  alt="Evidência" 
                  className="max-h-48 object-contain rounded border"
                />
              </div>
            )}
          </div>
          {imagePreview && !isUploading && !photoUrl && (
            <DialogFooter>
              <Button onClick={() => setShowPhotoDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
