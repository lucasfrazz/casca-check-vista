
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ChecklistForm } from "@/components/ChecklistForm";
import { useChecklists } from "@/context/ChecklistContext";
import { Checklist } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

const ChecklistPage = () => {
  const { id } = useParams<{ id: string }>();
  const { checklists, updateChecklistItem, addActionPlan, saveChecklist } = useChecklists();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Find the checklist with the matching id
    const foundChecklist = checklists.find(cl => cl.id === id);
    if (foundChecklist) {
      setChecklist(foundChecklist);
    }
  }, [id, checklists]);

  const handleUpdateItem = (itemId: string, status: "sim" | "nao", justification?: string, photoUrl?: string) => {
    if (!checklist) return;
    updateChecklistItem(checklist.id, itemId, status, justification, photoUrl);
  };

  const handleAddActionPlan = (itemId: string, description: string) => {
    if (!checklist) return;
    addActionPlan(checklist.id, itemId, description);
  };

  const handleSaveChecklist = () => {
    if (!checklist) return;
    saveChecklist(checklist);
    navigate("/dashboard");
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (!checklist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-6 px-4">
          <Card>
            <CardContent className="py-10 text-center">
              <p>Checklist não encontrado.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <ChecklistForm
          checklist={checklist}
          onUpdateItem={handleUpdateItem}
          onAddActionPlan={handleAddActionPlan}
          onSave={handleSaveChecklist}
          onCancel={handleCancel}
        />
        
        <div className="mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
            <h3 className="font-medium text-blue-800 mb-2">Legenda:</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span>Verde: Item conforme</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                <span>Amarelo: Primeira reincidência</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                <span>Vermelho: Segunda reincidência ou mais</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChecklistPage;
