
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreSelector } from "@/components/StoreSelector";
import { stores } from "@/data/stores";
import { useChecklists } from "@/context/ChecklistContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LessonsPage = () => {
  const { getChecklistsByStore } = useChecklists();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
  };

  // Get all non-conforming items from store checklists
  const getNonConformingItems = (storeId: string) => {
    const storeChecklists = getChecklistsByStore(storeId);
    
    const nonConforming = storeChecklists.flatMap(checklist => 
      checklist.items
        .filter(item => item.status === "nao")
        .map(item => ({
          checklistType: checklist.type,
          date: checklist.date,
          description: item.description,
          justification: item.justification || "Sem justificativa",
          recurrenceCount: item.recurrenceCount,
          actionPlan: item.actionPlan?.description || "Sem plano de ação",
          actionPlanStatus: item.actionPlan?.status || "none"
        }))
    );
    
    return nonConforming;
  };

  const getChecklistTypeName = (type: string) => {
    switch (type) {
      case "reposicao-frente-loja": return "Reposição Frente de Loja";
      case "estoque-seco": return "Estoque Seco";
      case "cozinha-copa": return "Cozinha e Copa";
      case "banheiros": return "Banheiros";
      case "area-producao": return "Área de Produção";
      case "area-externa": return "Área Externa";
      default: return type;
    }
  };

  const nonConformingItems = selectedStore ? getNonConformingItems(selectedStore) : [];
  
  // Group non-conforming items by checklist type
  const groupedItems = nonConformingItems.reduce((acc, item) => {
    if (!acc[item.checklistType]) {
      acc[item.checklistType] = [];
    }
    acc[item.checklistType].push(item);
    return acc;
  }, {} as Record<string, typeof nonConformingItems>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Lições Aprendidas</h1>
        
        <div className="mb-6">
          <StoreSelector 
            stores={stores} 
            onSelectStore={handleStoreSelect}
          />
        </div>
        
        {selectedStore && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Lições Aprendidas - {stores.find(s => s.id === selectedStore)?.name || "Loja"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nonConformingItems.length > 0 ? (
                  <Tabs defaultValue={Object.keys(groupedItems)[0] || "all"}>
                    <TabsList className="mb-4">
                      {Object.keys(groupedItems).map(type => (
                        <TabsTrigger key={type} value={type}>
                          {getChecklistTypeName(type)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {Object.entries(groupedItems).map(([type, items]) => (
                      <TabsContent key={type} value={type}>
                        <div className="space-y-4">
                          {items.map((item, index) => (
                            <Card key={index} className="bg-gray-50">
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <h3 className="font-medium">{item.description}</h3>
                                    <span className="text-xs text-gray-500">
                                      {new Date(item.date).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Problema:</strong> {item.justification}
                                    </p>
                                    <p>
                                      <strong>Solução:</strong> {item.actionPlan}
                                    </p>
                                    <p>
                                      <strong>Status:</strong> 
                                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                        item.actionPlanStatus === "approved" ? "bg-green-100 text-green-800" :
                                        item.actionPlanStatus === "rejected" ? "bg-red-100 text-red-800" :
                                        item.actionPlanStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                                        "bg-gray-100 text-gray-800"
                                      }`}>
                                        {item.actionPlanStatus === "approved" ? "Aprovado" :
                                         item.actionPlanStatus === "rejected" ? "Rejeitado" :
                                         item.actionPlanStatus === "pending" ? "Pendente" :
                                         "Sem status"}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      Nenhuma lição aprendida encontrada para esta loja.
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

export default LessonsPage;
