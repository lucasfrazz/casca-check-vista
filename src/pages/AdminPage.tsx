
import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPage = () => {
  const { getChecklistsByStore, getChecklistsByDate } = useChecklists();
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hasResults, setHasResults] = useState<boolean>(false);
  const [filteredChecklists, setFilteredChecklists] = useState<Checklist[]>([]);
  const [currentTab, setCurrentTab] = useState("morning");
  
  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
  };

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    
    if (selectedStore) {
      const storeChecklists = await getChecklistsByStore(selectedStore);
      const dateChecklists = await getChecklistsByDate(date);
      
      // Check if there are checklists for this store and date
      const filtered = storeChecklists.filter(cl => 
        dateChecklists.some(dc => dc.id === cl.id)
      );
      
      setFilteredChecklists(filtered);
      setHasResults(filtered.length > 0);
    }
  };

  const getChecklistTitle = (type: ChecklistType) => {
    const template = checklistTemplates.find(t => t.type === type);
    return template ? template.title : type;
  };

  const getChecklistsByPeriod = (period: string) => {
    // This is where we'd filter by period in a real app
    // For now, we'll just return all checklists
    return filteredChecklists;
  };
  
  const handleViewDetails = (checklistId: string) => {
    navigate(`/checklist/${checklistId}`);
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
                    <Tabs defaultValue="morning" value={currentTab} onValueChange={setCurrentTab}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="morning">Manhã</TabsTrigger>
                        <TabsTrigger value="afternoon">Tarde</TabsTrigger>
                        <TabsTrigger value="evening">Noite</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="morning" className="space-y-4 mt-4">
                        <h3 className="font-semibold">Checklists Realizados - Manhã:</h3>
                        {renderChecklistsByPeriod("morning")}
                      </TabsContent>
                      
                      <TabsContent value="afternoon" className="space-y-4 mt-4">
                        <h3 className="font-semibold">Checklists Realizados - Tarde:</h3>
                        {renderChecklistsByPeriod("afternoon")}
                      </TabsContent>
                      
                      <TabsContent value="evening" className="space-y-4 mt-4">
                        <h3 className="font-semibold">Checklists Realizados - Noite:</h3>
                        {renderChecklistsByPeriod("evening")}
                      </TabsContent>
                    </Tabs>
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

  function renderChecklistsByPeriod(period: string) {
    const checklists = getChecklistsByPeriod(period);
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {checklists.map(checklist => (
          <Card key={checklist.id} className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span>{getChecklistTitle(checklist.type)}</span>
                <Button 
                  size="sm"
                  variant="outline"
                  className="ml-2"
                  onClick={() => handleViewDetails(checklist.id)}
                >
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Missing checklists */}
        {checklistTemplates
          .filter(template => !checklists.some(cl => cl.type === template.type))
          .map(template => (
            <Card key={template.type} className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <span>{template.title}</span>
              </CardContent>
            </Card>
          ))
        }
      </div>
    );
  }
};

export default AdminPage;
