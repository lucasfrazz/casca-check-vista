
import { useState } from "react";
import { Header } from "@/components/Header";
import { StoreSelector } from "@/components/StoreSelector";
import { DateSelector } from "@/components/DateSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChecklists } from "@/context/checklist";
import { stores } from "@/data/stores";
import { ChecklistType, Checklist } from "@/types";
import { checklistTemplates } from "@/data/checklistTemplates";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const { getChecklistsByStore, getChecklistsByDate } = useChecklists();
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hasResults, setHasResults] = useState<boolean>(false);
  const [groupedChecklists, setGroupedChecklists] = useState<Record<ChecklistType, boolean>>({} as Record<ChecklistType, boolean>);
  
  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
  };

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    
    if (selectedStore) {
      const storeChecklists = await getChecklistsByStore(selectedStore);
      const dateChecklists = await getChecklistsByDate(date);
      
      // Check if there are checklists for this store and date
      const filteredChecklists = storeChecklists.filter(cl => 
        dateChecklists.some(dc => dc.id === cl.id)
      );
      
      setHasResults(filteredChecklists.length > 0);
      
      // Update grouped checklists
      const grouped: Record<ChecklistType, boolean> = {} as Record<ChecklistType, boolean>;
      filteredChecklists.forEach(cl => {
        grouped[cl.type] = true;
      });
      setGroupedChecklists(grouped);
    }
  };

  const getChecklistTitle = (type: ChecklistType) => {
    const template = checklistTemplates.find(t => t.type === type);
    return template ? template.title : type;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Administração</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <StoreSelector 
              stores={stores} 
              onSelectStore={handleStoreSelect}
            />
          </div>
          
          {selectedStore && (
            <div>
              <DateSelector onSelectDate={handleDateSelect} />
            </div>
          )}
        </div>
        
        {selectedStore && selectedDate && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  Resultados para {stores.find(s => s.id === selectedStore)?.name || "Loja"}
                </CardTitle>
                <CardDescription>
                  Data: {new Date(selectedDate).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasResults ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Checklists Realizados:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.keys(groupedChecklists).map(type => (
                        <Card key={type} className="bg-green-50 border-green-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <span>{getChecklistTitle(type as ChecklistType)}</span>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="ml-2"
                                onClick={() => {
                                  // In a real app, you would navigate to a checklist details page
                                  navigate("/dashboard");
                                }}
                              >
                                Ver Detalhes
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Checklists Faltando:</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {checklistTemplates
                          .filter(template => !groupedChecklists[template.type])
                          .map(template => (
                            <Card key={template.type} className="bg-red-50 border-red-200">
                              <CardContent className="p-4">
                                <span>{template.title}</span>
                              </CardContent>
                            </Card>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      Nenhum checklist encontrado para esta loja e data.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
