
import { useState } from "react";
import { Header } from "@/components/Header";
import { StoreSelector } from "@/components/StoreSelector";
import { ChecklistCard } from "@/components/ChecklistCard";
import { stores } from "@/data/stores";
import { checklistTemplates } from "@/data/checklistTemplates";
import { useAuth } from "@/context/AuthContext";
import { useChecklists } from "@/context/ChecklistContext";
import { useNavigate } from "react-router-dom";
import { ChecklistType } from "@/types";
import { PendingNotification } from "@/components/PendingNotification";

const DashboardPage = () => {
  const { user } = useAuth();
  const { createChecklist } = useChecklists();
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // For collaborators, pre-select their store
  useState(() => {
    if (user?.role === "collaborator" && user.storeId) {
      setSelectedStore(user.storeId);
    }
  });

  // Get available stores based on user role
  const availableStores = user?.role === "admin" 
    ? stores 
    : stores.filter(store => store.id === user?.storeId);

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
  };

  const handleChecklistSelect = (type: ChecklistType) => {
    if (!selectedStore) return;
    
    try {
      const newChecklist = createChecklist(type, selectedStore);
      navigate(`/checklist/${newChecklist.id}`);
    } catch (error) {
      console.error("Error creating checklist:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PendingNotification />
      
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {(!selectedStore && availableStores.length > 0) && (
          <div className="mb-6">
            <StoreSelector 
              stores={availableStores} 
              onSelectStore={handleStoreSelect}
            />
          </div>
        )}
        
        {selectedStore && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Checklists Disponíveis</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {checklistTemplates.map((template) => (
                  <ChecklistCard 
                    key={template.type}
                    type={template.type}
                    storeId={selectedStore}
                    onSelect={handleChecklistSelect}
                  />
                ))}
              </div>
            </div>
            
            {user?.role === "admin" && (
              <div className="mt-8">
                <button 
                  className="text-blue-600 hover:underline"
                  onClick={() => setSelectedStore(null)}
                >
                  ← Voltar para a seleção de lojas
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
